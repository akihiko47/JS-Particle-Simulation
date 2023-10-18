var canvas = document.getElementById("canvas");

let width = canvas.width
let height = canvas.height

let content = canvas.getContext('2d'); 

let drag = 0.8;
let G = 2;

let particles = [];

let msPrev = window.performance.now()

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
        this.vx += this.ax;
        this.vy += this.ay;
        
        this.x += this.vx; 
        this.y += this.vy;

        this.handle_box_collision();
        this.draw();
    }

    draw() {
        content.beginPath();
        content.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        content.fillStyle = 'orange';
        content.fill();
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
    
        if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
            this.vx = -drag*this.vx;
        }
        if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
            this.vy = -drag* this.vy;
            this.vx = drag * this.vx;
        }
    }
}

function add_particles() {
    for (let i = 0; i < 2000; i++) {
        let x = Math.floor(Math.random() * width); 
        let y = Math.floor(Math.random() * height); 
        let vx = Math.floor((Math.random()-0.5) * 100);
        let vy = Math.floor((Math.random()-0.5) * 50);
        let radius = 15; 
        
        particles.push(new Particle(x, y, vx, vy, radius));
    }
}


function main() { 
    const msNow = window.performance.now()

    content.clearRect(0, 0, width, height); 

    for (let particle of particles) {
        particle.update();
    }

    const msPassed = msNow - msPrev
    console.log(msPassed)
    msPrev = msNow
    requestAnimationFrame(main); 
}

add_particles();
main();