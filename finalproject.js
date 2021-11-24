import {defs, tiny} from './examples/common.js';
const {vec3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene, Vector3} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere} = defs;

export class FinalProject_Base extends Scene {
    constructor() {
        super();
        this.hover = this.swarm = false;
        this.shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'trackA': new TrackA(),
            'trackB': new TrackB(),
        };

        // declare variable for 3rd person camera toggle
        this.third_person = false;

        // map view default false
        this.map_camera = false;

        // declare movement variables
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.acceleration = 0.03
        this.velocity = 0
        this.position = 0
        this.natural_decceleration = 0.005
        this.timer = 0


        // debug options
        this.unlock_camera = false;


        const phong = new defs.Phong_Shader();
        this.materials = {
            plastic: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .5, color: color(.9, .5, .9, 1)}),
            metal: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)}),
            ground: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#e8e6e1")}),
            car: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#0000FF")}),
            wheel: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000")})
        };
    }

    make_control_panel() {
        this.new_line();
        this.new_line();
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => this.forward = true);
        this.new_line();
        this.key_triggered_button("Move Backward", ["ArrowDown"], () => this.backward = true)
        this.new_line();
        this.key_triggered_button("Move Left", ["a"], function () {
            // TODO
        });
        this.new_line();
        this.key_triggered_button("Move Right", ["d"], function () {
            // TODO
        });
        this.new_line();
        this.key_triggered_button("Switch View", ["v"], function () {
            // TODO
        });
        this.new_line();
        this.key_triggered_button("Headlight On/Off", ["h"], function () {
            // TODO
        });
        this.new_line();
        this.key_triggered_button("Map", ["m"], () => this.map_camera = !this.map_camera );
        this.new_line();

        // pressing 'c' switches between third and first person camera, we achieve this by toggling the this.third_person variable
        this.key_triggered_button("Switch Camera View", ["c"], () => this.third_person = !this.third_person)

        this.new_line();

        // pressing 'u' locks and unlocks the camera to the car, for debug purposes
        this.key_triggered_button("[Debug] Unlock Camera", ["u"], () => this.unlock_camera = !this.unlock_camera)

    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.identity().times(Mat4.translation(0, -4, 0)));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 500);
        const t = this.t = program_state.animation_time / 1000;
        const angle = Math.sin(0);  // TODO: Math.sin(t)
        const light_position = Mat4.rotation(angle, 1, 0, 0).times(vec4(0, -1, 1, 0));
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}


