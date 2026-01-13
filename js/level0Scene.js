import * as THREE from 'three';
import { FloorPiece, Staircase, SpawnArea, Screen, LevelCompletePlatform, OutOfBoundsPlatform, ImagePlate } from '/js/objectSpawner.js'
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
 


export default function createLevel0Scene( args ) {

    const { gameWorld,
            player,
            playerSpawnY,
            playerSize,
            colorHue
          } = args;


    const trackWidth = 2.00;     // width of floorpieces
    const trackZCentre = 0.00;

    const defaultImagePlateSize = [ 4, 4 ];
    const defaultImageRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2 );



    //////////////////////////////////////
    /////////// OUT OF BOUNDS ////////////
    //////////////////////////////////////

    const outOfBoundsPlatform = new OutOfBoundsPlatform( gameWorld, player );



    //////////////////////////////////////
    /////////////// SCREEN ///////////////
    //////////////////////////////////////

    const screen = new Screen( gameWorld );



    //////////////////////////////////////
    /////////// SPAWN PLATFORM ///////////
    //////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const spawnPlatformXStart = -0.50;
    
    const wasdImagePlateX = spawnPlatformXStart + 1.50 + 3.0;
    const wasdImagePlateY = playerSpawnY - 0.5;
    
    
    ///// CREATE FLOOR PIECES & DOOR //////
    
    // create spawn door and spawn platform
    const spawnArea = new SpawnArea( gameWorld, spawnPlatformXStart, playerSpawnY, playerSize.y, trackZCentre )
    
    
    ///////// CREATE IMAGE PLATE //////////

    const wasdImagePlate    =   new ImagePlate( gameWorld, 
                                                defaultImagePlateSize, 
                                                [ wasdImagePlateX, wasdImagePlateY, trackZCentre ], 
                                                defaultImageRotationMatrix, 
                                                'wasd'
                                              );

    ///////////////////////////////////////
    //////////// LOWER SECTION ////////////
    ///////////////////////////////////////


    ///// POSITION AND SIZE VARIABLES /////

    const firstFloorXStart = -0.50;
    const firstFloorXLength = 10.00;
    const lowerSectionY = 0.00;

    const walkJumpGapDistance = 1.00;
    const floorAfterWalkJumpXStart = firstFloorXStart + firstFloorXLength + walkJumpGapDistance;
    const floorAfterWalkJumpXLength = 7.00;

    const pressSprintToJumpImagePlateX = firstFloorXStart + firstFloorXLength + ( walkJumpGapDistance / 2 );
    const pressSprintToJumpImagePlateY = lowerSectionY + 0.6


    ///////// CREATE FLOOR PIECES /////////

    // player drops from spawn area

    // floor piece player lands on to
    const firstFloor             =   new FloorPiece( gameWorld, 
                                                    [ firstFloorXStart, lowerSectionY, trackZCentre ], 
                                                    [ firstFloorXLength, 1.0, trackWidth ],
                                                    colorHue
                                                   );
    
    // gap to walk jump across
    
    // after walk jump
    const floorAfterWalkJump     =   new FloorPiece( gameWorld, 
                                                    [ floorAfterWalkJumpXStart, lowerSectionY, trackZCentre ],     
                                                    [ floorAfterWalkJumpXLength, 1.0, trackWidth ],
                                                    colorHue
                                                   );


    ///////// CREATE IMAGE PLATE /////////

    const pressSpaceToJumpImagePlate    =   new ImagePlate( gameWorld,
                                                            defaultImagePlateSize,
                                                            [ pressSprintToJumpImagePlateX, pressSprintToJumpImagePlateY, trackZCentre ], 
                                                            defaultImageRotationMatrix, 
                                                            'press_space_to_jump'
                                                          );



    ///////////////////////////////////////
    //////////// UPPER SECTION ////////////
    ///////////////////////////////////////


    ///// POSITION AND SIZE VARIABLES /////

    const raisedFloorToClimbXStart = floorAfterWalkJumpXStart + floorAfterWalkJumpXLength
    const raisedFloorToClimbXLength = 10.0;
    const raisedFloorToClimbHeight = 1.50;
    const raisedSectionY = lowerSectionY + raisedFloorToClimbHeight;

    const sprintJumpGapDistance = 2.00;
    const floorAfterSprintJumpXStart = raisedFloorToClimbXStart + raisedFloorToClimbXLength + sprintJumpGapDistance;
    const floorAfterSprintJumpXLength = 7.00;

    const spaceAndWImagePlateX = raisedFloorToClimbXStart - 0.2;
    const spaceAndWImagePlateY = raisedSectionY + 1.50;
    const spaceAndWImagePlateNormalTarget = new THREE.Vector3( 0.5, -1, 0 ).normalize();
    const spaceAndWImagePlateUp = new THREE.Vector3( 0, -1, 0 ).normalize();
    const spaceAndWImagePlateRight = new THREE.Vector3().crossVectors( spaceAndWImagePlateUp, spaceAndWImagePlateNormalTarget ).normalize();
    const spaceAndWImagePlateUpTarget = new THREE.Vector3().crossVectors( spaceAndWImagePlateNormalTarget, spaceAndWImagePlateRight).normalize();
    const spaceAndWImageRotationMatrix = new THREE.Matrix4().makeBasis( spaceAndWImagePlateRight, spaceAndWImagePlateUpTarget, spaceAndWImagePlateNormalTarget )

    const shiftToSprintX = floorAfterSprintJumpXStart - ( sprintJumpGapDistance / 2 )
    const shiftToSprintY = raisedSectionY + 0.6;
    const shiftToSprintTextureString = 'press'.repeat( Number( toggleSprint ) ) + 'hold'.repeat( Number( !toggleSprint ) ) + '_shift_to_sprint';

    ///////// CREATE FLOOR PIECES /////////

    // climb up to
    const raisedFloorToClimb     =   new FloorPiece( gameWorld, 
                                                    [ raisedFloorToClimbXStart, raisedSectionY, trackZCentre ], 
                                                    [ raisedFloorToClimbXLength, raisedSectionY, trackWidth ],
                                                    colorHue
                                                    );

    // gap to sprint jump across

    // after sprint jump
    const floorAfterSprintJump   =   new FloorPiece( gameWorld, 
                                                    [ floorAfterSprintJumpXStart, raisedSectionY, trackZCentre ], 
                                                    [ floorAfterSprintJumpXLength, 1.0, trackWidth ],
                                                    colorHue
                                                    );


    ///////// CREATE IMAGE PLATE /////////

    const spaceAndWImagePlate    =   new ImagePlate( gameWorld, 
                                                    defaultImagePlateSize, 
                                                    [ spaceAndWImagePlateX, spaceAndWImagePlateY, trackZCentre ], 
                                                    spaceAndWImageRotationMatrix, 
                                                    'space_+_w'
                                                    );

    const shiftToSprint          =   new ImagePlate( gameWorld, 
                                                    defaultImagePlateSize, 
                                                    [ shiftToSprintX, shiftToSprintY, trackZCentre ], 
                                                    defaultImageRotationMatrix, 
                                                    shiftToSprintTextureString
                                                    );



    //////////////////////////////////////
    //////////// DASH SECTION ////////////
    //////////////////////////////////////


    ///// POSITION AND SIZE VARIABLES ////

    const dashGapDistance = 6.00;
    const dashGapDrop = 9.50;                // from raisedSectionY to floorBelowDashEntryY

    const dashGapOpeningXStart = floorAfterSprintJumpXStart + floorAfterSprintJumpXLength + dashGapDistance;

    const wallAboveDashEntryRaisedBy = 2.50;
    const wallAboveDashEntryY = raisedSectionY + wallAboveDashEntryRaisedBy;
    const dashGapOpeningHeight = 2.00;
    const wallAboveDashEntryHeight = dashGapDrop - dashGapOpeningHeight + wallAboveDashEntryRaisedBy;

    const floorBelowDashEntryY = raisedSectionY - dashGapDrop;
    const floorBelowDashEntryXLength = 4.00;

    const pressRToDashX = dashGapOpeningXStart - 1.0;
    const pressRToDashY = raisedSectionY + 0.6;


    ///////// CREATE FLOOR PIECES /////////

    // big gap to dash across

    // dash entry
    const wallAboveDashEntry     =   new FloorPiece( gameWorld, 
                                                    [ dashGapOpeningXStart, wallAboveDashEntryY, trackZCentre ], 
                                                    [ 2.0, wallAboveDashEntryHeight, trackWidth ],
                                                    colorHue
                                                );
    const floorBelowDashEntry    =   new FloorPiece( gameWorld, 
                                                    [ dashGapOpeningXStart, floorBelowDashEntryY, trackZCentre ], 
                                                    [ floorBelowDashEntryXLength, 1.0, trackWidth ],
                                                    colorHue
                                                );


    ///////// CREATE IMAGE PLATE /////////

    const pressRToDash           =   new ImagePlate( gameWorld, 
                                                    defaultImagePlateSize, 
                                                    [ pressRToDashX, pressRToDashY, trackZCentre ], 
                                                    defaultImageRotationMatrix, 
                                                    'press_r_to_dash'
                                                    );

    const dashArrows             =   new ImagePlate( gameWorld, 
                                                    [ 5, 7 ], 
                                                    [ pressRToDashX, pressRToDashY - 2.8, trackZCentre ], 
                                                    defaultImageRotationMatrix, 
                                                    'dash_arrows'
                                                    );


    ///////////////////////////////////////
    ////////// STAIRCASE SECTION //////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const staircaseFromDashToTubesXStart = dashGapOpeningXStart + floorBelowDashEntryXLength;
    const staircaseFromDashToTubesHeight = 3.00;         // must be a multiple of 0.15!! (step height as defined in class)
    const staircaseFromDashToTubesNumberOfSteps = staircaseFromDashToTubesHeight / 0.15
    const staircaseFromDashToTubesStepDepth = 0.5;
    const staircaseFromDashToTubesXLength = staircaseFromDashToTubesStepDepth * staircaseFromDashToTubesNumberOfSteps;


    ///////// CREATE FLOOR PIECES //////////

    // staircase after dash up to tubes
    const staircaseFromDashToTubes   =   new Staircase ( gameWorld, 
                                                        [ staircaseFromDashToTubesXStart, floorBelowDashEntryY,  trackZCentre ], 
                                                        staircaseFromDashToTubesNumberOfSteps, 
                                                        staircaseFromDashToTubesStepDepth, 
                                                        trackWidth,
                                                        colorHue
                                                        );


    ////////////////////////////////////////
    ///////////// TUBE SECTION /////////////
    ////////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const tubeSectionXStart = staircaseFromDashToTubesXStart + staircaseFromDashToTubesXLength;
    const tubeSectionXLength = 10.00;

    const tubeDropLength = 20.00;       // length from floor
    const tubeWallHeight = 0.50;
    const tubeWallThickness = 0.10;
    const tubeXLength = tubeSectionXLength / 4;
    const tubeZLength = trackWidth / 2;

    const tubeSectionFloorHeight = floorBelowDashEntryY + staircaseFromDashToTubesHeight;
    const tubeSectionFloorThickness = 2.0;

    const rightFloorBeforeFirstTubeXLength = tubeSectionXLength / 4;
    const rightFloorBetweenTubesXLength = tubeSectionXLength / 8;
    const rightFloorAfterSecondTubeXLength = tubeSectionXLength / 8;

    const rightFloorBetweenTubesXStart = tubeSectionXStart + 4 * (tubeSectionXLength / 8 );
    const rightFloorAfterSecondTubeXStart = tubeSectionXStart + 7 * (tubeSectionXLength / 8 );

    const pressTToSwitchCamerasX = tubeSectionXStart + ( tubeSectionXLength / 2 ) ;
    const pressTToSwitchCamerasY = tubeSectionFloorHeight + 1.0;

    const tubeSkullAndCrossbonesX = rightFloorBetweenTubesXStart - ( tubeXLength / 2 );
    const tubeSkullAndCrossbonesY = tubeSectionFloorHeight - 1.5;
    const tubeSkullAndCrossbonesZ = trackZCentre + ( 2 * tubeZLength ) + 0.05;
    const tubeSkullAndCrossbonesRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0 ,0 ), 0 );
    


    ///////// CREATE FLOOR PIECES //////////

    // floor sections
    const leftFloorNextToTubes       =   new FloorPiece( gameWorld, 
                                                        [  tubeSectionXStart, tubeSectionFloorHeight, trackZCentre - tubeZLength ], 
                                                        [  tubeSectionXLength,  tubeSectionFloorThickness, tubeZLength ],
                                                        colorHue
                                                        );
    const rightFloorBeforeFirstTube  =   new FloorPiece( gameWorld, 
                                                        [  tubeSectionXStart, tubeSectionFloorHeight,  trackZCentre + tubeZLength ], 
                                                        [  rightFloorBeforeFirstTubeXLength, tubeSectionFloorThickness, tubeZLength ],
                                                        colorHue
                                                        );
    const rightFloorBetweenTubes     =   new FloorPiece( gameWorld, 
                                                        [  rightFloorBetweenTubesXStart, tubeSectionFloorHeight,  trackZCentre + tubeZLength ], 
                                                        [  rightFloorBetweenTubesXLength,  tubeSectionFloorThickness, tubeZLength ],
                                                        colorHue
                                                        );
    const rightFloorAfterSecondTube  =   new FloorPiece( gameWorld, 
                                                        [  rightFloorAfterSecondTubeXStart, tubeSectionFloorHeight,  trackZCentre + tubeZLength ], 
                                                        [  rightFloorAfterSecondTubeXLength,  tubeSectionFloorThickness, tubeZLength ],
                                                        colorHue
                                                        );

    // tubes
    const frontWallForFirstTube      =   new FloorPiece( gameWorld, 
                                                        [ tubeSectionXStart + rightFloorBeforeFirstTubeXLength, tubeSectionFloorHeight + tubeWallHeight, trackZCentre + tubeZLength ], 
                                                        [ tubeWallThickness, tubeDropLength + tubeWallHeight, tubeZLength ],
                                                        colorHue
                                                        );
    const rightWallForFirstTube      =   new FloorPiece( gameWorld, 
                                                        [ tubeSectionXStart + rightFloorBeforeFirstTubeXLength + tubeWallThickness, tubeSectionFloorHeight + tubeWallHeight, trackZCentre + trackWidth - ( tubeWallThickness / 2 ) ], 
                                                        [ tubeXLength - ( 2 * tubeWallThickness ), tubeDropLength + tubeWallHeight, ( tubeWallThickness / 2 ) ],
                                                        colorHue
                                                        );
    const leftWallForFirstTube       =   new FloorPiece( gameWorld, 
                                                        [ tubeSectionXStart + rightFloorBeforeFirstTubeXLength, tubeSectionFloorHeight - tubeSectionFloorThickness, trackZCentre - ( tubeWallThickness / 2 ) ], 
                                                        [ tubeXLength, tubeDropLength - tubeSectionFloorThickness, ( tubeWallThickness / 2 ) ],
                                                        colorHue
                                                        );
    const backWallForFirstTube       =   new FloorPiece( gameWorld, 
                                                        [ rightFloorBetweenTubesXStart - tubeWallThickness, tubeSectionFloorHeight + tubeWallHeight, trackZCentre + tubeZLength ], 
                                                        [ tubeWallThickness, tubeDropLength + tubeWallHeight, tubeZLength ],
                                                        colorHue
                                                        );
    const frontWallForSecondTube     =   new FloorPiece( gameWorld, 
                                                        [ rightFloorBetweenTubesXStart + rightFloorBetweenTubesXLength, tubeSectionFloorHeight + tubeWallHeight, trackZCentre + tubeZLength ], 
                                                        [ tubeWallThickness, tubeDropLength + tubeWallHeight, tubeZLength ],
                                                        colorHue
                                                        );
    const rightWallForSecondTube     =   new FloorPiece( gameWorld, 
                                                        [ rightFloorBetweenTubesXStart + rightFloorBetweenTubesXLength + tubeWallThickness, tubeSectionFloorHeight + tubeWallHeight, trackZCentre + trackWidth - ( tubeWallThickness / 2 ) ], 
                                                        [ tubeXLength - (2 * tubeWallThickness ), tubeDropLength + tubeWallHeight, ( tubeWallThickness / 2 ) ],
                                                        colorHue
                                                        );
    const leftWallForSecondTube      =   new FloorPiece( gameWorld, 
                                                        [ rightFloorBetweenTubesXStart + rightFloorBetweenTubesXLength, tubeSectionFloorHeight - tubeSectionFloorThickness, trackZCentre - (tubeWallThickness / 2) ], 
                                                        [ tubeXLength, tubeDropLength - tubeSectionFloorThickness, ( tubeWallThickness / 2 ) ],
                                                        colorHue
                                                        );
    const backWallForSecondTube      =   new FloorPiece( gameWorld, 
                                                        [ rightFloorAfterSecondTubeXStart  - tubeWallThickness, tubeSectionFloorHeight + tubeWallHeight, trackZCentre + tubeZLength ], 
                                                        [ tubeWallThickness, tubeDropLength + tubeWallHeight, tubeZLength ],
                                                        colorHue
                                                        );

    ///////// CREATE IMAGE PLATE /////////

    const pressTToSwitchCameras          =   new ImagePlate( gameWorld, 
                                                            defaultImagePlateSize, 
                                                            [ pressTToSwitchCamerasX, pressTToSwitchCamerasY, trackZCentre ], 
                                                            defaultImageRotationMatrix, 
                                                            'press_t_to_switch_cameras'
                                                    );

    const tubeSkullAndCrossbones         =   new ImagePlate( gameWorld, 
                                                            defaultImagePlateSize, 
                                                            [ tubeSkullAndCrossbonesX, tubeSkullAndCrossbonesY, tubeSkullAndCrossbonesZ ], 
                                                            tubeSkullAndCrossbonesRotationMatrix, 
                                                            'tube_skull_and_crossbones'
                                                            );

    const tubeSpikes                     =   new ImagePlate( gameWorld, 
                                                            [ 2.6, 7 ], 
                                                            [ tubeSkullAndCrossbonesX, tubeSkullAndCrossbonesY - 3.5, tubeSkullAndCrossbonesZ ], 
                                                            tubeSkullAndCrossbonesRotationMatrix, 
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

    const levelCompletePlatformXStart = rightFloorBetweenTubesXStart + rightFloorBetweenTubesXLength + tubeWallThickness;
    const levelCompletePlatformXLength = rightFloorAfterSecondTubeXStart - tubeWallThickness - levelCompletePlatformXStart;
    const levelCompletePlatformThickness = 0.5;
    const levelCompletePlatformY = tubeSectionFloorHeight - tubeDropLength + levelCompletePlatformThickness
    const levelCompleteZLength = tubeZLength;
    const levelCompleteZCentre = trackZCentre + tubeZLength;

    const levelCompletePlatform = new LevelCompletePlatform( gameWorld, 
                                                            player, 
                                                            [ levelCompletePlatformXStart,
                                                                levelCompletePlatformY,
                                                                levelCompleteZCentre
                                                            ], 
                                                            [ levelCompletePlatformXLength,
                                                                levelCompletePlatformThickness,
                                                                levelCompleteZLength
                                                            ]
                                                            );



    // Set up lighting
    const directionalLight = new THREE.DirectionalLight( 0xffaaff, 0.5 );
    directionalLight.position.set( 30, 40, 100 );
    directionalLight.target.position.set( 30, 0, 0 );
    gameWorld.scene.add(directionalLight);
    
    const dlighthelper = new THREE.DirectionalLightHelper( directionalLight );
    if ( debug ) { gameWorld.scene.add( dlighthelper ); }
    
    const hemlight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
    gameWorld.scene.add( hemlight );

    
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

    return { screen, levelCompletePlatform, outOfBoundsPlatform }

}