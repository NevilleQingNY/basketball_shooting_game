import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as CANNON from 'cannon-es';
import { createGround, createWalls, createBasketball, createHoopWithSegments, createHoopNet, createBasketballBoard, createSupportPlatform, createScoreDetector, createBench, createDecorations, createLargePlatform } from './createObject.js'

// 1. Renderer setup
const renderer = new THREE.WebGLRenderer();
document.querySelector('.container').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth * 0.75, window.innerHeight * 0.9);


// 2. Create the scene and set Light
const scene = new THREE.Scene();
// Change background color to sky blue
scene.background = new THREE.Color(0x87CEEB);

// Enable shadow mapping in the renderer for shadow effects
renderer.shadowMap.enabled = true;

// Ambient light setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

// Directional lights setup
const frontLight = createDirectionalLight(-5, 8, 10, true);
const rightLight = createDirectionalLight(15, 8, 0, true);
const leftLight = createDirectionalLight(-15, 8, 0, false);
const topLight = createDirectionalLight(0, 15, 0, true);
const backLight = createDirectionalLight(5, 8, -10, false);

// Add lights to the scene
scene.add(frontLight);
scene.add(rightLight);
scene.add(leftLight);
scene.add(topLight);
scene.add(backLight);

// Function to create directional lights
function createDirectionalLight(x, y, z, castShadow) {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(x, y, z);
  light.castShadow = castShadow;

  if (castShadow) {
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 50;
    light.shadow.camera.left = -20;
    light.shadow.camera.right = 20;
    light.shadow.camera.top = 20;
    light.shadow.camera.bottom = -20;
  }

  return light;
}

// Button event listeners
document.querySelector('.front-light-btn').addEventListener('click', () => switchLight(frontLight));
document.querySelector('.right-light-btn').addEventListener('click', () => switchLight(rightLight));
document.querySelector('.top-light-btn').addEventListener('click', () => switchLight(topLight));
document.querySelector('.reset-light-btn').addEventListener('click', () => resetLights());

// Function to switch light and shadow
function switchLight(activeLight) {
  [frontLight, rightLight, topLight, leftLight, backLight].forEach(light => {
    light.intensity = (light === activeLight) ? 1 : 0.5;
    light.castShadow = (light === activeLight);
  });
}

function resetLights() {
    // Set all lights to their default low intensity and disable shadows
    [rightLight, topLight, leftLight, backLight].forEach(light => {
      light.intensity = 0.8;
      light.castShadow = false
    });

    frontLight.castShadow = true;
  }

// 3. Create the physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0); // Earth gravity

// 4. Camera setup
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.minDistance = 1;
controls.maxDistance = 500;
controls.maxPolarAngle = Math.PI / 2;

const cameraPositions = {
    front: { position: new THREE.Vector3(0, 5, 10), lookAt: new THREE.Vector3(0, 0, 0), fov: 75 },
    top: { position: new THREE.Vector3(0, 15, 0), lookAt: new THREE.Vector3(0, 0, 0), fov: 75 },
    left: { position: new THREE.Vector3(-5, 5, 5), lookAt: new THREE.Vector3(0, 0, 10), fov: 80 }
};

function switchCameraView(view) {
    if (cameraPositions[view]) {
        const { position, lookAt, fov } = cameraPositions[view];
        camera.position.set(position.x, position.y, position.z);
        camera.lookAt(lookAt.x, lookAt.y, lookAt.z);

        camera.fov = fov;
        camera.updateProjectionMatrix();
    }
}

document.querySelector('.front-view-btn').addEventListener('click', () => {
    switchCameraView('front')
})
document.querySelector('.top-view-btn').addEventListener('click', () => {
    switchCameraView('top')
})
document.querySelector('.side-view-btn').addEventListener('click', () => {
    switchCameraView('left')
})

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case '1':
            switchCameraView('front');
            break;
        case '2':
            switchCameraView('top');
            break;
        case '3':
            switchCameraView('left');
            break;
        case 'q':
            if (!gameStart) return
            createAndAddBasketball();
            break;
        case ' ':
            startGame(gameDuration);
    }
});

let basketballCreateTime = 0;
let basketballCreateDebounceTime = 300;
let basketballArray = []
let gameStart = false;
let score = 0;
let historyScore = [];
let gameDuration = 15;
let startBtn = document.querySelector('.start');
let countDownNum = document.querySelector('.countdown');
let currentScoreNum = document.querySelector('.score');
currentScoreNum.innerHTML = score;
countDownNum.innerHTML = gameDuration < 10 ? '0' + gameDuration : gameDuration;


startBtn.addEventListener('click', () => {
    startGame(gameDuration)
})



function startGame(duration) {
    if (gameStart) return 
    startBtn.disabled = true
    startBtn.classList.add('disabled')
    gameStart = true;
    score = 0;
    currentScoreNum.innerHTML = score;
    let timer = duration;
    const interval = setInterval(() => {

        timer--
        let content = timer < 0 ? '00' : timer < 10 ? '0' + timer : timer;
        countDownNum.innerHTML = content
        if (timer < 0) {
            clearInterval(interval);
            gameStart = false;
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            countDownNum.innerHTML = gameDuration < 10 ? '0' + gameDuration : gameDuration;
            historyScore.push(score)
            currentScoreNum.innerHTML = score;
            showFinalScore(score)
            while (basketballArray.length) {
                const { mesh, body } = basketballArray.shift();
                scene.remove(mesh);
                world.removeBody(body);
            }
            updateScoreList()
        }
    }, 1000)
}

