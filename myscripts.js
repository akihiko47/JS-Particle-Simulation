var canvas = document.getElementById("canvas");

let width = canvas.width
let height = canvas.height

let content = canvas.getContext('2d'); 

let G = 2000;

let particles = [];

let msPrev = window.performance.now()
let msPassed = 16 / 1000

class Particle {
    constructor(x, y, radius) {
        this.x_now = x;
        this.y_now = y;
        this.x_old = x;
        this.y_old = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = 0;
        this.ay = 0;
        this.radius = radius;
    }
    
    update(dt) {
        this.vx = this.x_now - this.x_old;
        this.vy = this.y_now - this.y_old;

        this.x_old = this.x_now;
        this.y_old = this.y_now;

        this.x_now = this.x_now + this.vx + this.ax * dt * dt;
        this.y_now = this.y_now + this.vy + this.ay * dt * dt;

        this.ax = 0;
        this.ay = 0;

        // this.handle_box_collision();
        // for (let i = 0; i < 3; i++) {
        //     this.handle_between_collision();
        // }
        this.draw();
    }

    draw() {
        content.beginPath();
        content.arc(this.x_now, this.y_now, this.radius, 0, 2 * Math.PI);
        content.fillStyle = 'orange';
        content.fill();
    }



    accelerate(acc_x, acc_y) {
        this.ax += acc_x;
        this.ay += acc_y;
    }

    handle_between_collision() {
        for (let particle of particles) {
            if (this === particle) {
                continue;
            }

            let dist = Math.sqrt((this.x - particle.x)**2 + (this.y - particle.y)**2);
            if (dist < this.radius + particle.radius) {
                console.log('Collision!');
                let angle = Math.atan2(particle.y - this.y, particle.x - this.x);
                let dist_to_move = this.radius + particle.radius - dist;

                particle.x += Math.cos(angle) * dist_to_move;
                particle.y += Math.sin(angle) * dist_to_move;


                let tan_v_x = particle.y - this.y;
                let tan_v_y = -(particle.x - this.x);

                
            }
        }
    }

    handle_box_collision() {
        if (this.x - this.radius < 0){
            this.x = this.radius;
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
        }
    
        if (this.y - this.radius < 0){
            this.y = this.radius;
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
        }
    }
}

function add_particles() {
    for (let i = 0; i < 3; i++) {
        let x = Math.floor(Math.random() * width); 
        let y = Math.floor(Math.random() * height); 
        let vx = Math.floor((Math.random()-0.5) * 1000);
        let vy = Math.floor((Math.random()-0.5) * 500);
        let radius = 45; 
        
        particles.push(new Particle(x, y, 45));
    }
}

function apply_gravity() {
    for (let particle of particles) {
        particle.accelerate(0, G);
    }
}

function update_positions() {
    for (let particle of particles) {
        particle.update(msPassed);
    }
}

function apply_constraint() {
    let cx = width / 2;
    let cy = height / 2;
    let c_radius = height / 2 - 100;

    for (let particle of particles) {
        let to_part_x = particle.x_now - cx;
        let to_part_y = particle.y_now - cy;
        let dist = Math.sqrt(to_part_x**2 + to_part_y**2);

        if (dist > c_radius - particle.radius) {
            nx = to_part_x / dist;
            ny = to_part_y / dist;
            
            particle.x_now = cx + nx * (c_radius - particle.radius);
            particle.y_now = cy + ny * (c_radius - particle.radius);
        }
    }
}


function main() { 
    let msNow = window.performance.now()

    content.clearRect(0, 0, width, height); 
    
    apply_gravity();
    apply_constraint();
    update_positions();

    msPassed = (msNow - msPrev) / 1000
    document.getElementById("fps_p").innerHTML = "Frame time: " + (Math.round(msPassed * 1000)) + " ms"
    msPrev = msNow
    requestAnimationFrame(main); 
}

add_particles();
main();