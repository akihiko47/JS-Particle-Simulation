var canvas = document.getElementById("canvas");

let width = canvas.width;
let height = canvas.height;

let content = canvas.getContext('2d'); 

let G = 500;

let particles = [];

let msTotal = 0;
let msPrev = window.performance.now();
let msPassed = 16 / 1000;

let maxParticles = 1500; 
let nowParticles = 0;

let FramesCounter = 0;
let MaxFrames = 4;

let subSteps = 10;

let mouseX = 0;
let mouseY = 0;

// 0 - to bottom
// 1 - to center
// 2 - to mouse
let gravityMode = 1;

// 0 - box
// 1 - sphere
// 2 - borderless box
let mapMode = 1;

let borderSize = 30;

let grd = content.createLinearGradient(0, 0, 0, height);
grd.addColorStop(1, "#221f23");
grd.addColorStop(0, "#11151d");

// colors
let wallsColor = "#282a36"

// grid
grid_size_x = 80;
grid_size_y = Math.round(grid_size_x * 9 / 16);
let grid = [];
create_new_grid();

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
            Math.abs(Math.sin(nowParticles / 1200)) * 255 + "," +
            Math.abs(Math.cos(nowParticles / 1600)) * 255 + "," +
            Math.abs(Math.sin(nowParticles / 6000)) * 255 + ")";
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

        this.add_to_grid();
    }

    accelerate(acc_x, acc_y) {
        this.ax += acc_x;
        this.ay += acc_y;
    }

    add_to_grid() {
        let grid_x = Math.floor(this.x_now * grid_size_x / width);
        let grid_y = Math.floor(this.y_now * grid_size_y / height);

        if (grid_x >= 0 & grid_x < grid_size_x) {
            if (grid_y >= 0 & grid_y < grid_size_y) {
                grid[grid_y][grid_x].push(this);
            }
        }
    }
}

function check_grid() {
    for (let x = 1; x < grid_size_y - 1; x++) {
        for (let y = 1; y < grid_size_x - 1; y++) {

            let current_cell = grid[x][y];

            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    let other_cell = grid[x + dx][y + dy];
                    check_cells_collisions(current_cell, other_cell);
                }
            }
        }
    }
}

function create_new_grid() {
    grid = new Array(grid_size_y);
    for (let i = 0; i < grid_size_y; i++) {
        grid[i] = new Array(grid_size_x);
        for (let j = 0; j < grid_size_x; j++) {
            grid[i][j] = new Array();
        }
    }
}

function check_cells_collisions(cell_1, cell_2) {
    for (let particle1 of cell_1) {
        for (let particle2 of cell_2) {
            if (particle1 !== particle2) {
                handle_between_collision(particle1, particle2);
            }
        }
    }
}

function add_particles() {
    if (nowParticles < maxParticles) {
        if (FramesCounter < MaxFrames) {
            FramesCounter += 1;
        } else {
            let ax = 240000 * Math.cos(msTotal);
            let ay = 240000 * Math.abs(Math.sin(msTotal));
            particles.push(new Particle(width/2 + 100, height/4, ax, ay, Math.random()*3 + 8));
            particles.push(new Particle(width/2, height/4, ax, ay,  Math.random()*3 + 8));
            particles.push(new Particle(width/2 - 100, height/4, ax, ay,  Math.random()*3 + 8));
            nowParticles += 3;
            FramesCounter = 0;
        }
    }
}

function draw_particles() {
    for (let particle of particles) {
        content.beginPath();
	content.arc(particle.x_now, particle.y_now, particle.radius-1, 0, 2 * Math.PI, false);
	content.fillStyle = particle.color;
	content.fill();
    }
}


