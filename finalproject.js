import {defs, tiny} from './examples/common.js';
const {vec3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere} = defs;

export class FinalProject_Base extends Scene {
    constructor() {
        super();
        this.hover = this.swarm = false;
        this.shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4)
        };

        // declare variable for 3rd person camera toggle
        this.third_person = false;

        // declare movement variables
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.acceleration = 0.01
        this.velocity = 0
        this.position = 0
        this.natural_decceleration = 0.005
        this.timer = 0


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
        };
    }

    make_control_panel() {
        this.new_line();
        this.new_line();
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => this.forward = true);
        this.new_line();
        this.key_triggered_button("Move Backward", ["s"], function () {
            // TODO
        });
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
        this.key_triggered_button("Map", ["m"], function () {
            // TODO
        });
        this.new_line();

        // pressing 'c' switches between third and first person camera, we achieve this by toggling the this.third_person variable
        this.key_triggered_button("Switch Camera View", ["c"], () => this.third_person = !this.third_person)
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.identity().times(Mat4.translation(0, -4, 0)));
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);
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
            if(this.velocity > 0)
                this.velocity -= this.natural_decceleration
            else if(this.velocity < 0)
                this.velocity += this.natural_decceleration
            
            // apply velocity to position
            this.position += this.velocity
        }

        // draw the track 
        let track_transform = Mat4.identity();
        track_transform = track_transform.times(Mat4.translation(0, 0, -10)).times(Mat4.scale(5, .1, 20));
        this.shapes.box.draw(context, program_state, track_transform, this.materials.ground);
        track_transform = Mat4.identity();
        track_transform = track_transform.times(Mat4.translation(-15, 0, -25)).times(Mat4.scale(10, .1, 5));
        this.shapes.box.draw(context, program_state, track_transform, this.materials.ground);

        // draw the car
        let car_transform = Mat4.identity();
        car_transform = car_transform.times(Mat4.translation(0, 1, -this.position)).times(Mat4.scale(1, .5, 2));
        this.shapes.box.draw(context, program_state, car_transform, this.materials.car);

        // attach the camera to the car, attach in first or 
        // third person depending on the this.third_person variable set
        /*
        if(!this.third_person)
            program_state.set_camera(car_transform.times(Mat4.translation(0, -4, 0)));
        else
            program_state.set_camera(car_transform.times(Mat4.translation(0, -8, -7)));
            */

    }
}