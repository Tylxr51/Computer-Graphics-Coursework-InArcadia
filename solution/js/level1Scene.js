import * as THREE from 'three';
import { FloorPiece, Staircase, SpawnArea, Screen, LevelCompletePlatform, OutOfBoundsPlatform, ImagePlate, GeneralLevelLighting } from './objectSpawner.js'
 

// PURPOSE: Create environment objects for level 1
// USED BY: LevelManager.chooseLevelScene()
export function createLevel1Scene( args ) {

    // unpack args
    const { gameWorld,
            player,
            playerSpawnY,
            playerSize,
            colorHue
          } = args;


    // define variables used throughout level
    const trackWidth = 2.00;        // width of floorpieces
    const trackZCentre = 0.00;      // centre point of track

    // define some variables for ImagePlates that are used frequently
    const defaultImagePlateSize = [ 4, 4 ];
    const defaultImageRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2 );


    //////////////////////////////////////
    ///////////// BACKGROUND /////////////
    //////////////////////////////////////

    const backgroundColor = 0x000000;
    const fogColor = 0x000000;

    gameWorld.scene.background = new THREE.Color( backgroundColor );
    if ( !debug ) { gameWorld.scene.fog.color.set( fogColor ) };



    //////////////////////////////////////
    /////////// OUT OF BOUNDS ////////////
    //////////////////////////////////////

    const outOfBoundsPlatform = new OutOfBoundsPlatform( gameWorld, player );


    //////////////////////////////////////
    /////////////// SCREEN ///////////////
    //////////////////////////////////////

    const screen = new Screen( gameWorld, loadedTextures['screen_arcade_image'] )


    //////////////////////////////////////
    /////////// SPAWN PLATFORM ///////////
    //////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const spawnPlatformXStart = -0.50;


    ///// CREATE FLOOR PIECES & DOOR //////

    // create spawn door and spawn platform
    const spawnArea = new SpawnArea( gameWorld, spawnPlatformXStart, playerSpawnY, playerSize.y, trackZCentre );


    ///////////////////////////////////////
    ///////////// BEFORE MAZE /////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const firstFloorXStart = -0.50;
    const firstFloorXLength = 20.00;
    const lowerSectionY = 0.00;

    const gapToMazeStartDistance = 1.00;


    ///////// CREATE FLOOR PIECES /////////

    // player drops from spawn area

    // floor piece player lands on to
    const firstFloor         =   new FloorPiece( gameWorld, 
                                                [ firstFloorXStart, lowerSectionY, trackZCentre ], 
                                                [ firstFloorXLength, 1.0, trackWidth ],
                                                colorHue
                                                );

    // gap to walk jump across into maze


    ///////////////////////////////////////
    ////////////// MAZE FRAME /////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const mazeFrameThickness = 1.0;
    const mazePlatformThickness = mazeFrameThickness / 2;

    const mazeOpeningHeight = 2.5;

    const mazeLowerFloorXStart = firstFloorXStart + firstFloorXLength + gapToMazeStartDistance;
    const mazeLowerFloorXLength = 28.00;

    const mazeFrontWallXStart = mazeLowerFloorXStart;
    const mazeFrontWallHeight = 13.0;
    const mazeFrontWallY = lowerSectionY + mazeOpeningHeight + mazeFrontWallHeight;

    const mazeCeilingXStart = mazeLowerFloorXStart;
    const mazeCeilingXLength = mazeLowerFloorXLength;
    const mazeCeilingY = lowerSectionY + mazeOpeningHeight + mazeFrontWallHeight + mazeFrameThickness;

    const mazeBackWallXStart = mazeLowerFloorXStart + mazeLowerFloorXLength;
    const mazeBackWallY = mazeCeilingY;
    const mazeBackWallHeight = mazeOpeningHeight + mazeFrontWallHeight + mazeFrameThickness;

    const mazeLeftWallXStart = mazeLowerFloorXStart;
    const mazeLeftWallXLength = mazeLowerFloorXLength;
    const mazeLeftWallY = mazeCeilingY;
    const mazeLeftWallHeight = mazeBackWallHeight + mazeFrameThickness;
    const mazeLeftWallZCentre = trackZCentre - ( trackWidth ) - ( mazePlatformThickness / 2 );

    const theMazeX = mazeFrontWallXStart - 0.05;
    const theMazeY = lowerSectionY + mazeOpeningHeight + 1.0;



    ///////// CREATE FLOOR PIECES /////////

    // after walk jump
    const mazeLowerFloor     =   new FloorPiece( gameWorld, 
                                                [ mazeLowerFloorXStart, lowerSectionY, trackZCentre ],     
                                                [ mazeLowerFloorXLength, mazeFrameThickness, trackWidth ],
                                                colorHue
                                                );

    const mazeFrontWall      =   new FloorPiece( gameWorld,
                                                [ mazeFrontWallXStart, mazeFrontWallY, trackZCentre ],
                                                [ mazeFrameThickness, mazeFrontWallHeight, trackWidth],
                                                colorHue
                                                );

    const mazeCeiling        =   new FloorPiece( gameWorld,
                                                [ mazeCeilingXStart, mazeCeilingY, trackZCentre ],
                                                [ mazeCeilingXLength, mazeFrameThickness, trackWidth],
                                                colorHue
                                                );

    const mazeBackWall       =   new FloorPiece( gameWorld, 
                                                [ mazeBackWallXStart, mazeBackWallY, trackZCentre ],
                                                [ mazeFrameThickness, mazeBackWallHeight, trackWidth ],
                                                colorHue
                                                );

    const mazeLeftWall       =   new FloorPiece( gameWorld,
                                                [ mazeLeftWallXStart, mazeLeftWallY, mazeLeftWallZCentre ],
                                                [ mazeLeftWallXLength, mazeLeftWallHeight, mazePlatformThickness / 2 ],
                                                colorHue
                                                );

    ///////// CREATE IMAGE PLATE /////////

    const theMaze    =   new ImagePlate( gameWorld,
                                        defaultImagePlateSize,
                                        [ theMazeX, theMazeY, trackZCentre ], 
                                        defaultImageRotationMatrix, 
                                        'the_maze'
                                        );


    ///////////////////////////////////////
    /////////// LOWER SECTION /////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const mazeLowerToMiddleJumpPlatformXStart = mazeLowerFloorXStart + 10.0;
    const mazeLowerToMiddleJumpPlatformXLength = 4;
    const mazeLowerToMiddleJumpPlatformJumpHeight = 1.5;
    const mazeLowerToMiddleJumpPlatformY = lowerSectionY + mazeLowerToMiddleJumpPlatformJumpHeight;
    const mazeLowerToMiddleJumpPlatformZLength = trackWidth / 2

    const mazeLowerBigBoxXLength = 4.0;
    const mazeLowerBigBoxXStart = mazeBackWallXStart - mazeLowerBigBoxXLength;
    const mazeLowerBigBoxHeight = 2.0;
    const mazeLowerBigBoxY = lowerSectionY + mazeLowerBigBoxHeight;
    const mazeLowerBigBoxZLength = trackWidth / 2;

    const mazeLowerSmallBoxXLength = mazeLowerBigBoxXLength + 2;
    const mazeLowerSmallBoxXStart = mazeBackWallXStart - mazeLowerSmallBoxXLength;
    const mazeLowerSmallBoxHeight = 1.0;
    const mazeLowerSmallBoxY = lowerSectionY + mazeLowerSmallBoxHeight;
    const mazeLowerSmallBoxZLength = mazeLowerBigBoxZLength;

    const mazeFloorArrowX = mazeLowerToMiddleJumpPlatformXStart;
    const mazeFloorArrowY = lowerSectionY + 0.1;
    const mazeFloorArrowZ = trackZCentre + mazeLowerToMiddleJumpPlatformZLength;
    const mazeFloorArrowRotationMatrixYAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), -Math.PI/2 );
    const mazeFloorArrowRotationMatrixZAxis = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, 0 ), -Math.PI/2 );
    const mazeFloorArrowRotationMatrixFinal = mazeFloorArrowRotationMatrixYAxis.multiply( mazeFloorArrowRotationMatrixZAxis );

    const nothingDownHereX = mazeBackWallXStart - 0.05;
    const nothingDownHereY = mazeLowerBigBoxY + 1.0;



    ///////// CREATE FLOOR PIECES /////////

    const mazeLowerToMiddleJumpPlatform  =   new FloorPiece( gameWorld, 
                                                            [ mazeLowerToMiddleJumpPlatformXStart, mazeLowerToMiddleJumpPlatformY, trackZCentre - mazeLowerToMiddleJumpPlatformZLength ],
                                                            [ mazeLowerToMiddleJumpPlatformXLength, mazeLowerToMiddleJumpPlatformJumpHeight, mazeLowerToMiddleJumpPlatformZLength],
                                                            colorHue
                                                            );

    const mazeLowerSmallBox      =       new FloorPiece ( gameWorld, 
                                                            [ mazeLowerSmallBoxXStart, mazeLowerSmallBoxY, trackZCentre - mazeLowerSmallBoxZLength],
                                                            [ mazeLowerSmallBoxXLength, mazeLowerSmallBoxHeight, mazeLowerSmallBoxZLength],
                                                            colorHue
                                                        );

    const mazeLowerBigBox        =       new FloorPiece ( gameWorld, 
                                                            [ mazeLowerBigBoxXStart, mazeLowerBigBoxY, trackZCentre + mazeLowerBigBoxZLength],
                                                            [ mazeLowerBigBoxXLength, mazeLowerBigBoxHeight, mazeLowerBigBoxZLength],
                                                            colorHue
                                                        );



    ///////// CREATE IMAGE PLATE /////////

    const mazeFloorArrow    =   new ImagePlate( gameWorld,
                                                defaultImagePlateSize,
                                                [ mazeFloorArrowX, mazeFloorArrowY, mazeFloorArrowZ ], 
                                                mazeFloorArrowRotationMatrixFinal, 
                                                'straight_arrow'
                                                );

    const nothingDownHere    =   new ImagePlate( gameWorld,
                                                defaultImagePlateSize,
                                                [ nothingDownHereX, nothingDownHereY, trackZCentre ], 
                                                defaultImageRotationMatrix, 
                                                'nothing_down_here'
                                                );
                                                        

    ///////////////////////////////////////
    /////////// MIDDLE SECTION ////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const mazePlatformtoMiddleFloorJumpHeight = 1.5;

    const mazeMiddleFloorFrontSectionXStart = mazeLowerFloorXStart + mazeFrameThickness;
    const mazeMiddleFloorFrontSectionXLength = mazeLowerToMiddleJumpPlatformXStart - mazeMiddleFloorFrontSectionXStart;
    const mazeMiddleFloorFrontSectionY = mazeLowerToMiddleJumpPlatformY + mazePlatformtoMiddleFloorJumpHeight;

    const mazeMiddleFloorMiddleSectionXStart = mazeLowerToMiddleJumpPlatformXStart;
    const mazeMiddleFloorMiddleSectionXLength = mazeLowerToMiddleJumpPlatformXLength;
    const mazeMiddleFloorMiddleSectionY = mazeMiddleFloorFrontSectionY;
    const mazeMiddleFloorMiddleSectionZLength = trackWidth / 2

    const mazeMiddleFloorBackSectionXStart = mazeMiddleFloorMiddleSectionXStart + mazeMiddleFloorMiddleSectionXLength;
    const mazeMiddleFloorBackSectionXLength = (mazeBackWallXStart - mazeMiddleFloorBackSectionXStart ) / 2;
    const mazeMiddleFloorBackSectionY = mazeMiddleFloorFrontSectionY;

    const mazeMiddleWallToUpperXStart = mazeMiddleFloorBackSectionXStart + mazeMiddleFloorBackSectionXLength;
    const mazeMiddleWallToUpperHeight = 8.3;
    const mazeMiddleWallToUpperY = mazeMiddleFloorBackSectionY + mazeMiddleWallToUpperHeight;
    const mazeMiddleWallToUpperOpeningHeight = 1.5;



    ///////// CREATE FLOOR PIECES /////////

    const mazeMiddleFloorFrontSection    =   new FloorPiece( gameWorld,
                                                            [ mazeMiddleFloorFrontSectionXStart, mazeMiddleFloorFrontSectionY, trackZCentre ],
                                                            [ mazeMiddleFloorFrontSectionXLength, mazePlatformThickness, trackWidth ],
                                                            colorHue
                                                            );

    const mazeMiddleFloorMiddleSection   =   new FloorPiece( gameWorld,
                                                            [ mazeMiddleFloorMiddleSectionXStart, mazeMiddleFloorMiddleSectionY, trackZCentre + mazeMiddleFloorMiddleSectionZLength ],
                                                            [ mazeMiddleFloorMiddleSectionXLength, mazePlatformThickness, mazeMiddleFloorMiddleSectionZLength ],
                                                            colorHue
                                                            );

    const mazeMiddleFloorBackSection     =   new FloorPiece( gameWorld,
                                                            [ mazeMiddleFloorBackSectionXStart, mazeMiddleFloorBackSectionY, trackZCentre ],
                                                            [ mazeMiddleFloorBackSectionXLength, mazePlatformThickness, trackWidth ],
                                                            colorHue
                                                            );

    const mazeMiddleWallToUpper          =   new FloorPiece( gameWorld,
                                                            [ mazeMiddleWallToUpperXStart, mazeMiddleWallToUpperY, trackZCentre ],
                                                            [ mazePlatformThickness, mazeMiddleWallToUpperHeight - mazeMiddleWallToUpperOpeningHeight, trackWidth ],
                                                            colorHue
                                                            );


    ///////////////////////////////////////
    /////////// PARKOUR SECTION ///////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const parkourStartingBoxXLength = 2.0;
    const parkourStartingBoxXStart = mazeMiddleWallToUpperXStart - parkourStartingBoxXLength;
    const parkourStartingBoxHeight = mazeMiddleWallToUpperOpeningHeight;
    const parkourStartingBoxY = mazeMiddleFloorBackSectionY + parkourStartingBoxHeight;
    const parkourStartingBoxZLength = trackWidth / 2;
    const parkourStartingBoxZCentre = trackZCentre - parkourStartingBoxZLength;

    const jumpFromBoxToPlatformAfterBoxXDistance = 2.0;

    const parkourSmallPlatformXLength = 1.0;
    const parkourSmallPlatformZLength = trackWidth / 4;
    const parkourWidePlatformXLength = 4.0;
    const parkourWidePlatformZLength = trackWidth;
    const parkourWidePlatformZCentre = trackZCentre;

    const parkourPlatformAfterBoxXStart = parkourStartingBoxXStart - jumpFromBoxToPlatformAfterBoxXDistance - parkourSmallPlatformXLength;
    const parkourPlatformAfterBoxY = parkourStartingBoxY + 1;
    const parkourPlatformAfterBoxZCentre = trackZCentre - ( 3 * parkourSmallPlatformZLength );

    const jumpFromPlatformToFirstWideDistance = 3.0;

    const firstWidePlatformXStart = parkourPlatformAfterBoxXStart - jumpFromPlatformToFirstWideDistance - parkourWidePlatformXLength;
    const firstWidePlatformY = parkourPlatformAfterBoxY + 1;

    const jumpFromFirstWideToFirstPlatformAfterDistance = 2.0;

    const firstPlatformAfterFirstWideXStart = firstWidePlatformXStart - jumpFromFirstWideToFirstPlatformAfterDistance - parkourSmallPlatformXLength;
    const firstPlatformAfterFirstWideY = firstWidePlatformY + 1;

    const longPlatformAfterFirstWideZCentre = trackZCentre + ( 3 * parkourSmallPlatformZLength );
    const longPlatformAfterFirstWideXStart = firstWidePlatformXStart - jumpFromFirstWideToFirstPlatformAfterDistance - ( 2 * parkourSmallPlatformXLength );
    const longPlatformAfterFirstWideY = firstPlatformAfterFirstWideY + 1.0;

    const secondPlatformAfterFirstWideXStart = firstPlatformAfterFirstWideXStart - parkourSmallPlatformXLength;
    const secondPlatformAfterFirstWideY = longPlatformAfterFirstWideY + 1.0;

    const secondWidePlatformXStart = firstWidePlatformXStart;
    const secondWidePlatformY = secondPlatformAfterFirstWideY;

    const arcingArrowLeftLowerFromBoxX = parkourStartingBoxXStart - 0.8;
    const arcingArrowLeftLowerFromBoxY = parkourStartingBoxY + 1.5;
    const arcingArrowLeftLowerFromBoxZ = trackZCentre - trackWidth + 0.05;
    const arcingArrowLeftLowerRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, 0 ), 0 );

    const arcingArrowLeftUpperX = firstPlatformAfterFirstWideXStart + 1.0;
    const arcingArrowLeftUpperY = firstPlatformAfterFirstWideY + 0.8;

    const arcingArrowRightUpperX = longPlatformAfterFirstWideXStart + 1.0;
    const arcingArrowRightUpperY = longPlatformAfterFirstWideY + 0.8;

    const arcingArrowUpperRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
    const arcingArrowLeftUpperRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ), -Math.PI / 8 );
    const arcingArrowRightUpperRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ), Math.PI / 6 );



    ///////// CREATE FLOOR PIECES /////////

    const parkourStartingBox             =   new FloorPiece( gameWorld,
                                                            [ parkourStartingBoxXStart, parkourStartingBoxY, parkourStartingBoxZCentre ],
                                                            [ parkourStartingBoxXLength, parkourStartingBoxHeight, parkourStartingBoxZLength ],
                                                            colorHue
                                                            );

    const parkourPlatformAfterBox        =   new FloorPiece( gameWorld,
                                                            [ parkourPlatformAfterBoxXStart, parkourPlatformAfterBoxY, parkourPlatformAfterBoxZCentre ],
                                                            [ parkourSmallPlatformXLength, mazePlatformThickness, parkourSmallPlatformZLength ],
                                                            colorHue
                                                            );

    const firstWidePlatformAfterBox      =   new FloorPiece( gameWorld,
                                                            [ firstWidePlatformXStart, firstWidePlatformY, parkourWidePlatformZCentre ],
                                                            [ parkourWidePlatformXLength, mazePlatformThickness, parkourWidePlatformZLength ],
                                                            colorHue
                                                            );

    const firstPlatformAfterFirstWide    =   new FloorPiece( gameWorld,
                                                            [ firstPlatformAfterFirstWideXStart, firstPlatformAfterFirstWideY, parkourPlatformAfterBoxZCentre ],
                                                            [ parkourSmallPlatformXLength, mazePlatformThickness, parkourSmallPlatformZLength ],
                                                            colorHue
                                                            );
                                                        
    const longPlatformAfterFirstWide    =   new FloorPiece( gameWorld,
                                                            [ longPlatformAfterFirstWideXStart, longPlatformAfterFirstWideY, longPlatformAfterFirstWideZCentre ],
                                                            [ 2 * parkourSmallPlatformXLength, mazePlatformThickness, parkourSmallPlatformZLength ],
                                                            colorHue
                                                            );

    const secondPlatformAfterFirstWide    =   new FloorPiece( gameWorld,
                                                            [ secondPlatformAfterFirstWideXStart, secondPlatformAfterFirstWideY, parkourPlatformAfterBoxZCentre ],
                                                            [ parkourSmallPlatformXLength, mazePlatformThickness, parkourSmallPlatformZLength ],
                                                            colorHue
                                                            );
                                                        
    const secondWidePlatformAfterBox      =   new FloorPiece( gameWorld,
                                                            [ secondWidePlatformXStart, secondWidePlatformY, parkourWidePlatformZCentre ],
                                                            [ parkourWidePlatformXLength, mazePlatformThickness, parkourWidePlatformZLength ],
                                                            colorHue
                                                            );



    ///////// CREATE IMAGE PLATE /////////

    const arcingArrowLeftLowerFromBox        =   new ImagePlate( gameWorld,
                                                                [ 3.2, 3 ],
                                                                [ arcingArrowLeftLowerFromBoxX, arcingArrowLeftLowerFromBoxY, arcingArrowLeftLowerFromBoxZ ], 
                                                                arcingArrowLeftLowerRotationMatrix, 
                                                                'arcing_arrow_left'
                                                                );

    const arcingArrowLeftLowerFromPlatform   =   new ImagePlate( gameWorld,
                                                                [ 3.2, 4 ],
                                                                [ arcingArrowLeftLowerFromBoxX - 3.4, arcingArrowLeftLowerFromBoxY + 1.0, arcingArrowLeftLowerFromBoxZ ], 
                                                                arcingArrowLeftLowerRotationMatrix, 
                                                                'arcing_arrow_left'
                                                                );

    const arcingArrowLeftUpper               =   new ImagePlate( gameWorld,
                                                                [ 2.5, 3 ],
                                                                [ arcingArrowLeftUpperX, arcingArrowLeftUpperY, parkourPlatformAfterBoxZCentre + 1.5 ], 
                                                                arcingArrowUpperRotationMatrix.multiply( arcingArrowLeftUpperRotationMatrix ), 
                                                                'arcing_arrow_left'
                                                                );

    const arcingArrowRightUpper               =   new ImagePlate( gameWorld,
                                                                [ 2.5, 3 ],
                                                                [ arcingArrowRightUpperX, arcingArrowRightUpperY, longPlatformAfterFirstWideZCentre - 1.5 ], 
                                                                arcingArrowUpperRotationMatrix.multiply( arcingArrowRightUpperRotationMatrix ), 
                                                                'arcing_arrow_right'
                                                                );


    ///////////////////////////////////////
    ////////////// STAIRCASE //////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const jumpToFirstStaicase = 1.5;

    const firstStaircaseToUpperXStart = secondWidePlatformXStart + parkourWidePlatformXLength + jumpToFirstStaicase;
    const firstStaircaseToUpperNumOfSteps = 6;
    const firstStaircaseToUpperStepDepth = 0.5;
    const firstStaircaseToUpperHeight = firstStaircaseToUpperNumOfSteps * 0.15;
    const firstStaircaseToUpperXLength = firstStaircaseToUpperNumOfSteps * firstStaircaseToUpperStepDepth;

    const staircaseHalfStepXStart = firstStaircaseToUpperXStart + firstStaircaseToUpperXLength;
    const staircaseHalfStepXLength = firstStaircaseToUpperStepDepth;
    const staircaseHalfStepY = secondWidePlatformY + firstStaircaseToUpperHeight;
    const staircaseHalfStepThickness = 0.15;
    const staircaseHalfStepZLength = trackWidth / 2;
    const staircaseHalfStepZCentre = trackZCentre - staircaseHalfStepZLength;

    const secondStaircaseToUpperXStart = staircaseHalfStepXStart + staircaseHalfStepXLength;
    const secondStaircaseToUpperNumOfSteps = 6;
    const secondStaircaseToUpperStepDepth = 0.5;
    const secondStaircaseToUpperHeight = secondStaircaseToUpperNumOfSteps * 0.15;
    const secondStaircaseToUpperXLength = secondStaircaseToUpperNumOfSteps * secondStaircaseToUpperStepDepth;



    ///////// CREATE FLOOR PIECES /////////

    const firstStaircaseToUpper          =   new Staircase( gameWorld, 
                                                            [ firstStaircaseToUpperXStart, secondWidePlatformY, parkourWidePlatformZCentre ], 
                                                            firstStaircaseToUpperNumOfSteps, 
                                                            firstStaircaseToUpperStepDepth, 
                                                            parkourWidePlatformZLength, 
                                                            colorHue
                                                            );

    const staircaseHalfStep              =   new FloorPiece( gameWorld,
                                                            [ staircaseHalfStepXStart, staircaseHalfStepY, staircaseHalfStepZCentre ],
                                                            [ staircaseHalfStepXLength, staircaseHalfStepThickness, staircaseHalfStepZLength],
                                                            colorHue
                                                            );


    const secondStaircaseToUpper         =   new Staircase( gameWorld, 
                                                            [ secondStaircaseToUpperXStart, staircaseHalfStepY, parkourWidePlatformZCentre ], 
                                                            secondStaircaseToUpperNumOfSteps, 
                                                            secondStaircaseToUpperStepDepth, 
                                                            parkourWidePlatformZLength, 
                                                            colorHue
                                                            );


    ///////////////////////////////////////
    //////////// UPPER SECTION ////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const upperFloorSectionXStart = mazeMiddleWallToUpperXStart + mazePlatformThickness;
    const upperFloorSectionXLength = mazeBackWallXStart - upperFloorSectionXStart;
    const upperFloorSectionY = staircaseHalfStepY + secondStaircaseToUpperHeight;

    const dropDownFromUpperFloorSectionY = upperFloorSectionY - 1.0;
    const dropDownFromUpperFloorSectionPathZLength = 0.5;
    const dropDownFromUpperFloorSectionZLength = trackWidth + dropDownFromUpperFloorSectionPathZLength;
    const dropDownFromUpperFloorSectionZCentre = trackZCentre + dropDownFromUpperFloorSectionPathZLength;

    const pathFromDropDownXStart = upperFloorSectionXStart + upperFloorSectionXLength;
    const pathFromDropDownZCentre = trackZCentre + trackWidth + dropDownFromUpperFloorSectionPathZLength;
    const pathFromDropDownXLength = 4.0;

    const ifOnlyCameraAngleX = mazeBackWallXStart - 0.05;
    const ifOnlyCameraAngleY = upperFloorSectionY + 1.2;



    ///////// CREATE FLOOR PIECES /////////

    const upperFloorSection              =   new FloorPiece( gameWorld, 
                                                            [ upperFloorSectionXStart, upperFloorSectionY, trackZCentre ],
                                                            [ upperFloorSectionXLength, mazePlatformThickness, trackWidth ],
                                                            colorHue
                                                            );

    const dropDownFromUpperFloorSection      =   new FloorPiece( gameWorld, 
                                                                [ upperFloorSectionXStart, dropDownFromUpperFloorSectionY, dropDownFromUpperFloorSectionZCentre ],
                                                                [ upperFloorSectionXLength, mazePlatformThickness, dropDownFromUpperFloorSectionZLength ],
                                                                colorHue
                                                            );

    const pathFromDropDown                   =   new FloorPiece( gameWorld,
                                                                [ pathFromDropDownXStart, dropDownFromUpperFloorSectionY, pathFromDropDownZCentre ],
                                                                [ pathFromDropDownXLength, mazePlatformThickness, dropDownFromUpperFloorSectionPathZLength ],
                                                                colorHue
                                                                );



    ///////// CREATE IMAGE PLATE /////////

    const ifOnlyCameraAngle        =   new ImagePlate( gameWorld,
                                                        [ 3.5, 3.5 ],
                                                        [ ifOnlyCameraAngleX, ifOnlyCameraAngleY, trackZCentre ], 
                                                        defaultImageRotationMatrix, 
                                                        'if_only_camera_angle'
                                                    );


    ///////////////////////////////////////
    ///////////////// TUBE ////////////////
    ///////////////////////////////////////

    ///// POSITION AND SIZE VARIABLES /////

    const tubeWallThickness = 0.10;
    const tubeWallLength = 1.0;
    const tubeWallHeight = 0.5
    const tubeRaisedWallY = dropDownFromUpperFloorSectionY + tubeWallHeight;
    const tubeDropLength = 10.0;

    const tubeBackWallXStart = pathFromDropDownXStart + pathFromDropDownXLength - tubeWallThickness;
    const tubeBackWallZCentre = pathFromDropDownZCentre - dropDownFromUpperFloorSectionPathZLength - tubeWallLength;

    const tubeLeftWallXStart = tubeBackWallXStart - ( 2 * tubeWallLength );
    const tubeLeftWallZCentre = pathFromDropDownZCentre - dropDownFromUpperFloorSectionPathZLength - ( 2 * tubeWallLength ) + ( tubeWallThickness / 2 );

    const tubeRightWallZCentre = pathFromDropDownZCentre - dropDownFromUpperFloorSectionPathZLength + ( tubeWallThickness / 2 );

    const tubeFrontWallXStart = tubeBackWallXStart - ( 2 * tubeWallLength ) - tubeWallThickness;

    const arrowIntoTubeX = tubeLeftWallXStart + tubeWallLength;
    const arrowIntoTubeY = tubeRaisedWallY + 2.5;
    const arrowIntoTubeRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 0, 1 ), Math.PI );



    ///////// CREATE FLOOR PIECES /////////

    const tubeBackWall      =   new FloorPiece( gameWorld, 
                                                [ tubeBackWallXStart, tubeRaisedWallY, tubeBackWallZCentre ], 
                                                [ tubeWallThickness, tubeDropLength + tubeWallHeight, tubeWallLength ],
                                                colorHue
                                                );
    const tubeLeftWall       =   new FloorPiece( gameWorld, 
                                                [ tubeLeftWallXStart, tubeRaisedWallY, tubeLeftWallZCentre ], 
                                                [ ( 2 * tubeWallLength ) , tubeDropLength + tubeWallHeight, ( tubeWallThickness / 2 ) ],
                                                colorHue
                                                );
    const tubeRightWall      =   new FloorPiece( gameWorld, 
                                                [ tubeLeftWallXStart, dropDownFromUpperFloorSectionY - mazePlatformThickness, tubeRightWallZCentre ], 
                                                [ ( 2 * tubeWallLength ) , tubeDropLength - mazePlatformThickness, ( tubeWallThickness / 2 ) ],
                                                colorHue
                                                );
    const tubeFrontWall      =   new FloorPiece( gameWorld, 
                                                [ tubeFrontWallXStart, tubeRaisedWallY, tubeBackWallZCentre ], 
                                                [ tubeWallThickness, tubeDropLength + tubeWallHeight, tubeWallLength ],
                                                colorHue
                                                );


    ///////// CREATE IMAGE PLATE /////////

    const arrowIntoTube        =   new ImagePlate( gameWorld,
                                                    [ 4, 6 ],
                                                    [ arrowIntoTubeX, arrowIntoTubeY, tubeLeftWallZCentre + 0.2 ], 
                                                    arrowIntoTubeRotationMatrix, 
                                                    'straight_arrow'
                                                );



    //////////////////////////////////////
    ////////// LEVEL COMPLETE ////////////
    //////////////////////////////////////

    const levelCompletePlatformXStart = tubeFrontWallXStart + tubeWallThickness;
    const levelCompletePlatformXLength = 2 * tubeWallLength;
    const levelCompletePlatformThickness = 0.5;
    const levelCompletePlatformY = dropDownFromUpperFloorSectionY - tubeDropLength + levelCompletePlatformThickness
    const levelCompleteZLength = tubeWallLength -  ( tubeWallThickness / 2 );
    const levelCompleteZCentre = pathFromDropDownZCentre - dropDownFromUpperFloorSectionPathZLength - tubeWallLength + ( tubeWallThickness / 4 );

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
        


    //////////////////////////////////////
    ///////// GENERAL LIGHTING ///////////
    //////////////////////////////////////
    
    const skyColor = 0xff0000;
    const groundColor = 0x0000ff;
    const levelLighting = new GeneralLevelLighting( gameWorld, skyColor, groundColor );



    //////////////////////////////////////
    //////////// AXIS HELPER /////////////
    //////////////////////////////////////

    // display axes in debug mode and show world origin
    const axesHelper = new THREE.AxesHelper( 3 ) ;
    axesHelper.position.set( 0, 0, 0 );
    if ( debug ) { gameWorld.scene.add( axesHelper ) };



    return { screen, levelCompletePlatform, outOfBoundsPlatform }

}

