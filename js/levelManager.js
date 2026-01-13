import * as THREE from 'three';
import World from '/js/buildWorld.js'
import Player from '/js/player.js'
import { FloorPiece, Staircase, SpawnArea, Screen, LevelCompletePlatform, OutOfBoundsPlatform, ImagePlate } from '/js/objectSpawner.js'
import { InstructionsGameMenu, PauseGameMenu, DeadGameMenu, LevelCompleteGameMenu, HUD } from '/js/menus.js'
import { LEVEL_DIRECTORIES } from '/js/levelDirectories.js';

import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';



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
        this.levelCompleteMenu;

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
        this.playerSpawnY = 15.5
        this.ammoPlayerSpawnPosition = new Ammo.btVector3( 0, this.playerSpawnY, 0 )
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
        this.levelCompleteMenu = new LevelCompleteGameMenu( 'level-complete-menu', 
                                          this.player, 
                                          this.abortController, 
                                          this.isInitialSpawn, 
                                          this.ammoPlayerSpawnPosition, 
                                          this.ammoPlayerSpawnQuaternion 
                                        );
        this.hud = new HUD( '.dash-progress' );
        this.hud.showHUD();
        this.instructionsMenu.showMenu();                   // show instruction menu
        this.player.playerControls.turnOffMovement();       // disable player movement

        // functions for listeners below
        this.onUnlock = this.pauseGame.bind( this );
        this.onTriggerPlayerDeath = this.killPlayer.bind( this );
        this.onSwitchCamera = this.switchCamera.bind( this );
        this.onTriggerLevelPassed = this.levelPassed.bind( this );

        // make listeners
        document.addEventListener( 'keydown', this.keyCommands, { signal: this.abortController.signal } );      // listener for key down but not tied to player object
        this.player.playerControls.cameraController.addEventListener( 'unlock', this.onUnlock, { signal: this.abortController.signal } );    // cursor unlock logic
        document.addEventListener( 'trigger-player-death', this.onTriggerPlayerDeath, { signal: this.abortController.signal });              // player death logic
        document.addEventListener( 'trigger-level-passed', this.onTriggerLevelPassed, { signal: this.abortController.signal } );
        document.addEventListener( 'switch-camera', this.onSwitchCamera, { signal: this.abortController.signal } );                          // camera angle toggle

    }

    // function that chooses which level to load
    chooseLevelScene( levelIndex ) {

      const buildLevelScene = LEVEL_DIRECTORIES[ levelIndex ]
      const sceneColor = colorHueList[ levelIndex ]

      const objectsRequiringUpdate = buildLevelScene( { gameWorld : this.gameWorld,
                                                        player : this.player,
                                                        playerSpawnY : this.playerSpawnY,
                                                        playerSize : this.playerSize,
                                                        colorHue : sceneColor
                                                      });   

      this.screen = objectsRequiringUpdate.screen;
      this.levelCompletePlatform = objectsRequiringUpdate.levelCompletePlatform;
      this.outOfBoundsPlatform = objectsRequiringUpdate.outOfBoundsPlatform;

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

        this.player.playerControls.dashTimer.stop();        // stop dash cooldown whilst game is paused

        this.pauseMenu.getCurrentCamera(this.currentCameraIndex);       // update pauseMenu's currentCameraIndex variable
        this.pauseMenu.showMenu();                                      // show pause menu

        // disable player movement if current camera is first person (controls already disabled for third person camera)
        if (this.currentCameraIndex === this.gameWorld.firstPersonCameraIndex) {

            this.player.playerControls.turnOffMovement();

        }
    }

    // function triggered on player death
    killPlayer() {

        gameInProgress = false;     // stop gameloop

        this.player.playerIsDead = true;                        // change player state variable
        this.player.playerControls.cameraController.unlock();   // unlock user cursor
        this.deadMenu.showMenu();                               // show dead menu
        this.player.playerControls.turnOffMovement();           // disable player movement

    }

    // function triggered on level passed
    levelPassed() {

        gameInProgress = false;     // stop gameloop

        this.player.playerIsDead = true;                        // change player state variable
        this.player.playerControls.cameraController.unlock();   // unlock user cursor
        this.levelCompleteMenu.showMenu();                               // show dead menu
        this.player.playerControls.turnOffMovement();           // disable player movement

    }

    // function to set current camera to first person
    useFirstPersonCamera() {

        this.currentCameraIndex = this.gameWorld.firstPersonCameraIndex;                // update currentCameraIndex
        this.currentCamera = this.gameWorld.cameraArray[ this.currentCameraIndex ];     // switch to first person camera
        this.player.playerControls.turnOnMovement();                                    // turn on player movement
        this.player.playerControls.cameraController.pointerSpeed = mouseControlsSensitivity;    // turn on mouse movement
        this.player.playerGLTFMesh?.despawnPlayerGLTFMesh();

    }

    // function to set current camera to third person
    useThirdPersonCamera() {

        this.currentCameraIndex = this.gameWorld.thirdPersonCameraIndex;                // update currentCameraIndex
        this.currentCamera = this.gameWorld.cameraArray[this.currentCameraIndex];       // switch to third person camera
        this.player.playerControls.turnOffMovement();                                   // turn off player movement
        this.player.playerControls.cameraController.pointerSpeed = 0;                   // turn off mouse movement
        this.player.playerGLTFMesh?.spawnPlayerGLTFMesh();

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

    checkPlayerCollisions() {

        this.numOverlaps = this.player.ghostObject.getNumOverlappingObjects();
        
        for ( let i = 0; i < this.numOverlaps; i++ ) {
            this.obj = this.player.ghostObject.getOverlappingObject(i);

            // if hit levelComplete then trigger levelComplete contactEvent
            if ( Ammo.getPointer(this.obj) === Ammo.getPointer( this.levelCompletePlatform.platformBody ) ) {
                this.levelCompletePlatform.triggerContactEvent();
            }

            // if hit outOfBounds and only outOfBounds then trigger outOfBounds contactEvent (had to add the 'and only' condition to stop permadeath glitch)
            else if ( Ammo.getPointer(this.obj) === Ammo.getPointer( this.outOfBoundsPlatform.platformBody ) && this.numOverlaps == 1 ) {
                this.outOfBoundsPlatform.triggerContactEvent();
            }
        }
    }

    // game loop
    gameloop() {

        if ( stopGameloop ) { return };

        requestAnimationFrame( this.gameloop );                     //  schedule next frame if game is still in progress

        this.delta = this.clock.getDelta();                         //  update delta

        // only update scene if game is in progress 
        if ( gameInProgress ) {

            this.screen.updateScanlines( this.delta );                 // update scanline animation if screen exists

            this.hud.updateDashProgress( this.player.playerControls.dashRechargeProgress )  // update dash cooldown in hud

            this.gameWorld.physicsWorld.stepSimulation( this.delta, 10 );    //  update physics sim by delta

            this.gameWorld.updateRigidBodyMeshToSimulation();           // update rigid bodies mesh position according to physics simulation

            this.player.playerControls.updatePlayerMotion( this.gameWorld, this.delta );    //  move player according to user input
        
            this.checkPlayerCollisions();

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
        this.levelCompleteMenu.hideMenu();
        this.hud.hideHUD();

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
        this.levelCompleteMenu = null;
        this.hud = null;
    }

}