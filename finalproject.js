import {defs, tiny} from './examples/common.js';
const {vec3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cylindrical_Tube, Cube, Subdivision_Sphere} = defs;

export class FinalProject_Base extends Scene {
    constructor() {
        super();
        this.hover = this.swarm = false;
        this.shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            // 'tree': new Cylindrical_Tube()
        };

        // declare variable for 3rd person camera toggle
        this.third_person = false;


        const phong = new defs.Phong_Shader();
        this.materials = {
            plastic: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .5, color: color(.9, .5, .9, 1)}),
            metal: new Material(phong,
                {ambient: .2, diffusivity: .8, specularity: .8, color: color(.9, .5, .9, 1)}),
            ground: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#e8e6e1")}),
            fence: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#8faefd")}),
            car: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#0000FF")}),
            tree: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#38ea32")}),
        };
    }

    make_control_panel() {
        this.new_line();
        this.new_line();
        this.key_triggered_button("Move Forward", ["w"], function () {
            // TODO
        });
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
            program_state.set_camera(Mat4.identity());
        }
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);
        const t = this.t = program_state.animation_time / 1000;
        const light_position = vec4(0, 50, 0, 0);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];
    }
}


export class FinalProject_Scene extends FinalProject_Base {
    display(context, program_state) {

        super.display(context, program_state);

        // draw the track 
        let track_transform = Mat4.identity();
        track_transform = track_transform.times(Mat4.translation(0, 0, -5)).times(Mat4.scale(5, .1, 20));
        this.shapes.box.draw(context, program_state, track_transform, this.materials.ground);
        track_transform = Mat4.identity();
        track_transform = track_transform.times(Mat4.translation(-15, 0, -20)).times(Mat4.scale(10, .1, 5));
        this.shapes.box.draw(context, program_state, track_transform, this.materials.ground);

        // draw fences
        let fence_transform = Mat4.identity();
        fence_transform = fence_transform.times(Mat4.translation(-5, 1, 5)).times(Mat4.scale(.01, 1, 20));
        this.shapes.box.draw(context, program_state, fence_transform, this.materials.fence);
        fence_transform = Mat4.identity().times(Mat4.translation(5, 1, 5)).times(Mat4.scale(.01, 1, 30));
        this.shapes.box.draw(context, program_state, fence_transform, this.materials.fence);
        fence_transform = Mat4.identity().times(Mat4.translation(-9, 1, -25)).times(Mat4.scale(14, 1, .01));
        this.shapes.box.draw(context, program_state, fence_transform, this.materials.fence);
        fence_transform = Mat4.identity().times(Mat4.translation(-14, 1, -15)).times(Mat4.scale(9, 1, .01));
        this.shapes.box.draw(context, program_state, fence_transform, this.materials.fence);

        // draw trees
        // let tree_transform = Mat4.identity();
        // tree_transform = tree_transform.times(Mat4.translation(0, 0, 20)).times(Mat4.scale(1, 5, 1));
        // this.shapes.tree.draw(context, program_state, tree_transform, this.materials.tree);

        // draw the car
        let car_transform = Mat4.identity();
        car_transform = car_transform.times(Mat4.translation(0, 1, 0)).times(Mat4.scale(1, .5, 2));
        this.shapes.box.draw(context, program_state, car_transform, this.materials.car);

        // attach the camera to the car, attach in first or 
        //third person depending on the this.third_person variable set
        if(!this.third_person)
            program_state.set_camera(car_transform.times(Mat4.translation(0, -4, 0)));
        else
            program_state.set_camera(car_transform.times(Mat4.translation(0, -9, -7)));

        const t = this.t = program_state.animation_time / 1000;
    }
}