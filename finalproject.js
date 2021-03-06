import {defs, tiny} from './examples/common.js';
const {vec3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene, Vector, Vector3} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere, Torus, Textured_Phong} = defs;

import {Shape_From_File} from './examples/obj-file-demo.js';


export class FinalProject_Base extends Scene {
    constructor() {
        super();
        this.hover = this.swarm = false;
        this.shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'trackA': new TrackA(),
            'trackB': new TrackB(),
            'trackC': new TrackC(),
            'torus' : new defs.Torus(5, 15),
            "car": new Shape_From_File("assets/car.obj"),
            "square": new Square(),
            "text": new Text_Line(38),
            "score_table": new Cube(),
        };

        //
        this.hold = 0;

        //declare variables for score box
        this.start = false;
        this.end = false;
        this.score = 0;
        this.score_2 = 0;
        this.phrase = "";

        // declare variable for 3rd person camera toggle
        this.third_person = true;

        // declare variable for map view, default false
        this.map_camera = false;

        // declare variable for camera rotation while turning (3rd person)
        this.camera_left = false;
        this.camera_right = false;
        this.camera_acceleration = 0.03;
        this.camera_velocity = 0;
        this.camera_position = 0;

        // check on track
        this.is_on_track = true;

        // declare movement variables
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.acceleration = 0.01;
        this.gravity = -0.2;
        this.position = 0;
        this.velocity = 0;
        this.timer = 0;
        this.max_velocity = 0.6;
        this.natural_decceleration = 0.005;
        this.rotation_displacement = 0;
        this.rotation_velocity = Math.PI/120;
        this.pos_trans = Mat4.identity().times(Mat4.translation(0, 1, 0));

        // collision
        this.edge = false;

        document.addEventListener("keydown", this.key_down_handler.bind(this));
        document.addEventListener("keyup", this.key_up_handler.bind(this));

        // debug options
        this.unlock_camera = false;

