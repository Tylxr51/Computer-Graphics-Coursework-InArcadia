import * as THREE from 'three';
import World from '/js/buildWorld.js'
import Player from '/js/player.js'
import OverheadLights from '/js/lighting.js';  
import { RigidBody, FloorPiece, Staircase, SpawnArea, Screen } from '/js/objectSpawner.js'
import {InstructionsGameMenu, PauseGameMenu, DeadGameMenu, HUD } from '/js/menus.js'

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
        this.hud = new HUD( '.dash-progress' );
        this.hud.showHUD();
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

    // function that chooses which level to load
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

    // function that creates level 0 scene objects
    createSceneLevel0() {

        this.colorHue = level0ColorHue

        this.trackWidth = 2.00;     // width of floorpieces
        this.trackZCentre = 0.00;



        //////////////////////////////////////
        /////////////// SCREEN ///////////////
        //////////////////////////////////////

        this.screen = new Screen( this.gameWorld )

        

        //////////////////////////////////////
        /////////// SPAWN PLATFORM ///////////
        //////////////////////////////////////

        ///// POSITION AND SIZE VARIABLES /////

        this.spawnPlatformXStart = -0.50;
        
        
        ///// CREATE FLOOR PIECES & DOOR //////
        
        // create spawn door and spawn platform
        this.spawnArea = new SpawnArea( this.gameWorld, this.spawnPlatformXStart, this.playerSpawnY, this.playerSize.y, this.trackZCentre )
        
        

        ///////////////////////////////////////
        //////////// LOWER SECTION ////////////
        ///////////////////////////////////////


        ///// POSITION AND SIZE VARIABLES /////

        this.firstFloorXStart = -0.50;
        this.firstFloorXLength = 10.00;
        this.lowerSectionY = 0.00;

        this.walkJumpGapDistance = 1.00;
        this.floorAfterWalkJumpXStart = this.firstFloorXStart + this.firstFloorXLength + this.walkJumpGapDistance;
        this.floorAfterWalkJumpXLength = 7.00;


        ///////// CREATE FLOOR PIECES /////////

        // player drops from spawn area

        // floor piece player lands on to
        this.firstFloor             =   new FloorPiece( this.gameWorld, 
                                                        [ this.firstFloorXStart, this.lowerSectionY, this.trackZCentre ], 
                                                        [ this.firstFloorXLength, 1.0, this.trackWidth ],
                                                        this.colorHue
                                                    );
        
        // gap to walk jump across
        
        // after walk jump
        this.floorAfterWalkJump     =   new FloorPiece( this.gameWorld, 
                                                        [ this.floorAfterWalkJumpXStart, this.lowerSectionY, this.trackZCentre ],     
                                                        [ this.floorAfterWalkJumpXLength, 1.0, this.trackWidth ],
                                                        this.colorHue
                                                    );



        ///////////////////////////////////////
        //////////// UPPER SECTION ////////////
        ///////////////////////////////////////


        ///// POSITION AND SIZE VARIABLES /////

        this.raisedFloorToClimbXStart = this.floorAfterWalkJumpXStart + this.floorAfterWalkJumpXLength
        this.raisedFloorToClimbXLength = 10.0;
        this.raisedFloorToClimbHeight = 1.50;
        this.raisedSectionY = this.lowerSectionY + this.raisedFloorToClimbHeight;

        this.sprintJumpGapDistance = 2.00;
        this.floorAfterSprintJumpXStart = this.raisedFloorToClimbXStart + this.raisedFloorToClimbXLength + this.sprintJumpGapDistance;
        this.floorAfterSprintJumpXLength = 7.00;


        ///////// CREATE FLOOR PIECES /////////

        // climb up to
        this.raisedFloorToClimb     =   new FloorPiece( this.gameWorld, 
                                                        [ this.raisedFloorToClimbXStart, this.raisedSectionY, this.trackZCentre ], 
                                                        [ this.raisedFloorToClimbXLength, this.raisedSectionY, this.trackWidth ],
                                                        this.colorHue
                                                      );

        // gap to sprint jump across

        // after sprint jump
        this.floorAfterSprintJump   =   new FloorPiece( this.gameWorld, 
                                                        [ this.floorAfterSprintJumpXStart, this.raisedSectionY, this.trackZCentre ], 
                                                        [ this.floorAfterSprintJumpXLength, 1.0, this.trackWidth ],
                                                        this.colorHue
                                                      );



        //////////////////////////////////////
        //////////// DASH SECTION ////////////
        //////////////////////////////////////


        ///// POSITION AND SIZE VARIABLES ////

        this.dashGapDistance = 7.00;
        this.dashGapDrop = 9.50;                // from raisedSectionY to floorBelowDashEntryY

        this.dashGapOpeningXStart = this.floorAfterSprintJumpXStart + this.floorAfterSprintJumpXLength + this.dashGapDistance;

        this.wallAboveDashEntryRaisedBy = 2.50;
        this.wallAboveDashEntryY = this.raisedSectionY + this.wallAboveDashEntryRaisedBy;
        this.dashGapOpeningHeight = 2.00;
        this.wallAboveDashEntryHeight = this.dashGapDrop - this.dashGapOpeningHeight + this.wallAboveDashEntryRaisedBy;

        this.floorBelowDashEntryY = this.raisedSectionY - this.dashGapDrop;
        this.floorBelowDashEntryXLength = 4.00;


        ///////// CREATE FLOOR PIECES /////////

        // big gap to dash across

        // dash entry
        this.wallAboveDashEntry     =   new FloorPiece( this.gameWorld, 
                                                        [ this.dashGapOpeningXStart, this.wallAboveDashEntryY, this.trackZCentre ], 
                                                        [ 2.0, this.wallAboveDashEntryHeight, this.trackWidth ],
                                                        this.colorHue
                                                    );
        this.floorBelowDashEntry    =   new FloorPiece( this.gameWorld, 
                                                        [ this.dashGapOpeningXStart, this.floorBelowDashEntryY, this.trackZCentre ], 
                                                        [ this.floorBelowDashEntryXLength, 1.0, this.trackWidth ],
                                                        this.colorHue
                                                    );



        ///////////////////////////////////////
        ////////// STAIRCASE SECTION //////////
        ///////////////////////////////////////

        ///// POSITION AND SIZE VARIABLES /////

        this.staircaseFromDashToTubesXStart = this.dashGapOpeningXStart + this.floorBelowDashEntryXLength;
        this.staircaseFromDashToTubesHeight = 3.00;         // must be a multiple of 0.15!! (step height as defined in class)
        this.staircaseFromDashToTubesNumberOfSteps = this.staircaseFromDashToTubesHeight / 0.15
        this.staircaseFromDashToTubesStepDepth = 0.5;
        this.staircaseFromDashToTubesXLength = this.staircaseFromDashToTubesStepDepth * this.staircaseFromDashToTubesNumberOfSteps;


        ///////// CREATE FLOOR PIECES //////////

        // staircase after dash up to tubes
        this.staircaseFromDashToTubes   =   new Staircase ( this.gameWorld, 
                                                            [ this.staircaseFromDashToTubesXStart, this.floorBelowDashEntryY,  this.trackZCentre ], 
                                                            this.staircaseFromDashToTubesNumberOfSteps, 
                                                            this.staircaseFromDashToTubesStepDepth, 
                                                            this.trackWidth,
                                                            this.colorHue
                                                          );


        ////////////////////////////////////////
        ///////////// TUBE SECTION /////////////
        ////////////////////////////////////////

        ///// POSITION AND SIZE VARIABLES /////

        this.tubeSectionXStart = this.staircaseFromDashToTubesXStart + this.staircaseFromDashToTubesXLength;
        this.tubeSectionXLength = 10.00;

        this.tubeDropLength = 20.00;       // length from floor
        this.tubeWallHeight = 0.50;
        this.tubeWallThickness = 0.10;
        this.tubeXLength = this.tubeSectionXLength / 4;
        this.tubeZLength = this.trackWidth / 2;

        this.tubeSectionFloorHeight = this.floorBelowDashEntryY + this.staircaseFromDashToTubesHeight;
        this.tubeSectionFloorThickness = 2.0;

        this.rightFloorBeforeFirstTubeXLength = this.tubeSectionXLength / 4;
        this.rightFloorBetweenTubesXLength = this.tubeSectionXLength / 8;
        this.rightFloorAfterSecondTubeXLength = this.tubeSectionXLength / 8;

        this.rightFloorBetweenTubesXStart = this.tubeSectionXStart + 4 * (this.tubeSectionXLength / 8)
        this.rightFloorAfterSecondTubeXStart = this.tubeSectionXStart + 7 * (this.tubeSectionXLength / 8)


        ///////// CREATE FLOOR PIECES //////////

        // floor sections
        this.leftFloorNextToTubes       =   new FloorPiece( this.gameWorld, 
                                                            [  this.tubeSectionXStart, this.tubeSectionFloorHeight, this.trackZCentre - this.tubeZLength ], 
                                                            [  this.tubeSectionXLength,  this.tubeSectionFloorThickness, this.tubeZLength ],
                                                            this.colorHue
                                                          );
        this.rightFloorBeforeFirstTube  =   new FloorPiece( this.gameWorld, 
                                                            [  this.tubeSectionXStart, this.tubeSectionFloorHeight,  this.trackZCentre + this.tubeZLength ], 
                                                            [  this.rightFloorBeforeFirstTubeXLength,  this.tubeSectionFloorThickness, this.tubeZLength ],
                                                            this.colorHue
                                                          );
        this.rightFloorBetweenTubes     =   new FloorPiece( this.gameWorld, 
                                                            [  this.rightFloorBetweenTubesXStart, this.tubeSectionFloorHeight,  this.trackZCentre + this.tubeZLength ], 
                                                            [  this.rightFloorBetweenTubesXLength,  this.tubeSectionFloorThickness, this.tubeZLength ],
                                                            this.colorHue
                                                          );
        this.rightFloorAfterSecondTube  =   new FloorPiece( this.gameWorld, 
                                                            [  this.rightFloorAfterSecondTubeXStart, this.tubeSectionFloorHeight,  this.trackZCentre + this.tubeZLength ], 
                                                            [  this.rightFloorAfterSecondTubeXLength,  this.tubeSectionFloorThickness, this.tubeZLength ],
                                                            this.colorHue
                                                          );

        // tubes
        this.frontWallForFirstTube      =   new FloorPiece( this.gameWorld, 
                                                            [ this.tubeSectionXStart + this.rightFloorBeforeFirstTubeXLength, this.tubeSectionFloorHeight + this.tubeWallHeight, this.trackZCentre + this.tubeZLength ], 
                                                            [ this.tubeWallThickness, this.tubeDropLength + this.tubeWallHeight, this.tubeZLength ],
                                                            this.colorHue
                                                          );
        this.rightWallForFirstTube      =   new FloorPiece( this.gameWorld, 
                                                            [ this.tubeSectionXStart + this.rightFloorBeforeFirstTubeXLength + this.tubeWallThickness, this.tubeSectionFloorHeight + this.tubeWallHeight, this.trackZCentre + this.trackWidth - ( this.tubeWallThickness / 2 ) ], 
                                                            [ this.tubeXLength - ( 2 * this.tubeWallThickness ), this.tubeDropLength + this.tubeWallHeight, ( this.tubeWallThickness / 2 ) ],
                                                            this.colorHue
                                                          );
        this.leftWallForFirstTube       =   new FloorPiece( this.gameWorld, 
                                                            [ this.tubeSectionXStart + this.rightFloorBeforeFirstTubeXLength, this.tubeSectionFloorHeight - this.tubeSectionFloorThickness, this.trackZCentre - ( this.tubeWallThickness / 2 ) ], 
                                                            [ this.tubeXLength, this.tubeDropLength - this.tubeSectionFloorThickness, ( this.tubeWallThickness / 2 ) ],
                                                            this.colorHue
                                                          );
        this.backWallForFirstTube       =   new FloorPiece( this.gameWorld, 
                                                            [ this.rightFloorBetweenTubesXStart - this.tubeWallThickness, this.tubeSectionFloorHeight + this.tubeWallHeight, this.trackZCentre + this.tubeZLength ], 
                                                            [ this.tubeWallThickness, this.tubeDropLength + this.tubeWallHeight, this.tubeZLength ],
                                                            this.colorHue
                                                          );
        this.frontWallForSecondTube     =   new FloorPiece( this.gameWorld, 
                                                            [ this.rightFloorBetweenTubesXStart + this.rightFloorBetweenTubesXLength, this.tubeSectionFloorHeight + this.tubeWallHeight, this.trackZCentre + this.tubeZLength ], 
                                                            [ this.tubeWallThickness, this.tubeDropLength + this.tubeWallHeight, this.tubeZLength ],
                                                            this.colorHue
                                                          );
        this.rightWallForSecondTube     =   new FloorPiece( this.gameWorld, 
                                                            [ this.rightFloorBetweenTubesXStart + this.rightFloorBetweenTubesXLength + this.tubeWallThickness, this.tubeSectionFloorHeight + this.tubeWallHeight, this.trackZCentre + this.trackWidth - ( this.tubeWallThickness / 2 ) ], 
                                                            [ this.tubeXLength - (2 * this.tubeWallThickness ), this.tubeDropLength + this.tubeWallHeight, ( this.tubeWallThickness / 2 ) ],
                                                            this.colorHue
                                                          );
        this.leftWallForSecondTube      =   new FloorPiece( this.gameWorld, 
                                                            [ this.rightFloorBetweenTubesXStart + this.rightFloorBetweenTubesXLength, this.tubeSectionFloorHeight - this.tubeSectionFloorThickness, this.trackZCentre - (this.tubeWallThickness / 2) ], 
                                                            [ this.tubeXLength, this.tubeDropLength - this.tubeSectionFloorThickness, ( this.tubeWallThickness / 2 ) ],
                                                            this.colorHue
                                                          );
        this.backWallForSecondTube      =   new FloorPiece( this.gameWorld, 
                                                            [ this.rightFloorAfterSecondTubeXStart  - this.tubeWallThickness, this.tubeSectionFloorHeight + this.tubeWallHeight, this.trackZCentre + this.tubeZLength ], 
                                                            [ this.tubeWallThickness, this.tubeDropLength + this.tubeWallHeight, this.tubeZLength ],
                                                            this.colorHue
                                                          );

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
        const directionalLight = new THREE.DirectionalLight( 0xffffff );
        directionalLight.position.set( 30, 40, 100 );
        directionalLight.target.position.set( 30, 0, 0 );
        this.gameWorld.scene.add(directionalLight);
        
        const dlighthelper = new THREE.DirectionalLightHelper( directionalLight );
        if ( debug ) { this.gameWorld.scene.add( dlighthelper ); }
        
        const hemlight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
        this.gameWorld.scene.add( hemlight );

        
        // const directionalLight2 = new THREE.DirectionalLight(0xFFFFFF, 10);
        // directionalLight2.position.set(60,-2,1);
        // directionalLight2.target.position.set(58, -10, 0)

        // this.gameWorld.scene.add(directionalLight2);


        // const dlighthelper2 = new THREE.DirectionalLightHelper(directionalLight2);
        // this.gameWorld.scene.add(dlighthelper2);

        // const overheadLights = new OverheadLights();
        // this.gameWorld.scene.add(overheadLights.light1);

        // const axesHelper = new THREE.AxesHelper(30)
        // axesHelper.position.set(0, 5, 0);
        // this.gameWorld.scene.add(axesHelper);

    }

    // function that creates level 1 scene objects
    createSceneLevel1() {

        this.colorHue = level1ColorHue

        this.trackWidth = 2.00;     // width of floorpieces
        this.trackZCentre = 0.00;



        //////////////////////////////////////
        /////////////// SCREEN ///////////////
        //////////////////////////////////////

        this.screen = new Screen( this.gameWorld )



        //////////////////////////////////////
        /////////// SPAWN PLATFORM ///////////
        //////////////////////////////////////

        ///// POSITION AND SIZE VARIABLES /////

        this.spawnPlatformXStart = -0.50;
        
        
        ///// CREATE FLOOR PIECES & DOOR //////
        
        // create spawn door and spawn platform
        this.spawnArea = new SpawnArea( this.gameWorld, this.spawnPlatformXStart, this.playerSpawnY, this.playerSize.y, this.trackZCentre );



        ///////////////////////////////////////
        ///////////// BEFORE MAZE /////////////
        ///////////////////////////////////////

        ///// POSITION AND SIZE VARIABLES /////

        this.firstFloorXStart = -0.50;
        this.firstFloorXLength = 20.00;
        this.lowerSectionY = 0.00;

        this.gapToMazeStartDistance = 1.00;
        
        
        ///////// CREATE FLOOR PIECES /////////
        
        // player drops from spawn area
        
        // floor piece player lands on to
        this.firstFloor         =   new FloorPiece( this.gameWorld, 
                                                    [ this.firstFloorXStart, this.lowerSectionY, this.trackZCentre ], 
                                                    [ this.firstFloorXLength, 1.0, this.trackWidth ],
                                                    this.colorHue
                                                  );
        
        // gap to walk jump across into maze
        
        
        
        ///////////////////////////////////////
        ////////////// MAZE FRAME /////////////
        ///////////////////////////////////////
        
        ///// POSITION AND SIZE VARIABLES /////
        
        this.mazeFrameThickness = 1.0;
        this.mazePlatformThickness = this.mazeFrameThickness / 2;

        this.mazeOpeningHeight = 2.5;
        
        this.mazeLowerFloorXStart = this.firstFloorXStart + this.firstFloorXLength + this.gapToMazeStartDistance;
        this.mazeLowerFloorXLength = 30.00;
        
        this.mazeFrontWallXStart = this.mazeLowerFloorXStart;
        this.mazeFrontWallHeight = 20.0;
        this.mazeFrontWallY = this.lowerSectionY + this.mazeOpeningHeight + this.mazeFrontWallHeight;

        this.mazeCeilingXStart = this.mazeLowerFloorXStart;
        this.mazeCeilingXLength = this.mazeLowerFloorXLength;
        this.mazeCeilingY = this.lowerSectionY + this.mazeOpeningHeight + this.mazeFrontWallHeight + this.mazeFrameThickness;

        this.mazeBackWallXStart = this.mazeLowerFloorXStart + this.mazeLowerFloorXLength;
        this.mazeBackWallY = this.mazeCeilingY;
        this.mazeBackWallHeight = this.mazeOpeningHeight + this.mazeFrontWallHeight;

        this.mazeLeftWallXStart = this.mazeLowerFloorXStart;
        this.mazeLeftWallXLength = this.mazeLowerFloorXLength;
        this.mazeLeftWallY = this.mazeCeilingY;
        this.mazeLeftWallHeight = this.mazeBackWallHeight + this.mazeFrameThickness;
        this.mazeLeftWallZCentre = this.trackZCentre - ( this.trackWidth ) - ( this.mazeFrameThickness / 2 );



        ///////// CREATE FLOOR PIECES /////////

        // after walk jump
        this.mazeLowerFloor     =   new FloorPiece( this.gameWorld, 
                                                    [ this.mazeLowerFloorXStart, this.lowerSectionY, this.trackZCentre ],     
                                                    [ this.mazeLowerFloorXLength, this.mazeFrameThickness, this.trackWidth ],
                                                    this.colorHue
                                                  );

        this.mazeFrontWall      =   new FloorPiece( this.gameWorld,
                                                    [ this.mazeFrontWallXStart, this.mazeFrontWallY, this.trackZCentre ],
                                                    [ this.mazeFrameThickness, this.mazeFrontWallHeight, this.trackWidth],
                                                    this.colorHue
                                                  );

        this.mazeCeiling        =   new FloorPiece( this.gameWorld,
                                                    [ this.mazeCeilingXStart, this.mazeCeilingY, this.trackZCentre ],
                                                    [ this.mazeCeilingXLength, this.mazeFrameThickness, this.trackWidth],
                                                    this.colorHue
                                                  );

        this.mazeBackWall       =   new FloorPiece( this.gameWorld, 
                                                    [ this.mazeBackWallXStart, this.mazeBackWallY, this.trackZCentre ],
                                                    [ this.mazeFrameThickness, this.mazeBackWallHeight, this.trackWidth ],
                                                    this.colorHue
                                                  );
        
        this.mazeLeftWall       =   new FloorPiece( this.gameWorld,
                                                    [ this.mazeLeftWallXStart, this.mazeLeftWallY, this.mazeLeftWallZCentre ],
                                                    [ this.mazeLeftWallXLength, this.mazeLeftWallHeight, this.mazeFrameThickness / 2 ],
                                                    this.colorHue
                                                  );


        ///////////////////////////////////////
        /////////// LOWER SECTION /////////////
        ///////////////////////////////////////

        this.mazeLowerToMiddleJumpPlatformXStart = this.mazeLowerFloorXStart + 10.0;
        this.mazeLowerToMiddleJumpPlatformXLength = 4;
        this.mazeLowerToMiddleJumpPlatformJumpHeight = 1.5;
        this.mazeLowerToMiddleJumpPlatformY = this.lowerSectionY + this.mazeLowerToMiddleJumpPlatformJumpHeight;
        this.mazeLowerToMiddleJumpPlatformZLength = this.trackWidth / 2
        
        this.mazeLowerBigBoxXLength = 2.0;
        this.mazeLowerBigBoxXStart = this.mazeBackWallXStart - this.mazeLowerBigBoxXLength;
        this.mazeLowerBigBoxHeight = 2.0;
        this.mazeLowerBigBoxY = this.lowerSectionY + this.mazeLowerBigBoxHeight;
        this.mazeLowerBigBoxZLength = this.trackWidth / 2;

        this.mazeLowerSmallBoxXLength = this.mazeLowerBigBoxXLength + 2;
        this.mazeLowerSmallBoxXStart = this.mazeBackWallXStart - this.mazeLowerSmallBoxXLength;
        this.mazeLowerSmallBoxHeight = 1.0;
        this.mazeLowerSmallBoxY = this.lowerSectionY + this.mazeLowerSmallBoxHeight;
        this.mazeLowerSmallBoxZLength = this.mazeLowerBigBoxZLength;
        
        this.mazeLowerToMiddleJumpPlatform  =   new FloorPiece( this.gameWorld, 
                                                                [ this.mazeLowerToMiddleJumpPlatformXStart, this.mazeLowerToMiddleJumpPlatformY, this.trackZCentre - this.mazeLowerToMiddleJumpPlatformZLength ],
                                                                [ this.mazeLowerToMiddleJumpPlatformXLength, this.mazePlatformThickness, this.mazeLowerToMiddleJumpPlatformZLength],
                                                                this.colorHue
                                                              );

        this.mazeLowerSmallBox      =       new FloorPiece ( this.gameWorld, 
                                                             [ this.mazeLowerSmallBoxXStart, this.mazeLowerSmallBoxY, this.trackZCentre - this.mazeLowerSmallBoxZLength],
                                                             [ this.mazeLowerSmallBoxXLength, this.mazeLowerSmallBoxHeight, this.mazeLowerSmallBoxZLength],
                                                             this.colorHue
                                                           );
        
        this.mazeLowerBigBox        =       new FloorPiece ( this.gameWorld, 
                                                             [ this.mazeLowerBigBoxXStart, this.mazeLowerBigBoxY, this.trackZCentre + this.mazeLowerBigBoxZLength],
                                                             [ this.mazeLowerBigBoxXLength, this.mazeLowerBigBoxHeight, this.mazeLowerBigBoxZLength],
                                                             this.colorHue
                                                           );

        ///////////////////////////////////////
        /////////// MIDDLE SECTION ////////////
        ///////////////////////////////////////

        this.mazePlatformtoMiddleFloorJumpHeight = 1.5;

        this.mazeMiddleFloorFrontSectionXStart = this.mazeLowerFloorXStart + this.mazeFrameThickness;
        this.mazeMiddleFloorFrontSectionXLength = this.mazeLowerToMiddleJumpPlatformXStart - this.mazeMiddleFloorFrontSectionXStart;
        this.mazeMiddleFloorFrontSectionY = this.mazeLowerToMiddleJumpPlatformY + this.mazePlatformtoMiddleFloorJumpHeight;

        this.mazeMiddleFloorMiddleSectionXStart = this.mazeLowerToMiddleJumpPlatformXStart;
        this.mazeMiddleFloorMiddleSectionXLength = this.mazeLowerToMiddleJumpPlatformXLength;
        this.mazeMiddleFloorMiddleSectionY = this.mazeMiddleFloorFrontSectionY;
        this.mazeMiddleFloorMiddleSectionZLength = this.trackWidth / 2

        this.mazeMiddleFloorBackSectionXStart = this.mazeMiddleFloorMiddleSectionXStart + this.mazeMiddleFloorMiddleSectionXLength;
        this.mazeMiddleFloorBackSectionXLength = (this.mazeBackWallXStart - this.mazeMiddleFloorBackSectionXStart ) / 2;
        this.mazeMiddleFloorBackSectionY = this.mazeMiddleFloorFrontSectionY;

        this.mazeMiddleFloorFrontSection    =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleFloorFrontSectionXStart, this.mazeMiddleFloorFrontSectionY, this.trackZCentre ],
                                                                [ this.mazeMiddleFloorFrontSectionXLength, this.mazePlatformThickness, this.trackWidth ],
                                                                this.colorHue
                                                              );

        this.mazeMiddleFloorMiddleSection    =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleFloorMiddleSectionXStart, this.mazeMiddleFloorMiddleSectionY, this.trackZCentre + this.mazeMiddleFloorMiddleSectionZLength ],
                                                                [ this.mazeMiddleFloorMiddleSectionXLength, this.mazePlatformThickness, this.mazeMiddleFloorMiddleSectionZLength ],
                                                                this.colorHue
                                                              );

        this.mazeMiddleFloorMiddleSection    =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleFloorBackSectionXStart, this.mazeMiddleFloorBackSectionY, this.trackZCentre ],
                                                                [ this.mazeMiddleFloorBackSectionXLength, this.mazePlatformThickness, this.trackWidth ],
                                                                this.colorHue
                                                              );

        // temporary lighting

        this.lvl1hemlight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 2 );
        this.gameWorld.scene.add( this.lvl1hemlight );

        this.templight = new THREE.RectAreaLight( 0xff0000, 1, 1, 1 );
        this.templight.quaternion.set(-0.7071068, 0, 0, 0.7071068)    // rotate to face +x direction
        this.templight.position.set( 30, 2, 0 );
        this.templightbody = new RectAreaLightHelper( this.templight )


        this.gameWorld.scene.add( this.templight );
        this.gameWorld.scene.add( this.templightbody );

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

        this.delta = this.clock.getDelta();                         //  update delta

        // only update scene if game is in progress 
        if ( gameInProgress ) {

            this.screen?.updateScanlines( this.delta );                 // update scanline animation if screen exists

            this.hud.updateDashProgress( this.player.playerControls.dashProgress )  // update dash cooldown in hud

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
        this.hud = null;
    }

}