export class FinalProject_Scene extends FinalProject_Base {
    display(context, program_state) {

        super.display(context, program_state);

        const t = this.t = program_state.animation_time / 1000, dt = program_state.animation_delta_time;
        // physics implementation, we want all our physics to be processed at 
        // the same intervals so we want to use dt to find a fixed physics framerate
        // for this demo we will process physics at 50 frames a second

        this.timer += dt
        if(this.timer > 20)
        {
            // process physics within here so physics is processed in fixed intervals
            this.timer -= 20
            // apply forward acceleration
            if(this.forward)
            {
                this.forward = false
                this.velocity += this.acceleration
            }
            // apply backward acceleration
            if(this.backward)
            {
                this.backward = false
                this.velocity -= this.acceleration
            }
            // apply natural decceleration
            // set velocity equal to 0 if small enough
            const epsilon = 0.001
            if(this.velocity < epsilon && this.velocity > -epsilon)
                this.velocity = 0;
            else if(this.velocity > 0)
                this.velocity -= this.natural_decceleration
            else if(this.velocity < 0)
                this.velocity += this.natural_decceleration
            
            // apply velocity to position
            this.position += this.velocity;
        }

        // draw trackA
        let trackA_transform = Mat4.identity();
        this.shapes.trackA.draw(context, program_state, trackA_transform, this.materials.ground);

        // draw trackB
        let trackB_transform = Mat4.identity().times(Mat4.translation(70,0,0));
        this.shapes.trackB.draw(context, program_state, trackB_transform, this.materials.ground);

        // draw the track 
        // let track_transform = Mat4.identity();
        // track_transform = track_transform.times(Mat4.translation(0, 0, -10)).times(Mat4.scale(5, .1, 20));
        // this.shapes.box.draw(context, program_state, track_transform, this.materials.ground);
        // track_transform = Mat4.identity();
        // track_transform = track_transform.times(Mat4.translation(-15, 0, -25)).times(Mat4.scale(10, .1, 5));
        // this.shapes.box.draw(context, program_state, track_transform, this.materials.ground);

        // draw the car
        let car_transform = Mat4.identity();
        car_transform = car_transform.times(Mat4.translation(0, 1, -this.position)).times(Mat4.scale(1, .5, 2));
        this.shapes.box.draw(context, program_state, car_transform, this.materials.car);

        //draw the wheels
        let wheel_1_transform = Mat4.identity();
        wheel_1_transform = wheel_1_transform.times(Mat4.translation(0, 1, -this.position)).times(Mat4.translation(-0.75, -0.4, -1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_1_transform, this.materials.wheel);
        let wheel_2_transform = Mat4.identity();
        wheel_2_transform = wheel_2_transform.times(Mat4.translation(0, 1, -this.position)).times(Mat4.translation(0.75, -0.4, -1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_2_transform, this.materials.wheel);
        let wheel_3_transform = Mat4.identity();
        wheel_3_transform = wheel_3_transform.times(Mat4.translation(0, 1, -this.position)).times(Mat4.translation(-0.75, -0.4, 1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_3_transform, this.materials.wheel);
        let wheel_4_transform = Mat4.identity();
        wheel_4_transform = wheel_4_transform.times(Mat4.translation(0, 1, -this.position)).times(Mat4.translation(0.75, -0.4, 1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_4_transform, this.materials.wheel);

        // attach the camera to the car, attach in first or 
        // third person depending on the this.third_person variable set
        let camera_transform = Mat4.identity().times(Mat4.translation(0, 0, -this.position))
        // set debug option to unloock camera
        if(!this.unlock_camera)
        {
            if(!this.third_person)
                program_state.set_camera(Mat4.inverse(camera_transform).times(Mat4.translation(0, -2, -1)));
            else
                program_state.set_camera(Mat4.inverse(camera_transform
                    .times(Mat4.rotation(-Math.PI * .05, 1, 0, 0))
                    .times(Mat4.translation(0, 2, 10))));
        }
        // map camera review
        if(this.map_camera){
            program_state.set_camera(Mat4.identity().times(Mat4.rotation(Math.PI/2.0 , 1, 0, 0)).times(Mat4.translation(0, -250, 0)));
        }

    }
}

class TrackA extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
          [5,0,-15], // 0
          [-5,0,-15],
          [5,0,10],
          [-5,0,10],
          [-10,0,15],
          [0,0,20], // 5
          [-10,0,25],
          [-35,0,15],
          [-35,0,25],
          [-45,0,20],
          [-40,0,10], // 10
          [-50,0,10],
          [-50,0,-15],
          [-40,0,-15],
          [-35,0,-20],
          [-45,0,-25],  // 15
          [-35,0,-30],
          [-10,0,-20],
          [-10,0,-30],
          [0,0,-25],
            // TODO fence
        );
        this.arrays.normal = Vector3.cast(
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
        );
        this.indices.push(
            0,1,2,
            1,2,3,
            2,3,5,
            3,5,4,
            5,4,6,
            4,6,7,
            6,7,8,
            7,8,9,
            9,7,11,
            7,11,10,
            11,10,12,
            10,12,13,
            12,13,15,
            13,15,14,
            15,14,16,
            14,16,17,
            16,17,18,
            17,18,19,
            19,17,0,
            17,0,1,
        )
    }
}

class TrackB extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [5,0,0], // 0
            [-5,0,0],
            [5,0,25],
            [-5,0,25],
            [-10,0,30],
            [0,0,35], // 5
            [-10,0,40],
            [-35,0,30],
            [-35,0,40],
            [-45,0,35],
            [-40,0,25], // 10
            [-50,0,25],
            [-50,0,0],
            [-40,0,0],
            [-35,0,-5],
            [-45,0,-10],  // 15
            [-10,5,-45],
            [0,5,-40],
            [-5,5,-50],
            [5,5,-50],
            [-5,5,-75],  // 20
            [5,5,-75],
            [0,5,-85],
            [-10,5,-80],
            [-10,5,-90],
            [-35,5,-80],  // 25
            [-35,5,-90],
            [-45,5,-85],
            [-40,5,-75],
            [-50,5,-75],
            [-40,5,-50],  // 30
            [-50,5,-50],
            [-45,5,-40],
            [-35,5,-45],
            [-15,5,-10],
            [-5,5,-15], // 35
            [-15,0,-10],
            [-5,0,-15],
            [0,0,-10],
            // TODO fence
        );
        this.arrays.normal = Vector3.cast(
            [0,1,0],  //0
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],  // 5
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0], // 10
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0], // 15
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0], // 20
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0], // 25
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0], // 30
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0],
            [0,1,0], // 35
            [0,1,0],
            [0,1,0],
            [0,1,0],
        );
        this.indices.push(
            0,1,2,
            1,2,3,
            2,3,5,
            3,5,4,
            5,4,6,
            4,6,7,
            6,7,8,
            7,8,9,
            9,7,11,
            7,11,10,
            11,10,12,
            10,12,13,
            12,13,15,
            13,15,14,
            15,14,16,
            14,16,17,
            16,17,18,
            17,18,19,
            18,19,20,
            19,20,21,
            20,21,23,
            21,23,22,
            23,22,24,
            24,23,26,
            23,26,25,
            26,25,27,
            25,27,28,
            27,28,29,
            28,29,30,
            29,30,31,
            30,31,33,
            31,33,32,
            33,32,35,
            32,35,34,
            35,34,37,
            34,37,36,
            37,36,38,
            36,38,1,
            38,1,0
        )
    }
}