import * as THREE from 'three';
import World from '/js/buildWorld.js'
import Player from '/js/player.js'
import { FloorPiece, Staircase, SpawnArea, Screen, LevelCompletePlatform, OutOfBoundsPlatform, ImagePlate } from '/js/objectSpawner.js'
import {InstructionsGameMenu, PauseGameMenu, DeadGameMenu, LevelCompleteGameMenu, HUD } from '/js/menus.js'

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

        this.defaultImagePlateSize = [ 4, 4 ];
        this.defaultImageRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2 );


        
        //////////////////////////////////////
        /////////// OUT OF BOUNDS ////////////
        //////////////////////////////////////

        this.outOfBoundsPlatform = new OutOfBoundsPlatform( this.gameWorld, this.player );



        //////////////////////////////////////
        /////////////// SCREEN ///////////////
        //////////////////////////////////////

        this.screen = new Screen( this.gameWorld );



        //////////////////////////////////////
        /////////// SPAWN PLATFORM ///////////
        //////////////////////////////////////

        ///// POSITION AND SIZE VARIABLES /////

        this.spawnPlatformXStart = -0.50;
        
        this.wasdImagePlateX = this.spawnPlatformXStart + 1.50 + 3.0;
        this.wasdImagePlateY = this.playerSpawnY - 0.5;
        
        
        ///// CREATE FLOOR PIECES & DOOR //////
        
        // create spawn door and spawn platform
        this.spawnArea = new SpawnArea( this.gameWorld, this.spawnPlatformXStart, this.playerSpawnY, this.playerSize.y, this.trackZCentre )
        
        
        ///////// CREATE IMAGE PLATE //////////

        this.wasdImagePlate    =   new ImagePlate( this.gameWorld, 
                                                   this.defaultImagePlateSize, 
                                                   [ this.wasdImagePlateX, this.wasdImagePlateY, this.trackZCentre ], 
                                                   this.defaultImageRotationMatrix, 
                                                   'wasd'
                                                 );

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

        this.pressSprintToJumpImagePlateX = this.firstFloorXStart + this.firstFloorXLength + ( this.walkJumpGapDistance / 2 );
        this.pressSprintToJumpImagePlateY = this.lowerSectionY + 0.6


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


        ///////// CREATE IMAGE PLATE /////////

        this.pressSpaceToJumpImagePlate    =   new ImagePlate( this.gameWorld,
                                                                this.defaultImagePlateSize,
                                                                [ this.pressSprintToJumpImagePlateX, this.pressSprintToJumpImagePlateY, this.trackZCentre ], 
                                                                this.defaultImageRotationMatrix, 
                                                                'press_space_to_jump'
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

        this.spaceAndWImagePlateX = this.raisedFloorToClimbXStart - 0.2;
        this.spaceAndWImagePlateY = this.raisedSectionY + 1.50;
        this.spaceAndWImagePlateNormalTarget = new THREE.Vector3( 0.5, -1, 0 ).normalize();
        this.spaceAndWImagePlateUp = new THREE.Vector3( 0, -1, 0 ).normalize();
        this.spaceAndWImagePlateRight = new THREE.Vector3().crossVectors( this.spaceAndWImagePlateUp, this.spaceAndWImagePlateNormalTarget ).normalize();
        this.spaceAndWImagePlateUpTarget = new THREE.Vector3().crossVectors( this.spaceAndWImagePlateNormalTarget, this.spaceAndWImagePlateRight).normalize();
        this.spaceAndWImageRotationMatrix = new THREE.Matrix4().makeBasis(this.spaceAndWImagePlateRight, this.spaceAndWImagePlateUpTarget, this.spaceAndWImagePlateNormalTarget )
        
        this.shiftToSprintX = this.floorAfterSprintJumpXStart - ( this.sprintJumpGapDistance / 2 )
        this.shiftToSprintY = this.raisedSectionY + 0.6;
        this.shiftToSprintTextureString = 'press'.repeat( Number( toggleSprint ) ) + 'hold'.repeat( Number( !toggleSprint ) ) + '_shift_to_sprint';

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


        ///////// CREATE IMAGE PLATE /////////

        this.spaceAndWImagePlate    =   new ImagePlate( this.gameWorld, 
                                                        this.defaultImagePlateSize, 
                                                        [ this.spaceAndWImagePlateX, this.spaceAndWImagePlateY, this.trackZCentre ], 
                                                        this.spaceAndWImageRotationMatrix, 
                                                        'space_+_w'
                                                      );

        this.shiftToSprint          =   new ImagePlate( this.gameWorld, 
                                                        this.defaultImagePlateSize, 
                                                        [ this.shiftToSprintX, this.shiftToSprintY, this.trackZCentre ], 
                                                        this.defaultImageRotationMatrix, 
                                                        this.shiftToSprintTextureString
                                                      );



        //////////////////////////////////////
        //////////// DASH SECTION ////////////
        //////////////////////////////////////


        ///// POSITION AND SIZE VARIABLES ////

        this.dashGapDistance = 6.00;
        this.dashGapDrop = 9.50;                // from raisedSectionY to floorBelowDashEntryY

        this.dashGapOpeningXStart = this.floorAfterSprintJumpXStart + this.floorAfterSprintJumpXLength + this.dashGapDistance;

        this.wallAboveDashEntryRaisedBy = 2.50;
        this.wallAboveDashEntryY = this.raisedSectionY + this.wallAboveDashEntryRaisedBy;
        this.dashGapOpeningHeight = 2.00;
        this.wallAboveDashEntryHeight = this.dashGapDrop - this.dashGapOpeningHeight + this.wallAboveDashEntryRaisedBy;

        this.floorBelowDashEntryY = this.raisedSectionY - this.dashGapDrop;
        this.floorBelowDashEntryXLength = 4.00;

        this.pressRToDashX = this.dashGapOpeningXStart - 1.0;
        this.pressRToDashY = this.raisedSectionY + 0.6;


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


        ///////// CREATE IMAGE PLATE /////////

        this.pressRToDash           =   new ImagePlate( this.gameWorld, 
                                                        this.defaultImagePlateSize, 
                                                        [ this.pressRToDashX, this.pressRToDashY, this.trackZCentre ], 
                                                        this.defaultImageRotationMatrix, 
                                                        'press_r_to_dash'
                                                      );

        this.dashArrows             =   new ImagePlate( this.gameWorld, 
                                                        [ 5, 7 ], 
                                                        [ this.pressRToDashX, this.pressRToDashY - 2.8, this.trackZCentre ], 
                                                        this.defaultImageRotationMatrix, 
                                                        'dash_arrows'
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

        this.rightFloorBetweenTubesXStart = this.tubeSectionXStart + 4 * (this.tubeSectionXLength / 8 );
        this.rightFloorAfterSecondTubeXStart = this.tubeSectionXStart + 7 * (this.tubeSectionXLength / 8 );

        this.pressTToSwitchCamerasX = this.tubeSectionXStart + ( this.tubeSectionXLength / 2 ) ;
        this.pressTToSwitchCamerasY = this.tubeSectionFloorHeight + 1.0;

        this.tubeSkullAndCrossbonesX = this.rightFloorBetweenTubesXStart - ( this.tubeXLength / 2 );
        this.tubeSkullAndCrossbonesY = this.tubeSectionFloorHeight - 1.5;
        this.tubeSkullAndCrossbonesZ = this.trackZCentre + ( 2 * this.tubeZLength ) + 0.05;
        this.tubeSkullAndCrossbonesRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0 ,0 ), 0 );
        


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

        ///////// CREATE IMAGE PLATE /////////

        this.pressTToSwitchCameras          =   new ImagePlate( this.gameWorld, 
                                                                this.defaultImagePlateSize, 
                                                                [ this.pressTToSwitchCamerasX, this.pressTToSwitchCamerasY, this.trackZCentre ], 
                                                                this.defaultImageRotationMatrix, 
                                                                'press_t_to_switch_cameras'
                                                      );

        this.tubeSkullAndCrossbones         =   new ImagePlate( this.gameWorld, 
                                                                this.defaultImagePlateSize, 
                                                                [ this.tubeSkullAndCrossbonesX, this.tubeSkullAndCrossbonesY, this.tubeSkullAndCrossbonesZ ], 
                                                                this.tubeSkullAndCrossbonesRotationMatrix, 
                                                                'tube_skull_and_crossbones'
                                                              );

        this.tubeSpikes                     =   new ImagePlate( this.gameWorld, 
                                                                [ 2.6, 7 ], 
                                                                [ this.tubeSkullAndCrossbonesX, this.tubeSkullAndCrossbonesY - 3.5, this.tubeSkullAndCrossbonesZ ], 
                                                                this.tubeSkullAndCrossbonesRotationMatrix, 
                                                                'tube_spikes'
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


        //////////////////////////////////////
        ////////// LEVEL COMPLETE ////////////
        //////////////////////////////////////

        this.levelCompletePlatformXStart = this.rightFloorBetweenTubesXStart + this.rightFloorBetweenTubesXLength + this.tubeWallThickness;
        this.levelCompletePlatformXLength = this.rightFloorAfterSecondTubeXStart - this.tubeWallThickness - this.levelCompletePlatformXStart;
        this.levelCompletePlatformThickness = 0.5;
        this.levelCompletePlatformY = this.tubeSectionFloorHeight - this.tubeDropLength + this.levelCompletePlatformThickness
        this.levelCompleteZLength = this.tubeZLength;
        this.levelCompleteZCentre = this.trackZCentre + this.tubeZLength;

        this.levelCompletePlatform = new LevelCompletePlatform( this.gameWorld, 
                                                                this.player, 
                                                                [ this.levelCompletePlatformXStart,
                                                                  this.levelCompletePlatformY,
                                                                  this.levelCompleteZCentre
                                                                ], 
                                                                [ this.levelCompletePlatformXLength,
                                                                  this.levelCompletePlatformThickness,
                                                                  this.levelCompleteZLength
                                                                ]
                                                               );



        // Set up lighting
        const directionalLight = new THREE.DirectionalLight( 0xffaaff, 0.5 );
        directionalLight.position.set( 30, 40, 100 );
        directionalLight.target.position.set( 30, 0, 0 );
        this.gameWorld.scene.add(directionalLight);
        
        const dlighthelper = new THREE.DirectionalLightHelper( directionalLight );
        if ( debug ) { this.gameWorld.scene.add( dlighthelper ); }
        
        const hemlight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
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

        this.defaultImagePlateSize = [ 4, 4 ];
        this.defaultImageRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2 );

        //////////////////////////////////////
        /////////// OUT OF BOUNDS ////////////
        //////////////////////////////////////

        this.outOfBoundsPlatform = new OutOfBoundsPlatform( this.gameWorld, this.player );



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
        this.mazeLowerFloorXLength = 28.00;
        
        this.mazeFrontWallXStart = this.mazeLowerFloorXStart;
        this.mazeFrontWallHeight = 13.0;
        this.mazeFrontWallY = this.lowerSectionY + this.mazeOpeningHeight + this.mazeFrontWallHeight;

        this.mazeCeilingXStart = this.mazeLowerFloorXStart;
        this.mazeCeilingXLength = this.mazeLowerFloorXLength;
        this.mazeCeilingY = this.lowerSectionY + this.mazeOpeningHeight + this.mazeFrontWallHeight + this.mazeFrameThickness;

        this.mazeBackWallXStart = this.mazeLowerFloorXStart + this.mazeLowerFloorXLength;
        this.mazeBackWallY = this.mazeCeilingY;
        this.mazeBackWallHeight = this.mazeOpeningHeight + this.mazeFrontWallHeight + this.mazeFrameThickness;

        this.mazeLeftWallXStart = this.mazeLowerFloorXStart;
        this.mazeLeftWallXLength = this.mazeLowerFloorXLength;
        this.mazeLeftWallY = this.mazeCeilingY;
        this.mazeLeftWallHeight = this.mazeBackWallHeight + this.mazeFrameThickness;
        this.mazeLeftWallZCentre = this.trackZCentre - ( this.trackWidth ) - ( this.mazePlatformThickness / 2 );

        this.theMazeX = this.mazeFrontWallXStart - 0.05;
        this.theMazeY = this.lowerSectionY + this.mazeOpeningHeight + 1.0;



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
                                                    [ this.mazeLeftWallXLength, this.mazeLeftWallHeight, this.mazePlatformThickness / 2 ],
                                                    this.colorHue
                                                  );

        ///////// CREATE IMAGE PLATE /////////

        this.theMaze    =   new ImagePlate( this.gameWorld,
                                            this.defaultImagePlateSize,
                                            [ this.theMazeX, this.theMazeY, this.trackZCentre ], 
                                            this.defaultImageRotationMatrix, 
                                            'the_maze'
                                          );


        ///////////////////////////////////////
        /////////// LOWER SECTION /////////////
        ///////////////////////////////////////

        this.mazeLowerToMiddleJumpPlatformXStart = this.mazeLowerFloorXStart + 10.0;
        this.mazeLowerToMiddleJumpPlatformXLength = 4;
        this.mazeLowerToMiddleJumpPlatformJumpHeight = 1.5;
        this.mazeLowerToMiddleJumpPlatformY = this.lowerSectionY + this.mazeLowerToMiddleJumpPlatformJumpHeight;
        this.mazeLowerToMiddleJumpPlatformZLength = this.trackWidth / 2
        
        this.mazeLowerBigBoxXLength = 4.0;
        this.mazeLowerBigBoxXStart = this.mazeBackWallXStart - this.mazeLowerBigBoxXLength;
        this.mazeLowerBigBoxHeight = 2.0;
        this.mazeLowerBigBoxY = this.lowerSectionY + this.mazeLowerBigBoxHeight;
        this.mazeLowerBigBoxZLength = this.trackWidth / 2;

        this.mazeLowerSmallBoxXLength = this.mazeLowerBigBoxXLength + 2;
        this.mazeLowerSmallBoxXStart = this.mazeBackWallXStart - this.mazeLowerSmallBoxXLength;
        this.mazeLowerSmallBoxHeight = 1.0;
        this.mazeLowerSmallBoxY = this.lowerSectionY + this.mazeLowerSmallBoxHeight;
        this.mazeLowerSmallBoxZLength = this.mazeLowerBigBoxZLength;

        this.mazeFloorArrowX = this.mazeLowerToMiddleJumpPlatformXStart;
        this.mazeFloorArrowY = this.lowerSectionY + 0.1;
        this.mazeFloorArrowZ = this.trackZCentre + this.mazeLowerToMiddleJumpPlatformZLength;
        this.mazeFloorArrowRotationMatrixYAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2 );
        this.mazeFloorArrowRotationMatrixZAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, 0 ), -Math.PI/2 );
        this.mazeFloorArrowRotationMatrixFinal = this.mazeFloorArrowRotationMatrixYAxis.multiply( this.mazeFloorArrowRotationMatrixZAxis );

        this.nothingDownHereX = this.mazeBackWallXStart - 0.05;
        this.nothingDownHereY = this.mazeLowerBigBoxY + 1.0;
        
        this.mazeLowerToMiddleJumpPlatform  =   new FloorPiece( this.gameWorld, 
                                                                [ this.mazeLowerToMiddleJumpPlatformXStart, this.mazeLowerToMiddleJumpPlatformY, this.trackZCentre - this.mazeLowerToMiddleJumpPlatformZLength ],
                                                                [ this.mazeLowerToMiddleJumpPlatformXLength, this.mazeLowerToMiddleJumpPlatformJumpHeight, this.mazeLowerToMiddleJumpPlatformZLength],
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


        ///////// CREATE IMAGE PLATE /////////

        this.mazeFloorArrow    =   new ImagePlate( this.gameWorld,
                                                   this.defaultImagePlateSize,
                                                   [ this.mazeFloorArrowX, this.mazeFloorArrowY, this.mazeFloorArrowZ ], 
                                                   this.mazeFloorArrowRotationMatrixFinal, 
                                                   'straight_arrow'
                                                 );

        this.nothingDownHere    =   new ImagePlate( this.gameWorld,
                                                   this.defaultImagePlateSize,
                                                   [ this.nothingDownHereX, this.nothingDownHereY, this.trackZCentre ], 
                                                   this.defaultImageRotationMatrix, 
                                                   'nothing_down_here'
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

        this.mazeMiddleWallToUpperXStart = this.mazeMiddleFloorBackSectionXStart + this.mazeMiddleFloorBackSectionXLength;
        this.mazeMiddleWallToUpperHeight = 8.3;
        this.mazeMiddleWallToUpperY = this.mazeMiddleFloorBackSectionY + this.mazeMiddleWallToUpperHeight;
        this.mazeMiddleWallToUpperOpeningHeight = 1.5;

        this.mazeMiddleFloorFrontSection    =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleFloorFrontSectionXStart, this.mazeMiddleFloorFrontSectionY, this.trackZCentre ],
                                                                [ this.mazeMiddleFloorFrontSectionXLength, this.mazePlatformThickness, this.trackWidth ],
                                                                this.colorHue
                                                              );

        this.mazeMiddleFloorMiddleSection   =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleFloorMiddleSectionXStart, this.mazeMiddleFloorMiddleSectionY, this.trackZCentre + this.mazeMiddleFloorMiddleSectionZLength ],
                                                                [ this.mazeMiddleFloorMiddleSectionXLength, this.mazePlatformThickness, this.mazeMiddleFloorMiddleSectionZLength ],
                                                                this.colorHue
                                                              );

        this.mazeMiddleFloorBackSection     =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleFloorBackSectionXStart, this.mazeMiddleFloorBackSectionY, this.trackZCentre ],
                                                                [ this.mazeMiddleFloorBackSectionXLength, this.mazePlatformThickness, this.trackWidth ],
                                                                this.colorHue
                                                              );

        this.mazeMiddleWallToUpper          =   new FloorPiece( this.gameWorld,
                                                                [ this.mazeMiddleWallToUpperXStart, this.mazeMiddleWallToUpperY, this.trackZCentre ],
                                                                [ this.mazePlatformThickness, this.mazeMiddleWallToUpperHeight - this.mazeMiddleWallToUpperOpeningHeight, this.trackWidth ],
                                                                this.colorHue
                                                              );

        ///////////////////////////////////////
        /////////// PARKOUR SECTION ///////////
        ///////////////////////////////////////

        this.parkourStartingBoxXLength = 2.0;
        this.parkourStartingBoxXStart = this.mazeMiddleWallToUpperXStart - this.parkourStartingBoxXLength;
        this.parkourStartingBoxHeight = this.mazeMiddleWallToUpperOpeningHeight;
        this.parkourStartingBoxY = this.mazeMiddleFloorBackSectionY + this.parkourStartingBoxHeight;
        this.parkourStartingBoxZLength = this.trackWidth / 2;
        this.parkourStartingBoxZCentre = this.trackZCentre - this.parkourStartingBoxZLength;

        this.jumpFromBoxToPlatformAfterBoxXDistance = 2.0;

        this.parkourSmallPlatformXLength = 1.0;
        this.parkourSmallPlatformZLength = this.trackWidth / 4;
        this.parkourWidePlatformXLength = 4.0;
        this.parkourWidePlatformZLength = this.trackWidth;
        this.parkourWidePlatformZCentre = this.trackZCentre;

        this.parkourPlatformAfterBoxXStart = this.parkourStartingBoxXStart - this.jumpFromBoxToPlatformAfterBoxXDistance - this.parkourSmallPlatformXLength;
        this.parkourPlatformAfterBoxY = this.parkourStartingBoxY + 1;
        this.parkourPlatformAfterBoxZCentre = this.trackZCentre - ( 3 * this.parkourSmallPlatformZLength );

        this.jumpFromPlatformToFirstWideDistance = 3.0;

        this.firstWidePlatformXStart = this.parkourPlatformAfterBoxXStart - this.jumpFromPlatformToFirstWideDistance - this.parkourWidePlatformXLength;
        this.firstWidePlatformY = this.parkourPlatformAfterBoxY + 1;

        this.jumpFromFirstWideToFirstPlatformAfterDistance = 2.0;

        this.firstPlatformAfterFirstWideXStart = this.firstWidePlatformXStart - this.jumpFromFirstWideToFirstPlatformAfterDistance - this.parkourSmallPlatformXLength;
        this.firstPlatformAfterFirstWideY = this.firstWidePlatformY + 1;

        this.longPlatformAfterFirstWideZCentre = this.trackZCentre + ( 3 * this.parkourSmallPlatformZLength );
        this.longPlatformAfterFirstWideXStart = this.firstWidePlatformXStart - this.jumpFromFirstWideToFirstPlatformAfterDistance - ( 2 * this.parkourSmallPlatformXLength );
        this.longPlatformAfterFirstWideY = this.firstPlatformAfterFirstWideY + 1.0;

        this.secondPlatformAfterFirstWideXStart = this.firstPlatformAfterFirstWideXStart - this.parkourSmallPlatformXLength;
        this.secondPlatformAfterFirstWideY = this.longPlatformAfterFirstWideY + 1.0;

        this.secondWidePlatformXStart = this.firstWidePlatformXStart;
        this.secondWidePlatformY = this.secondPlatformAfterFirstWideY;

        this.arcingArrowLeftLowerFromBoxX = this.parkourStartingBoxXStart - 0.8;
        this.arcingArrowLeftLowerFromBoxY = this.parkourStartingBoxY + 1.5;
        this.arcingArrowLeftLowerFromBoxZ = this.trackZCentre - this.trackWidth + 0.05;
        this.arcingArrowLeftLowerRotationMatrix = this.mazeFloorArrowRotationMatrixYAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, 0 ), 0 );

        this.arcingArrowLeftUpperX = this.firstPlatformAfterFirstWideXStart + 1.0;
        this.arcingArrowLeftUpperY = this.firstPlatformAfterFirstWideY + 0.8;

        this.arcingArrowRightUpperX = this.longPlatformAfterFirstWideXStart + 1.0;
        this.arcingArrowRightUpperY = this.longPlatformAfterFirstWideY + 0.8;

        this.arcingArrowUpperRotationMatrix = this.mazeFloorArrowRotationMatrixYAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
        this.arcingArrowLeftUpperRotationMatrix = this.mazeFloorArrowRotationMatrixYAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ), -Math.PI / 8 );
        this.arcingArrowRightUpperRotationMatrix = this.mazeFloorArrowRotationMatrixYAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ), Math.PI / 6 );

        
        
        this.parkourStartingBox             =   new FloorPiece( this.gameWorld,
                                                                [ this.parkourStartingBoxXStart, this.parkourStartingBoxY, this.parkourStartingBoxZCentre ],
                                                                [ this.parkourStartingBoxXLength, this.parkourStartingBoxHeight, this.parkourStartingBoxZLength ],
                                                                this.colorHue
                                                              );
        
        this.parkourPlatformAfterBox        =   new FloorPiece( this.gameWorld,
                                                                [ this.parkourPlatformAfterBoxXStart, this.parkourPlatformAfterBoxY, this.parkourPlatformAfterBoxZCentre ],
                                                                [ this.parkourSmallPlatformXLength, this.mazePlatformThickness, this.parkourSmallPlatformZLength ],
                                                                this.colorHue
                                                              );
        
        this.firstWidePlatformAfterBox      =   new FloorPiece( this.gameWorld,
                                                                [ this.firstWidePlatformXStart, this.firstWidePlatformY, this.parkourWidePlatformZCentre ],
                                                                [ this.parkourWidePlatformXLength, this.mazePlatformThickness, this.parkourWidePlatformZLength ],
                                                                this.colorHue
                                                              );
        
        this.firstPlatformAfterFirstWide    =   new FloorPiece( this.gameWorld,
                                                                [ this.firstPlatformAfterFirstWideXStart, this.firstPlatformAfterFirstWideY, this.parkourPlatformAfterBoxZCentre ],
                                                                [ this.parkourSmallPlatformXLength, this.mazePlatformThickness, this.parkourSmallPlatformZLength ],
                                                                this.colorHue
                                                              );
                                                            
        this.longPlatformAfterFirstWide    =   new FloorPiece( this.gameWorld,
                                                                [ this.longPlatformAfterFirstWideXStart, this.longPlatformAfterFirstWideY, this.longPlatformAfterFirstWideZCentre ],
                                                                [ 2 * this.parkourSmallPlatformXLength, this.mazePlatformThickness, this.parkourSmallPlatformZLength ],
                                                                this.colorHue
                                                             );
        
        this.secondPlatformAfterFirstWide    =   new FloorPiece( this.gameWorld,
                                                                [ this.secondPlatformAfterFirstWideXStart, this.secondPlatformAfterFirstWideY, this.parkourPlatformAfterBoxZCentre ],
                                                                [ this.parkourSmallPlatformXLength, this.mazePlatformThickness, this.parkourSmallPlatformZLength ],
                                                                this.colorHue
                                                               );
                                                            
        this.secondWidePlatformAfterBox      =   new FloorPiece( this.gameWorld,
                                                                [ this.secondWidePlatformXStart, this.secondWidePlatformY, this.parkourWidePlatformZCentre ],
                                                                [ this.parkourWidePlatformXLength, this.mazePlatformThickness, this.parkourWidePlatformZLength ],
                                                                this.colorHue
                                                               );


        ///////// CREATE IMAGE PLATE /////////

        this.arcingArrowLeftLowerFromBox        =   new ImagePlate( this.gameWorld,
                                                                    [ 3.2, 3 ],
                                                                    [ this.arcingArrowLeftLowerFromBoxX, this.arcingArrowLeftLowerFromBoxY, this.arcingArrowLeftLowerFromBoxZ ], 
                                                                    this.arcingArrowLeftLowerRotationMatrix, 
                                                                    'arcing_arrow_left'
                                                                  );

        this.arcingArrowLeftLowerFromPlatform   =   new ImagePlate( this.gameWorld,
                                                                    [ 3.2, 4 ],
                                                                    [ this.arcingArrowLeftLowerFromBoxX - 3.4, this.arcingArrowLeftLowerFromBoxY + 1.0, this.arcingArrowLeftLowerFromBoxZ ], 
                                                                    this.arcingArrowLeftLowerRotationMatrix, 
                                                                    'arcing_arrow_left'
                                                                  );

        this.arcingArrowLeftUpper               =   new ImagePlate( this.gameWorld,
                                                                    [ 2.5, 3 ],
                                                                    [ this.arcingArrowLeftUpperX, this.arcingArrowLeftUpperY, this.parkourPlatformAfterBoxZCentre + 1.5 ], 
                                                                    this.arcingArrowUpperRotationMatrix.multiply( this.arcingArrowLeftUpperRotationMatrix ), 
                                                                    'arcing_arrow_left'
                                                                  );

        this.arcingArrowRightUpper               =   new ImagePlate( this.gameWorld,
                                                                     [ 2.5, 3 ],
                                                                     [ this.arcingArrowRightUpperX, this.arcingArrowRightUpperY, this.longPlatformAfterFirstWideZCentre - 1.5 ], 
                                                                     this.arcingArrowUpperRotationMatrix.multiply( this.arcingArrowRightUpperRotationMatrix ), 
                                                                     'arcing_arrow_right'
                                                                   );
        
        
        
        ///////////////////////////////////////
        ////////////// STAIRCASE //////////////
        ///////////////////////////////////////

        
        this.jumpToFirstStaicase = 1.5;

        this.firstStaircaseToUpperXStart = this.secondWidePlatformXStart + this.parkourWidePlatformXLength + this.jumpToFirstStaicase;
        this.firstStaircaseToUpperNumOfSteps = 6;
        this.firstStaircaseToUpperStepDepth = 0.5;
        this.firstStaircaseToUpperHeight = this.firstStaircaseToUpperNumOfSteps * 0.15;
        this.firstStaircaseToUpperXLength = this.firstStaircaseToUpperNumOfSteps * this.firstStaircaseToUpperStepDepth;

        this.staircaseHalfStepXStart = this.firstStaircaseToUpperXStart + this.firstStaircaseToUpperXLength;
        this.staircaseHalfStepXLength = this.firstStaircaseToUpperStepDepth;
        this.staircaseHalfStepY = this.secondWidePlatformY + this.firstStaircaseToUpperHeight;
        this.staircaseHalfStepThickness = 0.15;
        this.staircaseHalfStepZLength = this.trackWidth / 2;
        this.staircaseHalfStepZCentre = this.trackZCentre - this.staircaseHalfStepZLength;

        this.secondStaircaseToUpperXStart = this.staircaseHalfStepXStart + this.staircaseHalfStepXLength;
        this.secondStaircaseToUpperNumOfSteps = 6;
        this.secondStaircaseToUpperStepDepth = 0.5;
        this.secondStaircaseToUpperHeight = this.secondStaircaseToUpperNumOfSteps * 0.15;
        this.secondStaircaseToUpperXLength = this.secondStaircaseToUpperNumOfSteps * this.secondStaircaseToUpperStepDepth;

        
        this.firstStaircaseToUpper          =   new Staircase( this.gameWorld, 
                                                               [ this.firstStaircaseToUpperXStart, this.secondWidePlatformY, this.parkourWidePlatformZCentre ], 
                                                               this.firstStaircaseToUpperNumOfSteps, 
                                                               this.firstStaircaseToUpperStepDepth, 
                                                               this.parkourWidePlatformZLength, 
                                                               this.colorHue
                                                             );

        this.staircaseHalfStep              =   new FloorPiece( this.gameWorld,
                                                               [ this.staircaseHalfStepXStart, this.staircaseHalfStepY, this.staircaseHalfStepZCentre ],
                                                               [ this.staircaseHalfStepXLength, this.staircaseHalfStepThickness, this.staircaseHalfStepZLength],
                                                               this.colorHue
                                                              );


        this.secondStaircaseToUpper         =   new Staircase( this.gameWorld, 
                                                               [ this.secondStaircaseToUpperXStart, this.staircaseHalfStepY, this.parkourWidePlatformZCentre ], 
                                                               this.secondStaircaseToUpperNumOfSteps, 
                                                               this.secondStaircaseToUpperStepDepth, 
                                                               this.parkourWidePlatformZLength, 
                                                               this.colorHue
                                                             );


        ///////////////////////////////////////
        //////////// UPPER SECTION ////////////
        ///////////////////////////////////////

        this.upperFloorSectionXStart = this.mazeMiddleWallToUpperXStart + this.mazePlatformThickness;
        this.upperFloorSectionXLength = this.mazeBackWallXStart - this.upperFloorSectionXStart;
        this.upperFloorSectionY = this.staircaseHalfStepY + this.secondStaircaseToUpperHeight;

        this.dropDownFromUpperFloorSectionY = this.upperFloorSectionY - 1.0;
        this.dropDownFromUpperFloorSectionPathZLength = 0.5;
        this.dropDownFromUpperFloorSectionZLength = this.trackWidth + this.dropDownFromUpperFloorSectionPathZLength;
        this.dropDownFromUpperFloorSectionZCentre = this.trackZCentre + this.dropDownFromUpperFloorSectionPathZLength;

        this.pathFromDropDownXStart = this.upperFloorSectionXStart + this.upperFloorSectionXLength;
        this.pathFromDropDownZCentre = this.trackZCentre + this.trackWidth + this.dropDownFromUpperFloorSectionPathZLength;
        this.pathFromDropDownXLength = 4.0;

        this.ifOnlyCameraAngleX = this.mazeBackWallXStart - 0.05;
        this.ifOnlyCameraAngleY = this.upperFloorSectionY + 1.2;


        this.upperFloorSection              =   new FloorPiece( this.gameWorld, 
                                                                [ this.upperFloorSectionXStart, this.upperFloorSectionY, this.trackZCentre ],
                                                                [ this.upperFloorSectionXLength, this.mazePlatformThickness, this.trackWidth ],
                                                                this.colorHue
                                                              );

        this.dropDownFromUpperFloorSection      =   new FloorPiece( this.gameWorld, 
                                                                    [ this.upperFloorSectionXStart, this.dropDownFromUpperFloorSectionY, this.dropDownFromUpperFloorSectionZCentre ],
                                                                    [ this.upperFloorSectionXLength, this.mazePlatformThickness, this.dropDownFromUpperFloorSectionZLength ],
                                                                    this.colorHue
                                                                );

        this.pathFromDropDown                   =   new FloorPiece( this.gameWorld,
                                                                    [ this.pathFromDropDownXStart, this.dropDownFromUpperFloorSectionY, this.pathFromDropDownZCentre ],
                                                                    [ this.pathFromDropDownXLength, this.mazePlatformThickness, this.dropDownFromUpperFloorSectionPathZLength ],
                                                                    this.colorHue
                                                                  );


        ///////// CREATE IMAGE PLATE /////////

        this.ifOnlyCameraAngle        =   new ImagePlate( this.gameWorld,
                                                          [ 3.5, 3.5 ],
                                                          [ this.ifOnlyCameraAngleX, this.ifOnlyCameraAngleY, this.trackZCentre ], 
                                                          this.defaultImageRotationMatrix, 
                                                          'if_only_camera_angle'
                                                        );

        ///////////////////////////////////////
        ///////////////// TUBE ////////////////
        ///////////////////////////////////////

        this.tubeWallThickness = 0.10;
        this.tubeWallLength = 1.0;
        this.tubeWallHeight = 0.5
        this.tubeRaisedWallY = this.dropDownFromUpperFloorSectionY + this.tubeWallHeight;
        this.tubeDropLength = 10.0;

        this.tubeBackWallXStart = this.pathFromDropDownXStart + this.pathFromDropDownXLength - this.tubeWallThickness;
        this.tubeBackWallZCentre = this.pathFromDropDownZCentre - this.dropDownFromUpperFloorSectionPathZLength - this.tubeWallLength;

        this.tubeLeftWallXStart = this.tubeBackWallXStart - ( 2 * this.tubeWallLength );
        this.tubeLeftWallZCentre = this.pathFromDropDownZCentre - this.dropDownFromUpperFloorSectionPathZLength - ( 2 * this.tubeWallLength ) + ( this.tubeWallThickness / 2 );

        this.tubeRightWallZCentre = this.pathFromDropDownZCentre - this.dropDownFromUpperFloorSectionPathZLength + ( this.tubeWallThickness / 2 );

        this.tubeFrontWallXStart = this.tubeBackWallXStart - ( 2 * this.tubeWallLength ) - this.tubeWallThickness;

        this.arrowIntoTubeX = this.tubeLeftWallXStart + this.tubeWallLength;
        this.arrowIntoTubeY = this.tubeRaisedWallY + 2.5;
        this.arrowIntoTubeRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ), Math.PI );
        


        this.tubeBackWall      =   new FloorPiece( this.gameWorld, 
                                                    [ this.tubeBackWallXStart, this.tubeRaisedWallY, this.tubeBackWallZCentre ], 
                                                    [ this.tubeWallThickness, this.tubeDropLength + this.tubeWallHeight, this.tubeWallLength ],
                                                    this.colorHue
                                                  );
        this.tubeLeftWall       =   new FloorPiece( this.gameWorld, 
                                                    [ this.tubeLeftWallXStart, this.tubeRaisedWallY, this.tubeLeftWallZCentre ], 
                                                    [ ( 2 * this.tubeWallLength ) , this.tubeDropLength + this.tubeWallHeight, ( this.tubeWallThickness / 2 ) ],
                                                    this.colorHue
                                                  );
        this.tubeRightWall      =   new FloorPiece( this.gameWorld, 
                                                    [ this.tubeLeftWallXStart, this.dropDownFromUpperFloorSectionY - this.mazePlatformThickness, this.tubeRightWallZCentre ], 
                                                    [ ( 2 * this.tubeWallLength ) , this.tubeDropLength - this.mazePlatformThickness, ( this.tubeWallThickness / 2 ) ],
                                                    this.colorHue
                                                  );
        this.tubeFrontWall      =   new FloorPiece( this.gameWorld, 
                                                    [ this.tubeFrontWallXStart, this.tubeRaisedWallY, this.tubeBackWallZCentre ], 
                                                    [ this.tubeWallThickness, this.tubeDropLength + this.tubeWallHeight, this.tubeWallLength ],
                                                    this.colorHue
                                                  );


        ///////// CREATE IMAGE PLATE /////////

        this.arrowIntoTube        =   new ImagePlate( this.gameWorld,
                                                          [ 4, 6 ],
                                                          [ this.arrowIntoTubeX, this.arrowIntoTubeY, this.tubeLeftWallZCentre + 0.2 ], 
                                                          this.arrowIntoTubeRotationMatrix, 
                                                          'straight_arrow'
                                                        );



        //////////////////////////////////////
        ////////// LEVEL COMPLETE ////////////
        //////////////////////////////////////

        this.levelCompletePlatformXStart = this.tubeFrontWallXStart + this.tubeWallThickness;
        this.levelCompletePlatformXLength = 2 * this.tubeWallLength;
        this.levelCompletePlatformThickness = 0.5;
        this.levelCompletePlatformY = this.dropDownFromUpperFloorSectionY - this.tubeDropLength + this.levelCompletePlatformThickness
        this.levelCompleteZLength = this.tubeWallLength -  ( this.tubeWallThickness / 2 );
        this.levelCompleteZCentre = this.pathFromDropDownZCentre - this.dropDownFromUpperFloorSectionPathZLength - this.tubeWallLength + ( this.tubeWallThickness / 4 );

        this.levelCompletePlatform = new LevelCompletePlatform( this.gameWorld, 
                                                                this.player, 
                                                                [ this.levelCompletePlatformXStart,
                                                                  this.levelCompletePlatformY,
                                                                  this.levelCompleteZCentre
                                                                ], 
                                                                [ this.levelCompletePlatformXLength,
                                                                  this.levelCompletePlatformThickness,
                                                                  this.levelCompleteZLength
                                                                ]
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
                this.levelCompletePlatform?.triggerContactEvent();
            }

            // if hit outOfBounds and only outOfBounds then trigger outOfBounds contactEvent (had to add the 'and only' condition to stop permadeath glitch)
            else if ( Ammo.getPointer(this.obj) === Ammo.getPointer( this.outOfBoundsPlatform.platformBody ) && this.numOverlaps == 1 ) {
                this.outOfBoundsPlatform?.triggerContactEvent();
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

            this.screen?.updateScanlines( this.delta );                 // update scanline animation if screen exists

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