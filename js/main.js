import * as THREE from '/three.js-r170/build/three.module.js';
import { PointerLockControls } from '/three.js-r170/examples/jsm/controls/PointerLockControls.js';  
import Floor from '/js/scene.js';
import OverheadLights from '/js/lighting.js';  
import { RigidBody } from '/js/objectSpawner.js'
// import initPhysics from '/js/initialisePhysics.js';


let currentCamera;


let firstPersonCamera;
let firstPersonCameraWalkFOV = 75;
let firstPersonCameraAspect = window.innerWidth / window.innerHeight;
let firstPersonCameraNear = 0.1;
let firstPersonCameraFar = 1000;

let secondCamera;

let fov;

let scene
let renderer;

let controls;

let gravityVector = new THREE.Vector3(0, -9.81, 0);

let gravity = -9.81; //delete this and use vector later

let physicsWorld;
let tmpTransform;
let rigidBodies; 

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = true;
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
            if ( canJump === true ) velocity.y = 10;
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


// Set up clock for controls update
const clock = new THREE.Clock();


function sprintLogic(delta) {
    movementSpeed = 80;
    fov = currentCamera.fov;

    if (velocity.length() !== 0 && direction.length() === 0 && toggleSprint && stationaryIsToggle) {
        sprint = false;
    }

    if (direction.length() === 0) {
        if (fov > 75) {
            fov = Math.max(fov - (200 * delta), 75);
            currentCamera.fov = fov;
            currentCamera.updateProjectionMatrix();
            console.log(fov);
        }
    }
    else {
        if (sprint) {
            movementSpeed = 150;
            if (fov < 90) {
                fov = Math.min(fov + (200 * delta), 90);
                currentCamera.fov = fov;
                currentCamera.updateProjectionMatrix();
                console.log(fov);
            }
        }
        else {
            if (fov > 75) {
                fov = Math.max(fov - (200 * delta), 75);
                currentCamera.fov = fov;
                currentCamera.updateProjectionMatrix();
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

    physicsWorld.stepSimulation( delta, 10 );

    for (let i = 0; i < rigidBodies.length; ++i) {
        rigidBodies[i].rigidBody.motionState.getWorldTransform(tmpTransform);

        const pos = tmpTransform.getOrigin();
        const quat = tmpTransform.getRotation();
        const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
        const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
        
        rigidBodies[i].mesh.position.copy(pos3);
        rigidBodies[i].mesh.quaternion.copy(quat3);

        console.log(pos.z());
    }

    if (velocity.length() < 0.01) { 
        velocity.x = 0;
        velocity.z = 0;
    }

    velocity.x -= velocity.x * 30.0 * delta;
    velocity.z -= velocity.z * 30.0 * delta;
    velocity.y += gravity * 5 * delta;


    // Movement controls
    direction.z = Number( moveForward ) - Number( moveBackward );
    direction.x = Number( moveRight ) - Number( moveLeft );
    direction.normalize(); 

    sprintLogic(delta);

    if ( moveForward || moveBackward ) velocity.z += direction.z * movementSpeed * delta;
    if ( moveLeft || moveRight ) velocity.x += direction.x * movementSpeed * delta;

    controls.moveRight( velocity.x * delta );
    controls.moveForward( velocity.z * delta );

    controls.object.position.y += velocity.y * delta ; 

    if ( controls.object.position.y < 0.5 ) {

        velocity.y = 0;
        controls.object.position.y = 0.511;
    };

    // Render the scene
    renderer.render( scene, currentCamera );
}



function initPhysics() {
    // Physics configuration would go here

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
    
    physicsWorld.setGravity( new Ammo.btVector3(gravityVector.x, gravityVector.y, gravityVector.z) );
    tmpTransform = new Ammo.btTransform();
}

function initGraphics() {
    // Set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    // Add renderer to the document
    document.body.style.margin = '0';
    document.body.appendChild( renderer.domElement );

    // Set up scene
    scene = new THREE.Scene();

    // Set up camera
    firstPersonCamera = new THREE.PerspectiveCamera( 
        firstPersonCameraWalkFOV, 
        firstPersonCameraAspect, 
        firstPersonCameraNear, 
        firstPersonCameraFar 
    );

    // Position camera
    firstPersonCamera.position.set( -3, 0.5, 0 );
    firstPersonCamera.lookAt( 0, 0, 0 );

    currentCamera = firstPersonCamera;

    // Set up controls
    controls = new PointerLockControls( currentCamera, renderer.domElement );
    controls.pointerSpeed = 0.5;

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
        currentCamera.aspect = window.innerWidth / window.innerHeight;
        currentCamera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
    }, false );

}

function createSceneObjects() {
    // Set up floor
    //const floor = new Floor();
    //scene.add( floor.mesh );

    const floorGeometry = new THREE.BoxGeometry(30, 1, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.x = -9
    floorMesh.position.y = -0.5;
    floorMesh.castShadow = false;
    floorMesh.receiveShadow = true;
    scene.add( floorMesh );

    // Set up box
    const boxGeometry = new THREE.BoxGeometry();
    const boxMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    boxMesh.position.set(0, 112.5, -2);    
    scene.add( boxMesh );

    const rbFloor = new RigidBody();
    rbFloor.createBox(new THREE.Vector3(30, 1, 10), 0, floorMesh.position, floorMesh.quaternion);
    physicsWorld.addRigidBody(rbFloor.body);

    const rbBox = new RigidBody();
    rbBox.createBox( new THREE.Vector3(30, 1, 10), 1, boxMesh.position, boxMesh.quaternion);
    physicsWorld.addRigidBody(rbBox.body);

    rigidBodies = [{mesh: boxMesh, rigidBody: rbBox}]


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

}



async function main() {
    const AmmoLib = await Ammo();   // Wait for Ammo to load
    Ammo = AmmoLib;

    initPhysics();
    initGraphics();
    createSceneObjects();
    animate();
}

main();