function updateScoreList() {
    const scoresList = document.querySelector('.scores-list');
    scoresList.innerHTML = '';
    historyScore = historyScore.sort((a, b) => b - a)
    historyScore.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score}`;
        scoresList.appendChild(li);
    });
}


document.querySelector('.start').addEventListener('click', () => {
    gameStart = true
})
// 5.1 create basketball and shooting basketball logic
function createAndAddBasketball() {
    const currentTime = Date.now();
    if (currentTime - basketballCreateTime < basketballCreateDebounceTime) return
    basketballCreateTime = currentTime
    const basketball = createBasketball(world, scene, physicsObjects)
    basketballArray.push(basketball)
    basketball.body.addEventListener('collide', function (event) {
        const collidedBody = event.body;
        if (collidedBody === scoreDetectorBody && gameStart) {
            score++
            currentScoreNum.innerHTML = score;
            triggerParticleEffect()
        }
    })
}

function showFinalScore(score) {
    const scorePopup = document.getElementById('scorePopup');
    const finalScore = document.getElementById('finalScore');

    finalScore.textContent = score;

    scorePopup.style.display = 'block';
    scorePopup.style.animation = 'fadeInOut 2s';

    scorePopup.addEventListener('animationend', () => {
        scorePopup.style.display = 'none';
        scorePopup.style.animation = '';
    });
}



let isChargingShooting = false;
let chargeStartTime;
let minShootingForce = 200;
let maxShootingForce = 500;
let throwAngleDegrees = 60;
let chargeMaxDuration = 1000;

document.addEventListener('keydown', (event) => {
    if (!gameStart) return
    if (event.key === 'k' && basketballArray.length && !isChargingShooting) {
        isChargingShooting = true
        chargeStartTime = performance.now();
    }
});

document.addEventListener('keyup', (event) => {
    if (!gameStart) return
    if (event.key === 'k' && basketballArray.length) {
        isChargingShooting = false;
        const chargeDuration = Math.min(performance.now() - chargeStartTime, chargeMaxDuration);
        shootBall(chargeDuration);
    }
});


function shootBall(chargeDuration) {
    const basketballBody = basketballArray.shift().body;

    const forceMagnitude = Math.min(minShootingForce + (chargeDuration / chargeMaxDuration) * (maxShootingForce - minShootingForce), maxShootingForce);
    const throwAngleRadians = throwAngleDegrees * (Math.PI / 180);
    const forceX = 0;
    const forceZ = - forceMagnitude * Math.sin(throwAngleRadians);

    basketballBody.applyForce(new CANNON.Vec3(forceX, forceMagnitude, forceZ), basketballBody.position);
}

function triggerParticleEffect() {
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];
    const color = new THREE.Color();

    for (let i = 0; i < particleCount; i++) {
        positions.push(0, 3.96, -6); // Particle initial position

        velocities.push({
            x: (Math.random() - 0.5) * 0.5,
            y: (Math.random() - 0.5) * 0.5,
            z: (Math.random() - 0.5) * 0.5,
        });
    }

    const colors = [
        0xffd700, // Gold
        0xff4500, // OrangeRed
        0x1e90ff, // DodgerBlue
        0x32cd32, // LimeGreen
        0xff69b4, // HotPink
        0x00ffff, // Aqua
        0x9400d3, // DarkViolet
        0xff6347, // Tomato
        0xffff00, // Yellow
        0x00ff00  // Lime
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    particles.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ size: 0.05, color: color.setHex(randomColor) });
    const particleSystem = new THREE.Points(particles, material);

    scene.add(particleSystem);

    function updateParticles() {
        const positions = particles.attributes.position.array;

        let alive = false;

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += velocities[i].x;
            positions[i * 3 + 1] += velocities[i].y;
            positions[i * 3 + 2] += velocities[i].z;

            velocities[i].y -= 0.01; // Simulate gravity

            if (positions[i * 3 + 1] > 0) alive = true;
        }

        particles.attributes.position.needsUpdate = true;

        if (alive) {
            requestAnimationFrame(updateParticles);
        } else {
            scene.remove(particleSystem);
        }
    }

    updateParticles();
}




const physicsObjects = [];

createGround(world, scene, physicsObjects);
createWalls(world, scene, physicsObjects);
createSupportPlatform(world, scene, physicsObjects);
const { body: scoreDetectorBody } = createScoreDetector(world, scene, physicsObjects);
createHoopWithSegments(world, scene, physicsObjects);
createHoopNet(world, scene, physicsObjects);
createBasketballBoard(world, scene, physicsObjects);
createLargePlatform(world, scene, physicsObjects)
createBench(world, scene, physicsObjects);

createDecorations(scene);


// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Update physics world
    world.step(1 / 60);

    // Sync Three.js meshes with Cannon.js bodies
    physicsObjects.forEach(({ mesh, body }) => {
        mesh.position.copy(body.position);
        mesh.quaternion.copy(body.quaternion);
    });

    // Render the scene
    renderer.render(scene, camera);
}

animate();
