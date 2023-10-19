var canvas = document.getElementById("canvas");

let width = canvas.width
let height = canvas.height

let content = canvas.getContext('2d'); 

let G = 50;

let particles = [];

let msTotal = 0
let msPrev = window.performance.now()
let msPassed = 16 / 1000

let maxParticles = 2000
let nowParticles = 0
let FramesCounter = 0;
let MaxFrames = 2;

class Particle {
    constructor(x, y, ax, ay, radius) {
        this.x_now = x;
        this.y_now = y;
        this.x_old = x;
        this.y_old = y;
        this.vx = 0;
        this.vy = 0;
        this.ax = ax;
        this.ay = ay;
        this.radius = radius;
        this.color = "rgb(" +
                    Math.random() * 255 + "," +
                    Math.random() * 255 + "," +
                    Math.random() * 255 + ")";
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

        this.draw();
    }

    draw() {
        content.beginPath();
        content.arc(this.x_now, this.y_now, this.radius-1, 0, 2 * Math.PI);
        content.fillStyle = this.color;
        content.fill();
    }



    accelerate(acc_x, acc_y) {
        this.ax += acc_x;
        this.ay += acc_y;
    }
}

function add_particles() {
    if (nowParticles < maxParticles) {
        if (FramesCounter < MaxFrames) {
            FramesCounter += 1;
        } else {
            let ax = 6000 * Math.cos(msTotal);
            let ay = 6000 * Math.abs(Math.sin(msTotal));
            particles.push(new Particle(width/2 + 100, height/4, ax, ay, 10));
            particles.push(new Particle(width/2, height/4, ax, ay, 10));
            particles.push(new Particle(width/2 - 100, height/4, ax, ay, 10));
            nowParticles += 3;
            FramesCounter = 0;
        }
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
    let c_radius = height / 2 - 50;

    content.beginPath();
    content.arc(cx, cy, c_radius, 0, 2 * Math.PI);
    content.fillStyle = 'gray';
    content.fill();

    for (let particle of particles) {
        let to_part_x = particle.x_now - cx;
        let to_part_y = particle.y_now - cy;
        let dist = Math.sqrt(to_part_x**2 + to_part_y**2);

        if (dist >= c_radius - particle.radius) {
            nx = to_part_x / dist;
            ny = to_part_y / dist;
            
            particle.x_now = cx + nx * (c_radius - particle.radius);
            particle.y_now = cy + ny * (c_radius - particle.radius);
        }
    }
}

function handle_between_collision() {
    for (let particle1 of particles) {
        for (let particle2 of particles) {
            if (particle1 === particle2) {
                continue;
            }
    
            let dist = Math.sqrt((particle1.x_now - particle2.x_now)**2 + (particle1.y_now - particle2.y_now)**2);
            if (dist < particle1.radius + particle2.radius) {
    
                let angle = Math.atan2(particle2.y_now - particle1.y_now, particle2.x_now - particle1.x_now);
                let dist_to_move = particle1.radius + particle2.radius - dist;
    
                particle2.x_now += 0.5 * Math.cos(angle) * dist_to_move;
                particle2.y_now += 0.5 * Math.sin(angle) * dist_to_move;
    
                particle1.x_now -= 0.5 * Math.cos(angle) * dist_to_move;
                particle1.y_now -= 0.5 * Math.sin(angle) * dist_to_move;
    
                
            }
        }
    }
}


function main() { 
    let msNow = window.performance.now()

    content.clearRect(0, 0, width, height); 
    
    apply_gravity();
    apply_constraint();
    handle_between_collision();
    update_positions();

    add_particles();

    msPassed = (msNow - msPrev) / 1000;
    msPrev = msNow;
    msTotal += msPassed;

    document.getElementById("fps_p").innerHTML = "Frame time: " + (Math.round(msPassed * 1000)) + " ms";
    document.getElementById("particles_p").innerHTML = "Particles: " + nowParticles;

    requestAnimationFrame(main); 
}

add_particles();
main();