        const phong = new defs.Phong_Shader();
        const texty = new defs.Textured_Phong(1);
        this.materials = {
            plastic: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .5, color: color(.9, .5, .9, 1)}),
            metal: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)}),
            track: new Material(new defs.Textured_Phong(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000"),
                    texture: new Texture("assets/road.gif", "LINEAR_MIPMAP_LINEAR")}),
            box: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#0000FF")}),
            car: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#FF0000")}),
            wheel: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000")}),
            steering_wheel: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#624a2e")}),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/license3.gif", "LINEAR_MIPMAP_LINEAR")
            }),
            side: new Material(new defs.Textured_Phong(),
            {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000"),
                texture: new Texture("assets/mountain.jpg", "LINEAR_MIPMAP_LINEAR")}),
            grass: new Material(new defs.Textured_Phong(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000"),
                    texture: new Texture("assets/grass.jpg", "LINEAR_MIPMAP_LINEAR")}),
            sky: new Material(new defs.Textured_Phong(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000"),
                    texture: new Texture("assets/sky.jpeg", "LINEAR_MIPMAP_LINEAR")}),
            grey: new Material(phong,
                {color: color(.5, .5, .5, 1), ambient: 0,
                    diffusivity: .3, specularity: .5, smoothness: 10}),
            text_image: new Material(texty,
                {ambient: 1, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/text.png")}),
        };
    }

    key_down_handler(event){
        console.log("Keydown " + event.key)
        if(event.key == "i")
            this.forward = true
        if(event.key == "k")
            this.backward = true
        if(event.key == "j")
            this.left = true
        if(event.key == "l")
            this.right = true
    }

    key_up_handler(event){
        console.log("Keyup " + event.key)
        if(event.key == "i")
            this.forward = false
        if(event.key == "k")
            this.backward = false
        if(event.key == "j")
            this.left = false
        if(event.key == "l")
            this.right = false
    }

    make_control_panel() {
        this.new_line();
        // the following commented code can be used to debug
        // this.live_string(box => box.textContent = "- pos_trans[0]: " +
        //     this.pos_trans[0][0].toFixed(2) + "," + this.pos_trans[0][1].toFixed(2) + "," + this.pos_trans[0][2].toFixed(2) + "," + this.pos_trans[0][3].toFixed(2));
        // this.new_line();
        // this.live_string(box => box.textContent = "- pos_trans[1]: " +
        //     this.pos_trans[1][0].toFixed(2) + "," + this.pos_trans[1][1].toFixed(2) + "," + this.pos_trans[1][2].toFixed(2) + "," + this.pos_trans[1][3].toFixed(2));
        // this.new_line();
        // this.live_string(box => box.textContent = "- pos_trans[2]: " +
        //     this.pos_trans[2][0].toFixed(2) + "," + this.pos_trans[2][1].toFixed(2) + "," + this.pos_trans[2][2].toFixed(2) + "," + this.pos_trans[2][3].toFixed(2));
        // this.new_line();
        // this.live_string(box => box.textContent = "- pos_trans[3]: " +
        //     this.pos_trans[3][0].toFixed(2) + "," + this.pos_trans[3][1].toFixed(2) + "," + this.pos_trans[3][2].toFixed(2) + "," + this.pos_trans[3][3].toFixed(2));
        // this.new_line();
        // this.new_line();
        this.live_string(box => box.textContent = "- Is on track: " + this.is_on_track);
        this.new_line();
        this.live_string(box => box.textContent = "- max_velocity: " + this.max_velocity);
        this.new_line()
        this.live_string(box => box.textContent = "- natural_decceleration: " + this.natural_decceleration);
        this.new_line()
        this.live_string(box => box.textContent = "- pos_trans_translation: " +
            this.pos_trans[0][3].toFixed(2) + "," +
            this.pos_trans[1][3].toFixed(2) + "," +
            this.pos_trans[2][3].toFixed(2));
        this.new_line();
        this.live_string(box => box.textContent = "- velocity: " + this.velocity.toFixed(2));
        this.new_line();
        this.new_line();
        /*
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => this.forward = true);
        this.new_line();
        this.key_triggered_button("Move Backward", ["ArrowDown"], () => this.backward = true)
        this.new_line();
        this.key_triggered_button("Move Left", ["ArrowLeft"], () => {
            this.left = true;
            this.camera_left = true;
        });
        this.new_line();
        this.key_triggered_button("Move Right", ["ArrowRight"], () => {
            this.right = true;
            this.camera_right = true;
        });
        */
        this.new_line();
        this.key_triggered_button("Map", ["m"], () => this.map_camera = !this.map_camera );
        this.new_line();
        // pressing 'c' switches between third and first person camera, we achieve this by toggling the this.third_person variable
        this.key_triggered_button("Switch Camera View", ["c"], () => this.third_person = !this.third_person)
        this.new_line();
        // pressing 'u' locks and unlocks the camera to the car, for debug purposes
        this.key_triggered_button("[Debug] Unlock Camera", ["u"], () => this.unlock_camera = !this.unlock_camera)
        this.new_line();
        this.key_triggered_button("Map 1", ["Control", "1"], () => this.pos_trans = Mat4.identity().times(Mat4.translation(0, 1, 0)));
        this.new_line();
        this.key_triggered_button("Map 2", ["Control", "2"], () => this.pos_trans = Mat4.identity().times(Mat4.translation(68, 1, 21)));
        this.new_line();
        this.key_triggered_button("Map 3", ["Control", "3"], () => this.pos_trans = Mat4.identity().times(Mat4.translation(-57, 1, -65)).times(Mat4.rotation(-Math.PI/2.0,0,1,0)));
    }


    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(new Game_Info(this.pos_trans));
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

        // adjust track, grass speed
        if(this.is_on_track) {
            this.max_velocity = 0.6;
            this.natural_decceleration = 0.005;
        }else{
            this.max_velocity = 0.3;
            this.natural_decceleration = 0.007;
        }

        this.timer += dt
        if(this.timer > 10)
        {
            // process physics within here so physics is processed in fixed intervals
            this.timer -= 10
            // apply forward acceleration
            if(this.forward)
            {
                if(Math.abs(this.velocity) < this.max_velocity)
                    this.velocity += this.acceleration;
            }
            // apply backward acceleration
            if(this.backward)
            {
                if(Math.abs(this.velocity) < this.max_velocity)
                    this.velocity -= this.acceleration;
            }

            if(this.left)
            {
                this.pos_trans = this.pos_trans.times(Mat4.rotation(this.rotation_velocity, 0, 1, 0))
            }

            if(this.right)
            {
                this.pos_trans = this.pos_trans.times(Mat4.rotation(-this.rotation_velocity, 0, 1, 0))
            }

            /*
            // apply camera_left acceleration
            if(this.camera_left)
            {
                this.camera_left = false;
                this.camera_velocity += this.camera_acceleration;
            }
            // apply camera_right acceleration
            if(this.camera_right)
            {
                this.camera_right = false;
                this.camera_velocity -= this.camera_acceleration;
            }
            */

            // apply natural decceleration
            // set velocity equal to 0 if small enough
            const epsilon = 0.001
            if(this.velocity < epsilon && this.velocity > -epsilon)
                this.velocity = 0;
            else if(this.velocity > 0)
                this.velocity -= this.natural_decceleration;
            else if(this.velocity < 0)
                this.velocity += this.natural_decceleration;

            // stop camera and rebound to 0
            /*
            if(this.camera_velocity < epsilon && this.camera_velocity > -epsilon)
            {
                this.camera_velocity = 0;
                // rebound camera position to 0
                if(this.camera_position < epsilon && this.camera_position > -epsilon)
                    this.camera_position = 0;
                else if(this.camera_position > 0)
                    // TODO: bug needed to be fix, -= 0.5* will go back and forth outside of (-epsilon,epsilon)
                    this.camera_position -= 5.0 * this.natural_decceleration;
                else if(this.camera_position < 0)
                    this.camera_position += 5.0 * this.natural_decceleration;
            }
            else if(this.camera_velocity > 0)
                this.camera_velocity -= this.natural_decceleration;
            else if(this.camera_velocity < 0)
                this.camera_velocity += this.natural_decceleration;
            */
            
            // apply velocity to position
            this.position += this.velocity;
            this.pos_trans = this.pos_trans.times(Mat4.translation(0, 0, -this.velocity));
            this.camera_position += this.camera_velocity;


            // ------ physics  ----------

            // gravity
            if(this.pos_trans[1][3]>1){
                this.pos_trans[1][3] += this.gravity;
            }

            // check if on track
            // trackC uphill
            if(this.pos_trans[2][3]>=-70 &&
                this.pos_trans[2][3]<=-60 &&
                this.pos_trans[0][3]>=-40 &&
                this.pos_trans[0][3]<=0)
            {
                this.is_on_track = true;
                if(!this.edge) {
                    // increase y
                    this.pos_trans[1][3] = 6 - 5.0 / -40.0 * this.pos_trans[0][3];
                    // rotate car
                    // this.pos_trans[0][0] = 1;
                    // this.pos_trans[1][1] = 1;
                    // this.pos_trans[2][2] = 1;
                    // //.times(Mat4.rotation(Math.PI/10.0,0,0,1)).times(Mat4.rotation(-Math.PI/2.0,0,1,0))
                }else{
                    this.velocity = -.5;
                }
            }
            // trackC top
            else if(this.pos_trans[2][3]>=-70 &&
                this.pos_trans[2][3]<=-60 &&
                this.pos_trans[0][3]>=0 &&
                this.pos_trans[0][3]<=20)
            {
                this.is_on_track = true;
                if(!this.edge) {
                    // increase y
                    this.pos_trans[1][3] = 6;
                }else{
                    this.velocity = -.5;
                }
            }
            // trackC bottom
            else if(this.pos_trans[2][3]>=-70 &&
                this.pos_trans[2][3]<=-60 &&
                this.pos_trans[0][3]>=0 &&
                this.pos_trans[0][3]<=20)
            {
                this.is_on_track = true;
            }
            // trackA
            else if(this.pos_trans[2][3]>=-30 &&
                    this.pos_trans[2][3]<=25 &&
                    this.pos_trans[0][3]>=-50 &&
                    this.pos_trans[0][3]<=5)
            {
                if((this.pos_trans[0][3]>=-40 &&
                    this.pos_trans[0][3]<=-5 &&
                    this.pos_trans[2][3]>=-20 &&
                    this.pos_trans[2][3]<=15))
                {
                    // grass inside track A
                    this.is_on_track = false;
                }else {
                    // on track
                    this.is_on_track = true;
                }
            }
            // trackB
            else if(this.pos_trans[2][3]>=-90 &&
                    this.pos_trans[2][3]<=40 &&
                    this.pos_trans[0][3]>=20 &&
                    this.pos_trans[0][3]<=75){
                if(this.pos_trans[2][3]>=-80 &&
                    this.pos_trans[2][3]<=-45 &&
                    this.pos_trans[0][3]>=30 &&
                    this.pos_trans[0][3]<=65)
                {
                    // top grass inside track B
                    this.is_on_track = false;
                }else  if(this.pos_trans[2][3]>=0 &&
                        this.pos_trans[2][3]<=30 &&
                        this.pos_trans[0][3]>=30 &&
                        this.pos_trans[0][3]<=65){
                    // bottom grass inside track B
                    this.is_on_track = false;
                }else{
                    // on track
                    this.is_on_track = true;
                }
            }
            // grass
            else {
                this.is_on_track = false;
            }

            // check edge
            if((this.pos_trans[0][3]>=-50 &&
                this.pos_trans[0][3]<=30 &&
                this.pos_trans[2][3]<=-50 &&
                this.pos_trans[2][3]>=-60)||
                (this.pos_trans[0][3]>=-50 &&
                this.pos_trans[0][3]<=30 &&
                this.pos_trans[2][3]<=-70 &&
                this.pos_trans[2][3]>=-80)||
                (this.pos_trans[0][3]>=20 &&
                this.pos_trans[0][3]<=30 &&
                this.pos_trans[2][3]<=-50 &&
                this.pos_trans[2][3]>=-80))
            {
                this.edge = true;
            }
            else{
                this.edge = false;
            }

            // ------------------------------------


            /*
            // maximum camera_position: 1.5 TODO: bug - velocity still increasing
            if(this.camera_position > 1.5) this.camera_position = 1.5;
            else if(this.camera_position < -1.5) this.camera_position = -1.5;
            */
        }

        // draw world's side
        let world_transform_front = Mat4.identity().times(Mat4.translation(0,170,-150)).times(Mat4.scale(200,200,200));
        this.shapes.square.draw(context, program_state, world_transform_front, this.materials.side);
        let world_transform_back = Mat4.identity().times(Mat4.translation(0,170,150)).times(Mat4.scale(200,200,200));
        this.shapes.square.draw(context, program_state, world_transform_back, this.materials.side);
        let world_transform_left = Mat4.identity().times(Mat4.translation(150,170,0)).times(Mat4.scale(200,200,200)).times(Mat4.rotation(Math.PI/2.0,0,1,0));
        this.shapes.square.draw(context, program_state, world_transform_left, this.materials.side);
        let world_transform_right = Mat4.identity().times(Mat4.translation(-150,170,0)).times(Mat4.scale(200,200,200)).times(Mat4.rotation(Math.PI/2.0,0,1,0));
        this.shapes.square.draw(context, program_state, world_transform_right, this.materials.side);
        // draw world's ground
        let world_transform_bottom = Mat4.identity().times(Mat4.translation(0,-1,0)).times(Mat4.scale(200,200,200)).times(Mat4.rotation(Math.PI/2.0,1,0,0));
        this.shapes.square.draw(context, program_state, world_transform_bottom, this.materials.grass);
        // draw world's top
        let world_transform_top = Mat4.identity().times(Mat4.translation(0,201,0)).times(Mat4.scale(200,200,200)).times(Mat4.rotation(Math.PI/2.0,1,0,0));
        this.shapes.square.draw(context, program_state, world_transform_top, this.materials.sky);

        // draw trackA
        let trackA_transform = Mat4.identity();
        this.shapes.trackA.draw(context, program_state, trackA_transform, this.materials.track);

        // draw trackB
        let trackB_transform = Mat4.identity().times(Mat4.translation(70,0,0));
        this.shapes.trackB.draw(context, program_state, trackB_transform, this.materials.track);

        // draw trackC
        let trackC_transform = Mat4.identity().times(Mat4.translation(-10,0,-60));
        this.shapes.trackC.draw(context, program_state, trackC_transform, this.materials.track);

        // draw the car
        let position_transform = this.pos_trans;
        // let car_transform = position_transform.times(Mat4.scale(1, .5, 2));
        // this.shapes.box.draw(context, program_state, car_transform, this.materials.box);
        let car_transform = position_transform.times(Mat4.translation(0,0.8,0)).times(Mat4.scale(1.5,1.5,1.5));
        this.shapes.car.draw(context, program_state, car_transform.times(Mat4.rotation(Math.PI/2.0, 0, 1,0)), this.materials.car);

        // draw second car
        let car2_transform = Mat4.identity();
        car2_transform = car2_transform.times(Mat4.translation(72, 1, 20))
        this.shapes.box.draw(context, program_state, car2_transform.times(Mat4.scale(1,.5,2)), this.materials.box);

        //draw the wheels
        let wheel_1_transform = car2_transform.times(Mat4.translation(-0.75, -0.4, -1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_1_transform, this.materials.wheel);
        let wheel_2_transform = car2_transform.times(Mat4.translation(0.75, -0.4, -1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_2_transform, this.materials.wheel);
        let wheel_3_transform = car2_transform.times(Mat4.translation(-0.75, -0.4, 1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_3_transform, this.materials.wheel);
        let wheel_4_transform = car2_transform.times(Mat4.translation(0.75, -0.4, 1.45)).times(Mat4.scale(0.25, 0.5, 0.5));
        this.shapes.ball.draw(context, program_state, wheel_4_transform, this.materials.wheel);


        //create steering wheel
        let steering_wheel_transform = car2_transform.times(Mat4.translation(0, 0.8, -1)).times(Mat4.scale(0.3, 0.3, 0.3));
        let steering_wheel2_transform = position_transform.times(Mat4.translation(0, 0.8, -1)).times(Mat4.scale(0.3, 0.3, 0.3));
        /*
        if (this.left) {
                let tot = dt;
                let cont =+ tot;
                steering_wheel_transform = steering_wheel_transform.times(Mat4.rotation(-Math.PI/2.0*cont, 0, 0, 1));
                if (cont >= 10) {
                        this.left = false;
                        this.hold = 0;
                        cont = 0;
                }
        }
        if (this.right) {
                let tot = dt;
                let cont =+ tot;
                steering_wheel_transform = steering_wheel_transform.times(Mat4.rotation(Math.PI/2.0, 0, 0, 1));
                if (cont >= 10) {
                        this.right = false;
                        this.hold = 0;
                        cont = 0;
                }
        }
        */
        this.shapes.torus.draw(context, program_state, steering_wheel_transform, this.materials.steering_wheel);
        this.shapes.torus.draw(context, program_state, steering_wheel2_transform, this.materials.steering_wheel);



        ////windshield
        //bottom
        let b_t = car2_transform.times(Mat4.translation(0, 0.5, -1.9)).times(Mat4.scale(1, 0.1, 0.1));
        this.shapes.box.draw(context, program_state, b_t, this.materials.wheel);
        //side 1
        let l_t = car2_transform.times(Mat4.translation(-0.90, 1.1, -1.3)).times(Mat4.rotation(Math.PI/2.0, 0, 0, 1)).times(Mat4.rotation(-Math.PI/4.0, 0, 1, 0)).times(Mat4.scale(0.8, 0.1, 0.1));
        this.shapes.box.draw(context, program_state, l_t, this.materials.wheel);
        //side_2
        let r_t = car2_transform.times(Mat4.translation(0.90, 1.1, -1.3)).times(Mat4.rotation(Math.PI/2.0, 0, 0, 1)).times(Mat4.rotation(-Math.PI/4.0, 0, 1, 0)).times(Mat4.scale(0.8, 0.1, 0.1));
        this.shapes.box.draw(context, program_state, r_t, this.materials.wheel);
        //top
        let t_t = car2_transform.times(Mat4.translation(0, 1.7, -0.3)).times(Mat4.scale(1, 0.1, 0.5));
        this.shapes.box.draw(context, program_state, t_t, this.materials.wheel);
        //back cab
        let b_c = car2_transform.times(Mat4.translation(0, 1, 0.1)).times(Mat4.scale(1, 0.7, 0.1));
        this.shapes.box.draw(context, program_state, b_c, this.materials.wheel);

        //license plate
        let l_p = car2_transform.times(Mat4.translation(0, 0, 1.99)).times(Mat4.scale(0.4, 0.2, 0.05));
        this.shapes.box.draw(context, program_state, l_p, this.materials.texture);

        // attach the camera to the car, attach in first or 
        // third person depending on the this.third_person variable set
        let camera_transform = position_transform.times(Mat4.translation(0, -1, 0));

        let score_transform = Mat4.identity();

        // set debug option to unloock camera
        if(!this.unlock_camera)
        {
            if(!this.third_person) {
                program_state.set_camera(Mat4.inverse(camera_transform).times(Mat4.translation(0, -2.2, -0.7)));
                score_transform = camera_transform.times(Mat4.translation(0, 5.2, -12.7)).times(Mat4.scale(1, 1, 0.01));
            }
            else {
                program_state.set_camera(Mat4.inverse(camera_transform
                    .times(Mat4.rotation(-Math.PI * .05, 1, 0, 0))
                    .times(Mat4.translation(0, 2, 10))));
            }
        }
        // map camera review
        if(this.map_camera){
            program_state.set_camera(Mat4.identity().times(Mat4.rotation(Math.PI/2.0 , 1, 0, 0)).times(Mat4.translation(0, -200, 20)));
        }

        if(this.third_person) {
            score_transform = camera_transform.times(Mat4.translation(0, 5, -2)).times(Mat4.scale(1, 1, 0.1));
        }

///////////This creates a score box that follows the car
        //create score box
        //this.shapes.score_table.draw(context, program_state, score_transform, this.materials.grey);

        //var hold_score = this.score.toFixed(2);
        var n = this.score.toFixed(2).toString();
        let strings = ["Score = " + "n"];

        //strings for score box
        if (this.start == false) {
            if(this.end == false){
                let strings = ["Score = " + "n"];
            }
        }
        else if (this.start == true) {
            if (this.end == false) {
                let strings = ["Score = " + "n"];
            }
            else if (this.end == true) {
                let strings = ["Congrats, you win!", "Final Score = " + "n"];
            }
        }



//////////////This should be create text on a box, but shader is having trouble with text demo code from Text_Line
//         for (let i = 0; i < 3; i++)
//             for (let j = 0; j < 2; j++) {             // Find the matrix for a basis located along one of the cube's sides:
//                 let cube_side = Mat4.rotation(i == 0 ? Math.PI / 2 : 0, 1, 0, 0)
//                     .times(Mat4.rotation(Math.PI * j - (i == 1 ? Math.PI / 2 : 0), 0, 1, 0))
//                     .times(Mat4.translation(-.9, .9, 1.01));

//                 const multi_line_string = strings[2 * i + j].split('\n');
//                 // Draw a Text_String for every line in our string, up to 30 lines:
//                 for (let line of multi_line_string.slice(0, 30)) {             // Assign the string to Text_String, and then draw it.
//                     this.shapes.text.set_string(line, context.context);
//                     this.shapes.text.draw(context, program_state, score_transform.times(cube_side).times(Mat4.scale(.03, .03, .03)), this.text_image);
//                     // Move our basis down a line.
//                     cube_side.post_multiply(Mat4.translation(0, -.06, 0));
//                 }
//             }

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
        this.arrays.texture_coord = Vector.cast(
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
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
            [-10,0,-45],
            [0,0,-40],
            [-5,0,-50],
            [5,0,-50],
            [-5,0,-75],  // 20
            [5,0,-75],
            [0,0,-85],
            [-10,0,-80],
            [-10,0,-90],
            [-35,0,-80],  // 25
            [-35,0,-90],
            [-45,0,-85],
            [-40,0,-75],
            [-50,0,-75],
            [-40,0,-50],  // 30
            [-50,0,-50],
            [-45,0,-40],
            [-35,0,-45],
            [-15,0,-10],
            [-5,0,-15], // 35
            [-15,0,-10],
            [-5,0,-15],
            [0,0,-10],
            // [5,0,0], // 0
            // [-5,0,0],
            // [5,0,25],
            // [-5,0,25],
            // [-10,0,30],
            // [0,0,35], // 5
            // [-10,0,40],
            // [-35,0,30],
            // [-35,0,40],
            // [-45,0,35],
            // [-40,0,25], // 10
            // [-50,0,25],
            // [-50,0,0],
            // [-40,0,0],
            // [-35,0,-5],
            // [-45,0,-10],  // 15
            // [-10,5,-45],
            // [0,5,-40],
            // [-5,5,-50],
            // [5,5,-50],
            // [-5,5,-75],  // 20
            // [5,5,-75],
            // [0,5,-85],
            // [-10,5,-80],
            // [-10,5,-90],
            // [-35,5,-80],  // 25
            // [-35,5,-90],
            // [-45,5,-85],
            // [-40,5,-75],
            // [-50,5,-75],
            // [-40,5,-50],  // 30
            // [-50,5,-50],
            // [-45,5,-40],
            // [-35,5,-45],
            // [-15,5,-10],
            // [-5,5,-15], // 35
            // [-15,0,-10],
            // [-5,0,-15],
            // [0,0,-10],
            // TODO fence
        );
        this.arrays.texture_coord = Vector.cast(
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],  // 9
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],  // 19
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],  // 29
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],  // 39
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

