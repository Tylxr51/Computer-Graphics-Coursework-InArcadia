import * as THREE from '/three.js-r170/build/three.module.js'; 
import OverheadLights from '/js/lighting.js';  
import { RigidBody } from '/js/objectSpawner.js'
import Level from '/js/levelEnvironment.js'
import { MainMainMenu, LevelsMainMenu, SettingsMainMenu } from '/js/menus.js'


let mainMenu;
let levelsMenu;
let settingsMenu;


function createSceneObjects(level) {

    const floorGeometry = new THREE.BoxGeometry(30, 0.5, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.x = -9
    floorMesh.position.y = -0.5;
    floorMesh.castShadow = false;
    floorMesh.receiveShadow = true;
    level.gameWorld.scene.add( floorMesh );

    // Set up box
    const boxGeometry = new THREE.BoxGeometry();
    const boxMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    boxMesh.position.set(0, 2.5, 0);    
    level.gameWorld.scene.add( boxMesh );


    const rbFloor = new RigidBody();
    rbFloor.createBox(new THREE.Vector3(30, 0.5, 10), 0, floorMesh.position, floorMesh.quaternion);
    rbFloor.body.setCollisionFlags(Ammo.btCollisionObject.CF_STATIC_OBJECT);
    level.gameWorld.physicsWorld.addRigidBody(rbFloor.body);

    const rbBox = new RigidBody();
    rbBox.createBox( new THREE.Vector3(1,1,1), 1, boxMesh.position, boxMesh.quaternion);
    rbBox.body.setCollisionFlags(Ammo.btCollisionObject.CF_CHARACTER_OBJECT);
    level.gameWorld.physicsWorld.addRigidBody(rbBox.body);

    level.gameWorld.rigidBodies.push({mesh: boxMesh, rigidBody: rbBox});
    level.gameWorld.rigidBodies.push({mesh: floorMesh, rigidBody: rbFloor});


    // Set up lighting
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(-1,1,0);
    level.gameWorld.scene.add(directionalLight);

    const dlighthelper = new THREE.DirectionalLightHelper(directionalLight);
    level.gameWorld.scene.add(dlighthelper);

    const overheadLights = new OverheadLights();
    level.gameWorld.scene.add(overheadLights.light1);

}

function createSceneObjectstemp(level) {

    const floorGeometry = new THREE.BoxGeometry(30, 0.5, 10);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff});
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    floorMesh.position.x = -9
    floorMesh.position.y = -0.5;
    floorMesh.castShadow = false;
    floorMesh.receiveShadow = true;
    level.gameWorld.scene.add( floorMesh );

    // Set up box
    const boxGeometry = new THREE.BoxGeometry();
    const boxMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    const boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
    boxMesh.position.set(0, 2.5, 0);    
    level.gameWorld.scene.add( boxMesh );


    const rbFloor = new RigidBody();
    rbFloor.createBox(new THREE.Vector3(30, 0.5, 10), 0, floorMesh.position, floorMesh.quaternion);
    rbFloor.body.setCollisionFlags(Ammo.btCollisionObject.CF_STATIC_OBJECT);
    level.gameWorld.physicsWorld.addRigidBody(rbFloor.body);

    const rbBox = new RigidBody();
    rbBox.createBox( new THREE.Vector3(1,1,1), 1, boxMesh.position, boxMesh.quaternion);
    rbBox.body.setCollisionFlags(Ammo.btCollisionObject.CF_CHARACTER_OBJECT);
    level.gameWorld.physicsWorld.addRigidBody(rbBox.body);

    level.gameWorld.rigidBodies.push({mesh: boxMesh, rigidBody: rbBox});
    level.gameWorld.rigidBodies.push({mesh: floorMesh, rigidBody: rbFloor});


    // Set up lighting
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
    directionalLight.position.set(-1,1,0);
    level.gameWorld.scene.add(directionalLight);

    const dlighthelper = new THREE.DirectionalLightHelper(directionalLight);
    level.gameWorld.scene.add(dlighthelper);

    const overheadLights = new OverheadLights();
    level.gameWorld.scene.add(overheadLights.light1);

}


function launchLevel() {

    mainMenu.hideMenu();        // hide main menu
    
    currentLevelAbortController = new AbortController()                         // object to remove all in-game listeners

    currentLevelEnvironment = new Level( currentLevelAbortController );         // create level environment

    gameInProgress = true;      // change game state variable

    switch ( levelIndex ) {
        
        case 0:

            createSceneObjects( currentLevelEnvironment );      // create scene
            
            break;
            
            
        case 1:
                

            createSceneObjectstemp( currentLevelEnvironment );      // create scene
            
            break;
    }


    currentLevelEnvironment.gameloop();                // start gameloop
}

// function called on exiting level
function exitLevel() {

    gameInProgress = false;         // change game state variable

    currentLevelEnvironment.disposeLevel();     // dispose current level
    currentLevelEnvironment = null;

    
    mainMenu.showMenu();            // show main menu

}


// load physics engine and show main menu
async function main() {

    // load ammo
    const AmmoLib = await Ammo();
    Ammo = AmmoLib;

    document.body.style.margin = '0';       // remove borders around canvas

    // initialise main menus
    settingsMenu = new SettingsMainMenu( 'settings-menu' );
    levelsMenu = new LevelsMainMenu( 'levels-menu' );
    mainMenu = new MainMainMenu( 'main-menu', levelsMenu, settingsMenu );

    // function called on level selection
    let onLaunchLevel = ( e ) => {

        levelIndex = e.detail.level;
        launchLevel();

    }
    let onExitLevel = () => { exitLevel(); }        // function called on level exit

    // make listeners
    document.addEventListener( 'launch-level', onLaunchLevel );     // launch level listener
    document.addEventListener( 'exit-level', onExitLevel );         // exit level listener
    
    gameInProgress = false;             // change game state variable

    mainMenu.showMenu();                // show main menu

}

// Load and launch into main menu
main();
