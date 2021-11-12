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
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-2, -4, -35));
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
        let model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(0, 0, -10)).times(Mat4.scale(5, .1, 20));
        this.shapes.box.draw(context, program_state, model_transform, this.materials.ground);
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(-15, 0, -25)).times(Mat4.scale(10, .1, 5));
        this.shapes.box.draw(context, program_state, model_transform, this.materials.ground);
        model_transform = Mat4.identity();
        model_transform = model_transform.times(Mat4.translation(0, 1, 0)).times(Mat4.scale(1, .5, 2));
        this.shapes.box.draw(context, program_state, model_transform, this.materials.car);
        const t = this.t = program_state.animation_time / 1000;
    }
}