class TrackC extends Shape {
    constructor() {
        super("position", "color");
        this.arrays.position = Vector3.cast(
            [10,5,0],
            [30,5,0],
            [30,5,-10],
            [10,5,-10],
            [-30,0,0],
            [-30,0,-10],
            [-50,0,-10],
            [-50,0,0],
            [10,0,-10],  // 8
            [30,0,-10],  // 9
            [30,0,0],  // 10
            [10,0,0],  //11
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
            [0,0,1],
            [0,0,1],
            [0,0,1],
            [0,0,1],
        );
        this.arrays.texture_coord = Vector.cast(
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
        );
        this.indices.push(
            1,0,2,
            0,2,3,
            3,0,4,
            4,3,5,
            5,4,6,
            4,6,7,
            5,8,3,
            8,3,9,
            3,9,2,
            9,2,1,
            1,9,10,
            10,1,11,
            1,11,0,
            11,0,4,
        )
    }
}

class Game_Info extends FinalProject_Base{
    //control panel to start and stop game
    make_control_panel() {
        this.new_line();
        this.live_string(box => box.textContent = "Score: " +
            this.score_2.toFixed(2));
        this.new_line();
        this.new_line();
        this.new_line();
        this.key_triggered_button("Start Race", ["g"], () => this.start = true)
        this.new_line();
        this.key_triggered_button("End Race", ["h"], () => this.end = true)
        this.new_line(); this.new_line(); this.new_line(); this.new_line(); this.new_line();
        this.live_string(box => box.textContent = this.phrase);
    }
    display(context, program_state) {

        super.display(context, program_state);

        const t = this.t = program_state.animation_time / 1000, dt = program_state.animation_delta_time;

//////Calculate start and stop score
        if (this.start == true) {
            if(this.end == false) {
                this.score_2 += ((this.score*1000)+dt)/1000;
            }
        }

/////Give a final score
        if (this.start == true) {
            if (this.end == true) {
                this.phrase = ["Congrats, you win! Final Score = " + this.score_2.toFixed(2).toString() + " seconds."];
            }
        }
        else{
                this.phrase = "";
        }

    }
}




