import * as THREE from '/three.js-r170/build/three.module.js'; 
import OverheadLights from '/js/lighting.js';  
import { RigidBody } from '/js/objectSpawner.js'
import World from '/js/buildWorld.js'
import Player from '/js/player.js'




let gameWorld;          //  object that handles game environment (camera, renderer, physics initialisation)
let player;             //  object that handles player controls (listeners, movement, sprinting)

let gravityVector = new THREE.Vector3(0, -9.81, 0);     //  world gravity vector

const clock = new THREE.Clock();                        //  clock to keep animations synchronised

const instructions = document.getElementById( 'instructions' );     //  instructions menu
const paused = document.getElementById( 'paused' );                 //  pause menu





function animate() {

    requestAnimationFrame( animate );                       //  schedule next frame
    const delta = clock.getDelta();                         //  update delta
    gameWorld.physicsWorld.stepSimulation( delta, 10 );     //  update physics sim by delta

    // update rigid bodies mesh position according to physics simulation
    for (let i = 0; i < gameWorld.rigidBodies.length; ++i) {
        gameWorld.rigidBodies[i].rigidBody.motionState.getWorldTransform(gameWorld.tmpTransform);   // get world transform

        // extract position and rotation
        const pos = gameWorld.tmpTransform.getOrigin();
        const quat = gameWorld.tmpTransform.getRotation();
        const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
        const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());
        
        // update mesh position and roatation
        gameWorld.rigidBodies[i].mesh.position.copy(pos3);
        gameWorld.rigidBodies[i].mesh.quaternion.copy(quat3);
    }


    player.playerControls.updatePlayerMotion(gameWorld, delta);    //  move player according to user input

    

    gameWorld.renderer.render(gameWorld.scene, gameWorld.currentCamera );   //  render scene
}



function createSceneObjects() {

    const floorGeometry = new THREE.BoxGeometry(30, 1, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.x = -9
    floorMesh.position.y = -0.5;
    floorMesh.castShadow = false;
    floorMesh.receiveShadow = true;
    gameWorld.scene.add( floorMesh );

    // Set up box
    const boxGeometry = new THREE.BoxGeometry();
    const boxMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    boxMesh.position.set(0, 12.5, -0.5);    
    gameWorld.scene.add( boxMesh );


    const rbFloor = new RigidBody();
    rbFloor.createBox(new THREE.Vector3(30, 1, 10), 0, floorMesh.position, floorMesh.quaternion);
    rbFloor.body.setCollisionFlags(Ammo.btCollisionObject.CF_CHARACTER_OBJECT);
    gameWorld.physicsWorld.addRigidBody(rbFloor.body);

    const rbBox = new RigidBody();
    rbBox.createBox( new THREE.Vector3(1,1,1), 1, boxMesh.position, boxMesh.quaternion);
    rbBox.body.setCollisionFlags(Ammo.btCollisionObject.CF_CHARACTER_OBJECT);
    gameWorld.physicsWorld.addRigidBody(rbBox.body);

    gameWorld.rigidBodies.push({mesh: boxMesh, rigidBody: rbBox});
    gameWorld.rigidBodies.push({mesh: floorMesh, rigidBody: rbFloor});


    // Set up sphere
    const sphereGeometry = new THREE.SphereGeometry(1);
    const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphereMesh.position.set(0, 0.5, 2);
    gameWorld.scene.add(sphereMesh);


    // Set up lighting
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(-2,2,0);
    gameWorld.scene.add(directionalLight);

    const dlighthelper = new THREE.DirectionalLightHelper(directionalLight);
    gameWorld.scene.add(dlighthelper);

    const overheadLights = new OverheadLights();
    gameWorld.scene.add(overheadLights.light1);

}



async function main() {
    // load ammo
    const AmmoLib = await Ammo();
    Ammo = AmmoLib;

    // make new world and initialise physics
    gameWorld = new World(gravityVector);
    gameWorld.initPhysics();

    // make new player controls and add listeners
    const playerSpawnPosition = new THREE.Vector3(-5, 1, 0);
    const playerSpawnQuaternion = new THREE.Quaternion(0, 0, 0, 1);
    const playerSize = new THREE.Vector2(0.25, 0.5); // radius, height
    player = new Player(playerSpawnPosition, playerSize, playerSpawnQuaternion, gameWorld, instructions, paused);
    // spawn objects
    createSceneObjects();

    // start animation loop
    animate();
}

// Load and start game
main();
