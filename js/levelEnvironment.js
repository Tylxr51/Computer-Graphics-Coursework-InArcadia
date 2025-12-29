import * as THREE from '/three.js-r170/build/three.module.js';
import World from '/js/buildWorld.js'
import Player from '/js/player.js'
import {InstructionsGameMenu, PauseGameMenu, DeadGameMenu } from '/js/menus.js'

//LAST FILE TO CLEAN, THEN CHECK IMPORTS HI

export default class level {

    // initialise level
    constructor( abortController ) {

        this.gameWorld;          // object that handles game environment (camera, renderer, physics initialisation)
        this.player;             // object that handles player controls (movement, looking, sprinting)
        
        this.abortController = abortController;                     // object for removing listeners

        this.gravityVector = new THREE.Vector3( 0, -9.81, 0 );      // world gravity vector
        this.clock = new THREE.Clock();                             // clock to keep animations synchronised
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

        this.onRestartGameloop = () => { this.gameloop() };
        document.addEventListener( 'restart-gameloop', this.onRestartGameloop, this.abortController )

        this.launchLevel();     // create world, player, and menus

    }

    // function called when level is selected to launch level
    launchLevel() {

        // initialise gameWorld and physicsWorld
        this.gameWorld = new World( this.gravityVector, this.abortController );
        this.gameWorld.initPhysics();
    
        // listen for player spawning
        this.onSpawnSetFirstPersonCamera = () => { 

            this.useFirstPersonCamera();
            this.currentCamera.lookAt( new THREE.Vector3( 1, 0, 0 ) );
        
        }
        document.addEventListener( 'spawn-set-first-person-camera', this.onSpawnSetFirstPersonCamera, { signal: this.abortController.signal } );


        // initialise player 
        this.ammoPlayerSpawnPosition = new Ammo.btVector3( -5, 1, 0 )
        this.ammoPlayerSpawnQuaternion = new Ammo.btQuaternion( 0, 0, 0, 1 );
        this.playerSize = new THREE.Vector2( 0.25, 0.5 ); // radius, height
        this.player = new Player( this.playerSize, this.gameWorld );
        this.isInitialSpawn = true;
        this.player.spawnPlayer( this.isInitialSpawn, this.ammoPlayerSpawnPosition, this.ammoPlayerSpawnQuaternion )
        this.isInitialSpawn = false;        // this will stay false for the rest of the game

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
        this.instructionsMenu.showMenu();
        this.player.playerControls.turnOffMovement();      //  disable player movement

        // functions for listeners
        this.onUnlock = this.pauseGame.bind(this);
        this.onTriggerPlayerDeath = this.killPlayer.bind(this);
        this.onSwitchCamera = this.switchCamera.bind(this);

        // make listeners
        document.addEventListener( 'keydown', this.keyCommands, { signal: this.abortController.signal } );      // listener for key down but not tied to player object
        this.player.playerControls.cameraController.addEventListener('unlock', this.onUnlock, { signal: this.abortController.signal } );    // cursor unlock logic
        document.addEventListener('trigger-player-death', this.onTriggerPlayerDeath, { signal: this.abortController.signal });              // player death logic
        document.addEventListener('switch-camera', this.onSwitchCamera, { signal: this.abortController.signal } );                          // camera angle toggle

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

        // check if game has stopped running and terminate gameloop if so
        if ( !gameInProgress ) {
            return;
        }

        requestAnimationFrame( this.gameloop );                     //  schedule next frame if game is still in progress

        this.delta = this.clock.getDelta();                        //  update delta

        this.gameWorld.physicsWorld.stepSimulation( this.delta, 10 );    //  update physics sim by delta

        this.gameWorld.updateRigidBodyMeshToSimulation();           // update rigid bodies mesh position according to physics simulation

        this.player.playerControls.updatePlayerMotion(this.gameWorld, this.delta);    //  move player according to user input

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