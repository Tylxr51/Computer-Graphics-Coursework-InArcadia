import * as THREE from '/three.js-r170/build/three.module.js';
import World from '/js/buildWorld.js'
import Player from '/js/player.js'
import OverheadLights from '/js/lighting.js';  
import { RigidBody, FloorPiece } from '/js/objectSpawner.js'
import {InstructionsGameMenu, PauseGameMenu, DeadGameMenu } from '/js/menus.js'


export default class level {

    // initialise level
    constructor( levelIndex, abortController ) {

        this.gameWorld;          // object that handles game environment (camera, renderer, physics initialisation)
        this.player;             // object that handles player controls (movement, looking, sprinting)
        
        this.abortController = abortController;                     // object for removing listeners

        this.gravityVector = new THREE.Vector3( 0, -9.81, 0 );      // world gravity vector
        this.clock = new THREE.Clock( true );                        // clock to keep animations synchronised that starts as soon as it is created
        this.delta;
        this.gameloop = this.gameloop.bind( this );                 // bind this so gameloop function doesn't redefine in future calls

        // variables to parse to spawn function to convey whether player is spawning for first time or respawning
        this.isInitialSpawn;

        // variables to keep track of current camera view
        this.currentCamera;
        this.currentCameraIndex;

        // objects for in-game menu screens
        this.instructionsMenu;
        this.pauseMenu;
        this.deadMenu;

        this.buildLevelBackend();       // create world, player, and menus
        this.chooseLevelScene( levelIndex );      // create scene

        this.gameloop();
    }

    // function called when level is selected to initialise camera, physics, etc
    buildLevelBackend() {

        // initialise gameWorld and physicsWorld
        this.gameWorld = new World( this.gravityVector, this.abortController );
        this.gameWorld.initPhysics();

        // initialise player 
        this.ammoPlayerSpawnPosition = new Ammo.btVector3( 0, 5, 0 )
        this.ammoPlayerSpawnQuaternion = new Ammo.btQuaternion( 0, 0, 0, 1 );
        this.cameraSpawnLookAt = new THREE.Vector3( 1000, 0, 0 )        // set to very far in distance so no glitching during player respawn teleport
        this.playerSize = new THREE.Vector2( 0.25, 0.5 );               // radius, height
        this.player = new Player( this.playerSize, this.gameWorld );    // create player object
        this.isInitialSpawn = true;                                     // player has not spawned yet so set true
    
        // function for player spawning listener
        this.onSpawnSetFirstPersonCamera = () => { 

            this.useFirstPersonCamera();
            this.currentCamera.lookAt( this.cameraSpawnLookAt ); 
        
        };

        // listener for player spawning
        document.addEventListener( 'spawn-set-first-person-camera', this.onSpawnSetFirstPersonCamera, { signal: this.abortController.signal } );


        // spawn player
        this.player.spawnPlayer( this.isInitialSpawn, this.ammoPlayerSpawnPosition, this.ammoPlayerSpawnQuaternion )
        this.isInitialSpawn = false;        // this will stay false for the rest of the game as player has completed their initial spawn

        // set camera to first person
        this.useFirstPersonCamera();

        // initialise menus
        this.instructionsMenu = new InstructionsGameMenu( 'instructions-menu', this.player, this.abortController );
        this.pauseMenu = new PauseGameMenu( 'paused-menu', this.player, this.abortController );
        this.deadMenu = new DeadGameMenu( 'dead-menu', 
                                          this.player, 
                                          this.abortController, 
                                          this.isInitialSpawn, 
                                          this.ammoPlayerSpawnPosition, 
                                          this.ammoPlayerSpawnQuaternion 
                                        );
        this.instructionsMenu.showMenu();                   // show instruction menu
        this.player.playerControls.turnOffMovement();       //  disable player movement

        // functions for listeners below
        this.onUnlock = this.pauseGame.bind(this);
        this.onTriggerPlayerDeath = this.killPlayer.bind(this);
        this.onSwitchCamera = this.switchCamera.bind(this);

        // make listeners
        document.addEventListener( 'keydown', this.keyCommands, { signal: this.abortController.signal } );      // listener for key down but not tied to player object
        this.player.playerControls.cameraController.addEventListener('unlock', this.onUnlock, { signal: this.abortController.signal } );    // cursor unlock logic
        document.addEventListener('trigger-player-death', this.onTriggerPlayerDeath, { signal: this.abortController.signal });              // player death logic
        document.addEventListener('switch-camera', this.onSwitchCamera, { signal: this.abortController.signal } );                          // camera angle toggle

    }

    chooseLevelScene( levelIndex ) {

        switch ( levelIndex ) {
        
        case 0:

            this.createSceneLevel0();    

            break;
            
            
        case 1:
                
            this.createSceneLevel1();
            
            break;
        }
    }

