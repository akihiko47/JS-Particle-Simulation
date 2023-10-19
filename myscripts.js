var canvas = document.getElementById("canvas");

let width = canvas.width
let height = canvas.height

let content = canvas.getContext('2d'); 

let G = 2000;

let particles = [];

let msPrev = window.performance.now()
let msPassed = 16 / 1000

class Particle {
    constructor(x, y, vx, vy, radius) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.ax = 0;
        this.ay = G;
        this.radius = radius;
    }
    
    update() {
        this.vx += this.ax * msPassed;
        this.vy += this.ay * msPassed;
        
        this.x += this.vx * msPassed; 
        this.y += this.vy * msPassed;

        this.handle_box_collision();
        this.handle_between_collision();
        this.draw();
    }

    draw() {
        content.beginPath();
        content.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        content.fillStyle = 'orange';
        content.fill();
    }

    handle_between_collision() {
    }

    handle_box_collision() {
        if (this.x - this.radius < 0){
            this.x = this.radius;
            this.vx = -this.vx;
        } else if (this.x + this.radius > width) {
            this.x = width - this.radius;
            this.vx = -this.vx;
        }
    
        if (this.y - this.radius < 0){
            this.y = this.radius;
            this.vy = -this.vy;
        } else if (this.y + this.radius > height) {
            this.y = height - this.radius;
            this.vy = -this.vy;
        }
    }
}

function add_particles() {
    for (let i = 0; i < 10; i++) {
        let x = Math.floor(Math.random() * width); 
        let y = Math.floor(Math.random() * height); 
        let vx = Math.floor((Math.random()-0.5) * 1000);
        let vy = Math.floor((Math.random()-0.5) * 500);
        let radius = 15; 
        
        particles.push(new Particle(x, y, vx, vy, radius));
    }
}


function main() { 
    let msNow = window.performance.now()

    content.clearRect(0, 0, width, height); 

    for (let particle of particles) {
        particle.update();
    }

    msPassed = (msNow - msPrev) / 1000
    document.getElementById("fps_p").innerHTML = "Frame time: " + (Math.round(msPassed * 10000)/10) + " ms"
    msPrev = msNow
    requestAnimationFrame(main); 
}

add_particles();
main();