export class Text_Line extends Shape {
    constructor(max_size) {
        super("position", "normal", "texture_coord");
        this.max_size = max_size;
        var object_transform = Mat4.identity();
        for (var i = 0; i < max_size; i++) {                                       // Each quad is a separate Square instance:
            defs.Square.insert_transformed_copy_into(this, [], object_transform);
            object_transform.post_multiply(Mat4.translation(1.5, 0, 0));
        }
    }

    set_string(line, context) {           // set_string():  Call this to overwrite the texture coordinates buffer with new
        // values per quad, which enclose each of the string's characters.
        this.arrays.texture_coord = [];
        for (var i = 0; i < this.max_size; i++) {
            var row = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) / 16),
                col = Math.floor((i < line.length ? line.charCodeAt(i) : ' '.charCodeAt()) % 16);

            var skip = 3, size = 32, sizefloor = size - skip;
            var dim = size * 16,
                left = (col * size + skip) / dim, top = (row * size + skip) / dim,
                right = (col * size + sizefloor) / dim, bottom = (row * size + sizefloor + 5) / dim;

            this.arrays.texture_coord.push(...Vector.cast([left, 1 - bottom], [right, 1 - bottom],
                [left, 1 - top], [right, 1 - top]));
        }
        if (!this.existing) {
            this.copy_onto_graphics_card(context);
            this.existing = true;
        } else
            this.copy_onto_graphics_card(context, ["texture_coord"], false);
    }
}