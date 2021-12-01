import {defs, tiny} from './examples/common.js';
const {vec3, vec4, color, hex_color, Mat4, Light, Shape, Material, Shader, Texture, Scene, Vector3} = tiny;
const {Triangle, Square, Tetrahedron, Windmill, Cube, Subdivision_Sphere, Torus, Textured_Phong} = defs;


//////////////////////////TAKEN FROM https://webglfundamentals.org/webgl/lessons/webgl-text-html.html///////////////////////////

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.querySelector("#canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }

  // look up the elements we want to affect
  var timeElement = document.querySelector("#time");
  // Create text nodes to save some time for the browser.
  var timeNode = document.createTextNode("");
  // Add those text nodes where they need to go
  timeElement.appendChild(timeNode);
  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["vertex-shader-3d", "fragment-shader-3d"]);
  var then = 0;
  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(clock) {
    // Convert to seconds
    clock *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = clock - then;
    // Remember the current time for the next frame.
    then = clock;
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // set the nodes
    timeNode.nodeValue = clock.toFixed(2);   // 2 decimal places
    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);
    requestAnimationFrame(drawScene);
  }
}
main();
////////////////////////////////////////////////////////////////////////////////////


export class FinalProject_Base extends Scene {
    constructor() {
        super();
        this.hover = this.swarm = false;
        this.shapes = {
            'box': new Cube(),
            'ball': new Subdivision_Sphere(4),
            'trackA': new TrackA(),
            'trackB': new TrackB(),
            'torus' : new defs.Torus(5, 15),
        };

        //
        this.hold = 0;

        // declare variable for 3rd person camera toggle
        this.third_person = false;

        // declare variable for map view, default false
        this.map_camera = false;

        // declare variable for camera rotation while turning (3rd person)
        this.camera_left = false;
        this.camera_right = false;
        this.camera_acceleration = 0.03;
        this.camera_velocity = 0;
        this.camera_position = 0;

        // declare movement variables
        this.forward = false;
        this.backward = false;
        this.left = false;
        this.right = false;
        this.acceleration = 0.03;
        this.velocity = 0;
        this.position = 0;
        this.natural_decceleration = 0.005;
        this.timer = 0;


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
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#000000")}),
            steering_wheel: new Material(new defs.Phong_Shader(),
                {ambient: .8, diffusivity: .8, specularity: .8, color: hex_color("#624a2e")}),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/license3.gif", "LINEAR_MIPMAP_LINEAR")
            }),
        };
    }

    make_control_panel() {
        this.new_line();
        this.new_line();
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
                this.forward = false;
                this.velocity += this.acceleration;
            }
            // apply backward acceleration
            if(this.backward)
            {
                this.backward = false;
                this.velocity -= this.acceleration;
            }
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
            
            // apply velocity to position
            this.position += this.velocity;
            this.camera_position += this.camera_velocity;

            // maximum camera_position: 1.5 TODO: bug - velocity still increasing
            if(this.camera_position > 1.5) this.camera_position = 1.5;
            else if(this.camera_position < -1.5) this.camera_position = -1.5;
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

        
        //create steering wheel
        let steering_wheel_transform = Mat4.identity().times(Mat4.translation(0, 1, -this.position)).times(Mat4.translation(0, 0.8, -1)).times(Mat4.scale(0.3, 0.3, 0.3));
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
        this.shapes.torus.draw(context, program_state, steering_wheel_transform, this.materials.steering_wheel);



        ////windshield
        //bottom
        let b_t = Mat4.identity();
        b_t = b_t.times(Mat4.translation(0, 0.5, -1.9)).times(Mat4.translation(0, 1, -this.position)).times(Mat4.scale(1, 0.1, 0.1));
        this.shapes.box.draw(context, program_state, b_t, this.materials.wheel);
        //side 1
        let l_t = Mat4.identity();
        l_t = l_t.times(Mat4.translation(-0.90, 1.1, -1.3)).times(Mat4.translation(0, 1, -this.position)).times(Mat4.rotation(Math.PI/2.0, 0, 0, 1)).times(Mat4.rotation(-Math.PI/4.0, 0, 1, 0)).times(Mat4.scale(0.8, 0.1, 0.1));
        this.shapes.box.draw(context, program_state, l_t, this.materials.wheel);
        //side_2
        let r_t = Mat4.identity();
        r_t = r_t.times(Mat4.translation(0.90, 1.1, -1.3)).times(Mat4.translation(0, 1, -this.position)).times(Mat4.rotation(Math.PI/2.0, 0, 0, 1)).times(Mat4.rotation(-Math.PI/4.0, 0, 1, 0)).times(Mat4.scale(0.8, 0.1, 0.1));
        this.shapes.box.draw(context, program_state, r_t, this.materials.wheel);
        //top
        let t_t = Mat4.identity();
        t_t = t_t.times(Mat4.translation(0, 1.7, -0.3)).times(Mat4.translation(0, 1, -this.position)).times(Mat4.scale(1, 0.1, 0.5));
        this.shapes.box.draw(context, program_state, t_t, this.materials.wheel);
        //back cab
        let b_c = Mat4.identity();
        b_c = b_c.times(Mat4.translation(0, 1, 0.1)).times(Mat4.translation(0, 1, -this.position)).times(Mat4.scale(1, 0.7, 0.1));
        this.shapes.box.draw(context, program_state, b_c, this.materials.wheel);

        //license plate
        let l_p = Mat4.identity();
        l_p = l_p.times(Mat4.translation(0, 0, 1.99)).times(Mat4.translation(0, 1, -this.position)).times(Mat4.scale(0.4, 0.2, 0.05));
        this.shapes.box.draw(context, program_state, l_p, this.materials.texture);

        // attach the camera to the car, attach in first or 
        // third person depending on the this.third_person variable set
        let camera_transform = Mat4.identity().times(Mat4.translation(0, 0, -this.position))
        // set debug option to unloock camera
        if(!this.unlock_camera)
        {
            if(!this.third_person)
                program_state.set_camera(Mat4.inverse(camera_transform).times(Mat4.translation(0, -2.2, -0.7)));
            else
                program_state.set_camera(Mat4.inverse(camera_transform
                    .times(Mat4.rotation(-Math.PI * .1 * this.camera_position, 0, 1, 0))
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