    createSceneLevel0() {

        // PLAN
        // 
        // GENERAL AMBIENT LIGHTING
        // CREATE TRACK
        // SCREEN LIGHT IN DISTANCE
        // IMPROVE LIGHTING

        this.floor1 = new FloorPiece( this.gameWorld, [ -2.0,  0, 0 ], [ 10.0, 1, 2 ]);
        this.floor2 = new FloorPiece( this.gameWorld, [  8.0,  1, 0 ], [ 7.0,  1, 2 ]);
        this.floor3 = new FloorPiece( this.gameWorld, [  16.0, 1, 0 ], [ 10.0, 1, 2 ]);
        this.floor4 = new FloorPiece( this.gameWorld, [  28,   1, 0 ], [ 7.0,  1, 2 ]);
        // const floor2 = new FloorPiece( this.gameWorld, [ 10, 1.5, 3 ], [ 14, 0.25, 0 ], [ 0, 0, 0, 1 ]);
        // const floor3 = new FloorPiece( this.gameWorld, [ 10, 1.5, 3 ], [ 14, 0.25, 0 ], [ 0, 0, 0, 1 ]);

        // Set up box
        // const boxGeometry = new THREE.BoxGeometry();
        // const boxMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
        // const boxMesh = new THREE.Mesh( boxGeometry, boxMaterial );
        // boxMesh.position.set(5, 2.5, 0);    
        // this.gameWorld.scene.add( boxMesh );

        // const rbBox = new RigidBody();
        // rbBox.createBox( new THREE.Vector3(1,1,1), 1, boxMesh.position, boxMesh.quaternion);
        // rbBox.body.setCollisionFlags(Ammo.btCollisionObject.CF_CHARACTER_OBJECT);
        // this.gameWorld.physicsWorld.addRigidBody(rbBox.body);

        // this.gameWorld.rigidBodies.push({mesh: boxMesh, rigidBody: rbBox});
        // this.gameWorld.rigidBodies.push({mesh: floorMesh, rigidBody: rbFloor});


        // Set up lighting
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF);
        directionalLight.position.set(-1,1,0);
        this.gameWorld.scene.add(directionalLight);

        const dlighthelper = new THREE.DirectionalLightHelper(directionalLight);
        this.gameWorld.scene.add(dlighthelper);

        const overheadLights = new OverheadLights();
        this.gameWorld.scene.add(overheadLights.light1);

    }

    createSceneLevel1() {
        
    }


    // function for key down events related to key commands 
    keyCommands = ( event ) => {

        switch ( event.code ) {

            // switch to other camera
            case 'KeyT':

                document.dispatchEvent( new CustomEvent( 'switch-camera' ) );

                break;

            // kill player
            case 'KeyK':

                document.dispatchEvent( new CustomEvent( 'trigger-player-death' ) );

                break;


            // exit level
            case 'KeyM':

                document.dispatchEvent( new CustomEvent( 'exit-level' ) );

                break;

        }
    }

    // function triggered on cursor unlock (for pausing game)
    pauseGame() {

        // if player is dead don't show pause menu (as dead menu is already there)
        if (this.player.playerIsDead) { return }

        gameInProgress = false;     // stop gameloop

        this.pauseMenu.getCurrentCamera(this.currentCameraIndex);       // update pauseMenu's currentCameraIndex variable
        this.pauseMenu.showMenu();                                      // show pause menu

        // disable player movement if current camera is first person (controls already disabled for third person camera)
        if (this.currentCameraIndex === this.gameWorld.firstPersonCameraIndex) {

            this.player.playerControls.turnOffMovement();

        }
    }

    // function triggered on player death
    killPlayer() {

        this.player.playerIsDead = true;                        // change player state variable
        this.player.playerControls.cameraController.unlock();   // unlock user cursor
        this.deadMenu.showMenu();                               // show dead menu
        this.player.playerControls.turnOffMovement();           // disable player movement

    }


    // function to set current camera to first person
    useFirstPersonCamera() {

        this.currentCameraIndex = this.gameWorld.firstPersonCameraIndex;                // update currentCameraIndex
        this.currentCamera = this.gameWorld.cameraArray[ this.currentCameraIndex ];     // switch to first person camera
        this.player.playerControls.turnOnMovement();                                    // turn on player movement

    }

    // function to set current camera to third person
    useThirdPersonCamera() {

        this.currentCameraIndex = this.gameWorld.thirdPersonCameraIndex;                // update currentCameraIndex
        this.currentCamera = this.gameWorld.cameraArray[this.currentCameraIndex];       // switch to third person camera
        this.player.playerControls.turnOffMovement();                                   // turn off player movement

    }

    // function to swap current camera to other camera
    switchCamera(){

        // check which camera is currently in use and call function to enable the other one
        switch (this.currentCameraIndex) {

            case (this.gameWorld.firstPersonCameraIndex):

                this.useThirdPersonCamera();

                break;

            case (this.gameWorld.thirdPersonCameraIndex):

                this.useFirstPersonCamera();

                break;
        }
    }


    // game loop
    gameloop() {

        if ( stopGameloop ) { return };

        requestAnimationFrame( this.gameloop );                     //  schedule next frame if game is still in progress

        this.delta = this.clock.getDelta();                        //  update delta

        // only update scene if game is in progress 
        if ( gameInProgress ) {

            this.gameWorld.physicsWorld.stepSimulation( this.delta, 10 );    //  update physics sim by delta

            this.gameWorld.updateRigidBodyMeshToSimulation();           // update rigid bodies mesh position according to physics simulation

            this.player.playerControls.updatePlayerMotion( this.gameWorld );    //  move player according to user input
        
        }

        this.gameWorld.renderer.render(this.gameWorld.scene, this.currentCamera );   //  render scene

    }

    // dispose function for level
    disposeLevel() {

        this.gameWorld.disposeWorld();      // dispose scene
        this.player.disposePlayer();        // dispose player
        this.abortController.abort()        // remove all in-game listeners
        this.abortController = null
        
        // destroy ammo variables
        Ammo.destroy(this.ammoPlayerSpawnPosition);
        Ammo.destroy(this.ammoPlayerSpawnQuaternion);

        // hide all in game menus
        this.instructionsMenu.hideMenu();
        this.pauseMenu.hideMenu();
        this.deadMenu.hideMenu();

        // set variables to null
        this.ammoPlayerSpawnPosition = null;
        this.ammoPlayerSpawnQuaternion = null;
        this.gameWorld = null;
        this.player = null;
        this.clock = null;
        this.delta = null;
        this.currentCamera = null;
        this.instructionsMenu = null;
        this.pauseMenu = null;
        this.deadMenu = null;
    }

}