function apply_gravity() {
    for (let particle of particles) {
	if (gravityMode == 1 || gravityMode == 2) {
        let g_x = width / 2;
	    let g_y = height / 2;

        if (gravityMode == 2) {
            g_x = mouseX;
            g_y = mouseY;
        }
        
        let dir_x = g_x - particle.x_now;
        let dir_y = g_y - particle.y_now;       
        let dist = Math.sqrt(dir_x**2 + dir_y**2);      
        dir_x = dir_x / dist;
        dir_y = dir_y / dist;

        particle.accelerate(dir_x * G, dir_y * G);
	} else if (gravityMode == 0) {
	    particle.accelerate(0, G);
	}
    }
}

function update_positions(dt) {
    for (let particle of particles) {
        particle.update(dt);
    }
}

function apply_constraint() {

    content.fillStyle = wallsColor;
    content.fillRect(0, 0, width, height);

    if (mapMode == 0) {

        content.fillStyle = grd;
        content.fillRect(borderSize, borderSize, width - 2*borderSize, height - 2*borderSize);

        for (let particle of particles) {
            if (particle.x_now + particle.radius > width - borderSize) {
                particle.x_now = width - borderSize - particle.radius;
            }
            if (particle.x_now - particle.radius < borderSize) {
                particle.x_now = particle.radius + borderSize;
            }
            if (particle.y_now + particle.radius > height - borderSize) {
                particle.y_now = height - particle.radius - borderSize;
            }
            if (particle.y_now - particle.radius < borderSize) {
                particle.y_now = particle.radius + borderSize;
            }
        }
    } else if (mapMode == 1) {
        let cx = width / 2;
        let cy = height / 2;
        let c_radius = height / 2 - 50;

        content.beginPath();
        content.arc(cx, cy, c_radius, 0, 2 * Math.PI);
        content.fillStyle = grd;
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
    } else if (mapMode == 2) {
        content.fillStyle = grd;
        content.fillRect(0, 0, width, height);

    }
}

function handle_between_collision(particle1, particle2) {
    let col_axis_x = particle1.x_now - particle2.x_now;
    let col_axis_y = particle1.y_now - particle2.y_now;

    let dist = Math.sqrt(col_axis_x**2 + col_axis_y**2);

    if (dist < particle1.radius + particle2.radius) {
        let n_x = col_axis_x / dist;
        let n_y = col_axis_y / dist;

        let delta = particle1.radius + particle2.radius - dist;

        particle1.x_now += 0.5 * delta * n_x;
        particle1.y_now += 0.5 * delta * n_y;
        particle2.x_now -= 0.5 * delta * n_x;
        particle2.y_now -= 0.5 * delta * n_y;
    }
}

function update_input() {
    mapMode = parseInt(document.querySelector('input[name="map-mode"]:checked').value);
    gravityMode = parseInt(document.querySelector('input[name="gravity-mode"]:checked').value);
}

function reset() {
    particles = [];
    nowParticles = 0;
}

function getMousePosition(canvas, event) { 
    let rect = canvas.getBoundingClientRect(); 
    mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
} 

canvas.addEventListener("mousemove", function(e) 
        { 
            getMousePosition(canvas, e); 
        }); 

document.querySelector("#gravity-slider").oninput = function() {
    G = this.value;
}

document.querySelector("#max-slider").oninput = function() {
    maxParticles = this.value;
    document.getElementById("max-particles-p").innerHTML = "Max particles: " + maxParticles;
}

function main() { 
    let msNow = window.performance.now()

    content.clearRect(0, 0, width, height);


    for (let i = 0; i < subSteps; i++) {
        apply_gravity();
        apply_constraint();
        create_new_grid();
        update_positions(msPassed / subSteps);
        check_grid();
    }

    draw_particles();

    add_particles();
    update_input();

    msPassed = (msNow - msPrev) / 1000;
    msPrev = msNow;
    msTotal += msPassed;

    document.getElementById("fps_p").innerHTML = "Frame time: " + (Math.round(msPassed * 1000)) + " ms";
    document.getElementById("particles_p").innerHTML = "Particles: " + nowParticles;

    requestAnimationFrame(main); 
}

add_particles();
main();