// PURPOSE: create floor meshes for level 1
// USED BY: FloorPiece.createFloorMesh()
export function createLevel1FloorMesh( floorSize, colorHue, colorLightness ) {

    let floorGeometry = new THREE.BoxGeometry( floorSize.x, 
                                               floorSize.y, 
                                               floorSize.z 
                                             );

    let color = new THREE.Color();                          // make color object to populate later
        
    floorGeometry = floorGeometry.toNonIndexed();           // gives a triangle/square effect

    const position = floorGeometry.attributes.position;     // get vertex position 

    const colors = [];                                      // list to populate

    for ( let i = 0, l = position.count; i < l; i ++ ) {

        // set vertex color
        color.setHSL(  colorHue + Math.random() * 0.2, 
                       0.75, 
                       colorLightness + Math.random() * 0.3, 
                       THREE.SRGBColorSpace 
                    );
        colors.push( color.r, color.g, color.b );           // populate colors list

    }

    // set vertex colors from list
    floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    // make material from vertex colors
    const floorMaterial = new THREE.MeshStandardMaterial( { color: 0xbcbcbc, roughness: 0.1, metalness: 0.3, vertexColors: true  } );
    floorMaterial.castShadow = false;
    floorMaterial.receiveShadow = true;

    // make floorMesh using floorGeometry and floorMaterial
    const floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );



    return floorMesh

}