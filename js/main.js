import * as THREE from '/three.js-r170/build/three.module.js';
import { PointerLockControls } from '/three.js-r170/examples/jsm/controls/PointerLockControls.js';  
import Floor from '/js/scene.js';
import OverheadLights from '/js/lighting.js';    

let fov = 75;

// Set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

// Add renderer to the document
document.body.style.margin = '0';
document.body.appendChild( renderer.domElement );

// Set up scene
const scene = new THREE.Scene();

// Set up camera
const camera = new THREE.PerspectiveCamera( fov, window.innerWidth / window.innerHeight, 0.1, 1000 );

// Position camera
camera.position.set( -3, 0.5, 0 );
camera.lookAt( 0, 0, 0 );

// Set up controls
const controls = new PointerLockControls( camera, renderer.domElement );
controls.pointerSpeed = 0.5;


let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let sprint = false;
let toggleSprint = true;
let stationaryIsToggle = true;
let movementSpeed = 10;

const velocity = new THREE.Vector3(0, 0, 0);
const direction = new THREE.Vector3(0, 0, 0);


const onKeyDown = function ( event ) {
    switch ( event.code ) {
        case 'KeyW':
            moveForward = true;
            break;

        case 'KeyA':
            moveLeft = true;
            break;

        case 'KeyS':
            moveBackward = true;
            break;

        case 'KeyD':
            moveRight = true;
            break;

        case 'Space':
            if ( canJump === true ) velocity.y += 20;
            canJump = false;
            break;

        case 'ShiftLeft':
            if (toggleSprint && !stationaryIsToggle) {
                sprint = !sprint;
            }
            else if (toggleSprint && stationaryIsToggle) {
                sprint = true;
            }
            else {
                sprint = true;
            }
            break;
    }
};

const onKeyUp = function ( event ) {
    switch ( event.code ) {
        case 'KeyW':
            moveForward = false;
            break;

        case 'KeyA':
            moveLeft = false;
            break;

        case 'KeyS':
            moveBackward = false;
            break;

        case 'KeyD':
            moveRight = false;
            break;

        case 'ShiftLeft':
            if (!toggleSprint) {
                sprint = false;
            }
            break;
    }
};





const instructions = document.getElementById( 'instructions' );
const paused = document.getElementById( 'paused' );

// Enable pointer lock on click
instructions.addEventListener( 'click', () => {
    controls.lock();
} );

paused.addEventListener( 'click', () => {
    controls.lock();
} );

controls.addEventListener('lock', function () {
    instructions.style.display = 'none';
    paused.style.display = 'none';
    document.addEventListener( 'keydown', onKeyDown );
    document.addEventListener( 'keyup', onKeyUp );
} );

controls.addEventListener('unlock', function () {
    instructions.style.display = 'none';
    paused.style.display = 'flex';
    document.removeEventListener( 'keydown', onKeyDown );
    document.removeEventListener( 'keyup', onKeyUp );
    moveForward = moveBackward = moveLeft = moveRight = canJump = sprint = false;
} );

// Handle window resize
window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}, false );

// Set up clock for controls update
const clock = new THREE.Clock();

// Set up floor
const floor = new Floor();
scene.add( floor.mesh );

// Set up box
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
const boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
boxMesh.position.set(0, 0.5, -2);    
scene.add( boxMesh );


// Set up sphere
const sphereGeometry = new THREE.SphereGeometry(1);
const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphereMesh.position.set(0, 0.5, 2);
scene.add(sphereMesh);


// Set up lighting
const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
directionalLight.position.set(-2,2,0);
scene.add(directionalLight);

const dlighthelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(dlighthelper);

const overheadLights = new OverheadLights();
scene.add(overheadLights.light1);


function sprintLogic(delta) {
    movementSpeed = 80;

    console.log(velocity.length());

    if (velocity.length() !== 0 && direction.length() === 0 && toggleSprint && stationaryIsToggle) {
        sprint = false;
    }

    if (direction.length() === 0) {
        if (fov > 80) {
            fov = Math.max(fov - (200 * delta), 75);
            camera.fov = fov;
            camera.updateProjectionMatrix();
            console.log(fov);
        }
    }
    else {
        if (sprint) {
            movementSpeed = 150;
            if (fov < 90) {
                fov = Math.min(fov + (200 * delta), 90);
                camera.fov = fov;
                camera.updateProjectionMatrix();
                console.log(fov);
            }
        }
        else {
            if (fov > 80) {
                fov = Math.max(fov - (200 * delta), 75);
                camera.fov = fov;
                camera.updateProjectionMatrix();
                console.log(fov);
            }
        }
    }
}

// Animation loop
function animate() {

    // Schedule the next frame
    requestAnimationFrame( animate );

    // Update controls
    const delta = clock.getDelta();
    controls.update( delta );

    if (velocity.length() < 0.01) { 
        velocity.x = 0;
        velocity.z = 0;
    }

    velocity.x -= velocity.x * 30.0 * delta;
    velocity.z -= velocity.z * 30.0 * delta;

    // Movement controls
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); 

    


    sprintLogic(delta);

    if ( moveForward || moveBackward ) velocity.z += direction.z * movementSpeed * delta;
    if ( moveLeft || moveRight ) velocity.x += direction.x * movementSpeed * delta;

    controls.moveRight( velocity.x * delta );
    controls.moveForward( velocity.z * delta );


    // Render the scene
    renderer.render( scene, camera );
}


// Start animation loop

animate();

