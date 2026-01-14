import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

// PURPOSE: Create and apply material to playerGLTFMesh once ( color variation method taken from /three.js-r170/examples/misc_controls_pointerlock.html )
// USED BY: PlayerGLTF
function initPlayerGLTFMaterial( mesh ) {

    if ( isPlayerGLTFInit ) { return }     // if already initialised then exit function

    // set color variables
    const colorHue = 0.1;
    const colorLightness = 0.4;   
    
    let color = new THREE.Color();        // make color object to populate later

    mesh.children[0].geometry = mesh.children[0].geometry.toNonIndexed();       // gives a triangle/square effect

    const position = mesh.children[0].geometry.attributes.position;             // get vertex position

    // lists to populate
    const colors = [];
    const yrange = [];

    // find ymax and ymin to normalize y
    for ( let i = 0, l = position.count; i < l; i ++ ) { yrange.push( position.getY( i ) ) };

    const ymax = Math.max(...yrange)
    const ymin = Math.min(...yrange)


    for ( let i = 0, l = position.count; i < l; i ++ ) {

        // normalise y coord
        const y = ( position.getY( i ) - ymin ) / ( ymax - ymin );

        // function for gradient
        const gradientMap = - 5 * ( y ** 2 - ( 0.2 * y ) - 0.4 ) ** 2 + 1

        // set vertex color
        color.setHSL( 1 - ( 0.5 * gradientMap ) * ( colorHue + Math.random() * 0.2 ) , 
                      0.75, 
                      ( gradientMap ) * ( colorLightness + Math.random() * 0.5 ), 
                      THREE.SRGBColorSpace 
                    );

        colors.push( color.r, color.g, color.b );           // populate list with vertex colors

    }

    // set vertex colors from list
    mesh.children[0].geometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

    // make material from vertex colors
    mesh.children[0].material = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness : 0.4, roughness : 0.4, vertexColors: true } );
    mesh.children[0].material.castShadow = true;
    mesh.children[0].material.receiveShadow = true;

    // set true so isn't initialised again
    isPlayerGLTFInit = true;

}


// PURPOSE: Initalise RectAreaLightUniformsLib once
// USED BY: PlayerGLTF
function initRectAreaLight() {

    if ( isRectAreaLightUniformLibInit ) { return }     // if already initialised then exit function
            
    RectAreaLightUniformsLib.init();                    // initialise library
    isRectAreaLightUniformLibInit = true;               // set true so isn't initialised again unnecessarily 
        
}


// PURPOSE: Handles 3D player character model - spawning / despawning and location updating
// USED BY: Player
export class PlayerGLTF {
    
    // PURPOSE: Get mesh from loadedGLTFs, call material creation function and initialise variables
    constructor( gameWorld ) {

        this.playerGLTFMesh = loadedGLTFs['player_character'].scene;        // get mesh

        initPlayerGLTFMaterial( this.playerGLTFMesh );                      // create material for mesh

        // define variables for other functions
        this.gameWorld = gameWorld;

        this.playerGLTFMeshPosition;
        this.playerGLTFMeshLookDirection
        this.playerGLTFMeshRotationMatrix;

    }


    // PURPOSE: Update mesh position and rotation
    // USED BY: PlayerControls.updatePlayerMotion()
    updatePlayerGLTFMeshLocation( lookDirection, position ) {

        this.playerGLTFMeshPosition = position;
        this.playerGLTFMeshLookDirection = lookDirection;

        this.calculateRotationMatrix()          // calculate rotation matrix

        // set position and rotation
        this.playerGLTFMesh.position.set( this.playerGLTFMeshPosition[0], this.playerGLTFMeshPosition[1], this.playerGLTFMeshPosition[2] );
        this.playerGLTFMesh.quaternion.setFromRotationMatrix( this.playerGLTFMeshRotationMatrix );

    }


    // PURPOSE: Calculate rotation matrix using lookDirection
    // USED BY: updatePlayerGLTFMeshLocation()
    calculateRotationMatrix() {
        
        // define normal, up, and right vectors
        this.playerGLTFMeshNormalTarget = new THREE.Vector3( this.playerGLTFMeshLookDirection.x, 0, this.playerGLTFMeshLookDirection.z ).normalize();
        this.playerGLTFMeshUp = new THREE.Vector3( 0, 1, 0 ).normalize();
        this.playerGLTFMeshRight = new THREE.Vector3().crossVectors( this.playerGLTFMeshUp, this.playerGLTFMeshNormalTarget ).normalize();

        // calculate rotation matrix
        this.playerGLTFMeshRotationMatrix = new THREE.Matrix4().makeBasis(this.playerGLTFMeshRight, this.playerGLTFMeshUp, this.playerGLTFMeshNormalTarget )
    
    }


    // PURPOSE: (De)spawn player mesh
    // USED BY: useFirstPersonCamera() and useThirdPersonCamera()
    spawnPlayerGLTFMesh() { this.gameWorld.scene.add( this.playerGLTFMesh ) };
    despawnPlayerGLTFMesh() { this.gameWorld.scene.remove( this.playerGLTFMesh ) };
}


// PURPOSE: Creates a plane geometry with a specified texture material. Used for the red handwritten in-game messages
// USED BY: createSceneLevelX() functions
export class ImagePlate {

    // PURPOSE: Create, position, rotate, and spawn mesh
    constructor( gameWorld, size, position, rotationMatrix, texture ) {
        
        this.imagePlateGeometry = new THREE.PlaneGeometry( size[0], size[1] );
        this.imagePlateMaterial = new THREE.MeshBasicMaterial( { map: loadedTextures[ texture ], transparent: true, alphaTest: 0.3 } );

        this.imagePlateMesh = new THREE.Mesh( this.imagePlateGeometry, this.imagePlateMaterial );

        this.imagePlateMesh.position.set( position[0], position[1], position[2] );
        this.imagePlateMesh.quaternion.setFromRotationMatrix( rotationMatrix );

        gameWorld.scene.add( this.imagePlateMesh );

    }

}


// PURPOSE: Creates an invisible ( if debug is off ) box geometry with a function that can dispatch an event 
// USED BY: LevelCompletePlatform and OutOfBoundsPlatform classes
class triggerPlatform {

    // PURPOSE: 
    constructor( gameWorld, player, position, size, contactEvent, debugColor ) {

        this.gameWorld = gameWorld;
        this.player = player;
        this.contactEvent = contactEvent;

        this.mass = 0;                  // immovable

        // define ammo variables for position, rotation, and size
        this.ammoPlatformPosition = new Ammo.btVector3( position[0] + ( size[0] / 2 ), position[1] - ( size[1] / 2 ), position[2] );  
        this.ammoPlatformQuaternion = new Ammo.btQuaternion( 0, 0, 0, 1 );       
        this.ammoPlatformSize = new Ammo.btVector3( 0.5 * size[0], 0.5 * size[1], size[2]);   

        // define shape and size for physics sim
        this.platformShape = new Ammo.btBoxShape( this.ammoPlatformSize );
        this.platformShape.setMargin( 0.05 );

        // set position and rotation for physics sim
        this.platformTransform = new Ammo.btTransform();      // set up platform transform 
        this.platformTransform.setIdentity();
        this.platformTransform.setOrigin( this.ammoPlatformPosition );          // position platform
        this.platformTransform.setRotation( this.ammoPlatformQuaternion );      // rotate platform
        

        // set up rigid body variables for physics sim
        this.platformInertia = new Ammo.btVector3( 0, 0, 0 );
        this.platformMotionState = new Ammo.btDefaultMotionState( this.platformTransform );

        this.platformInfo = new Ammo.btRigidBodyConstructionInfo( this.mass,
                                                                  this.platformMotionState,
                                                                  this.platformShape,
                                                                  this.platformInertia
                                                                );

        // create rigid body for physics sim
        this.platformBody = new Ammo.btRigidBody( this.platformInfo );

        // set collision flag to static filter to act as a static object
        this.platformBody.setCollisionFlags( Ammo.btBroadphaseProxy.StaticFilter );

        // Add to physicsWorld
        this.gameWorld.physicsWorld.addRigidBody( this.platformBody,
                                                  Ammo.btBroadphaseProxy.StaticFilter,
                                                  Ammo.btBroadphaseProxy.CharacterFilter
                                                );


        // create mesh that is visible in debug mode
        this.platformGeometry = new THREE.BoxGeometry( size[0], size[1], 2*size[2] );
        this.platformMaterial = new THREE.MeshStandardMaterial( { color: debugColor } );
        this.platformMesh = new THREE.Mesh( this.platformGeometry, this.platformMaterial );
        this.platformMesh.position.set( this.ammoPlatformPosition.x(), this.ammoPlatformPosition.y(), this.ammoPlatformPosition.z() )
        if ( debug ) { this.gameWorld.scene.add( this.platformMesh ) };

    }


    // PURPOSE: dispatch an event on call ( so when player collision is detected with platform this function is called to trigger an event )
    triggerContactEvent() { document.dispatchEvent( new CustomEvent( this.contactEvent ) ) }

}


// PURPOSE: Creates a triggerPlatform object with 'trigger-level-passed' contactEvent and green debugging color
// USED BY: createSceneLevelX() functions
export class LevelCompletePlatform extends triggerPlatform {

    // PURPOSE: As described above
    constructor( gameWorld, player, position, size ) { 
        
        super( gameWorld, player, position, size, 'trigger-level-passed', 0x00ff00 ) 
    
    }

}


// PURPOSE: Creates a triggerPlatform object with 'trigger-level-passed' contactEvent and green debugging color
// USED BY: createSceneLevelX() functions
export class OutOfBoundsPlatform extends triggerPlatform {

    // PURPOSE: As described above
    constructor( gameWorld, player ) {

        super( gameWorld, player, [-30, -40, 0], [150, 0.5, 50], 'trigger-player-death', 0xff0000 );
        
    }
    
}


// PURPOSE: Creates a plane geometry with a shader material with another plane behind it using RectAreaLight. Used for the large floating arcade screen.
// USED BY: createSceneLevelX() functions
export class Screen {
    
    // Create planes and spawn them at set positions
    constructor( gameWorld ) {
        
        this.gameWorld = gameWorld;
        
        // initialise RectAreaLightUniformLib
        initRectAreaLight();
        
        // screen size
        this.screenWidth = 144.0;
        this.screenHeight = 90.0;
        this.screenX = 30;
        this.screenY = 40;
        this.screenZ = 100;
        
        // screen geometry
        this.screenGeometry = new THREE.PlaneGeometry( this.screenWidth, this.screenHeight, 100, 100 );

        // screen material with screenVertexShader and screenFragmentShader
        this.screenMaterial = new THREE.ShaderMaterial( 
            { vertexShader: loadedShaders[ 'screen-vertex-shader' ],                            // use screen-vertex-shader as vertex shader
              fragmentShader: loadedShaders[ 'screen-fragment-shader' ],                        // use screen-fragment-shader as fragment shader
              transparent : true,                                                               // enable transparency for curved edges
              uniforms : { shapeWidth : { value : this.screenWidth },                           // pass screenWidth for vertex shader to calculate curvature
                           shapeHeight : { value : this.screenHeight },                         // pass screenHeight for vertex shader to calculate curvature
                           uTime : { value : 0 },                                               // pass time variable for fragment shader scanline animation
                           uScreen : { value : loadedTextures['image_on_screen'] },             // pass screen texture image
                           isFlickerOn : {value : Number( isFlickerOn ) }                       // pass boolean to turn screen flickering on or off
                         }
            });

        // screen mesh with screenGeometry and screenMaterial
        this.screenMesh = new THREE.Mesh( this.screenGeometry, this.screenMaterial );

        // set position and rotation
        this.screenMesh.position.set( this.screenX, this.screenY, this.screenZ );                       // far away in +z direction

        this.screenMeshRotationMatrixY = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 0, 1, 0 ), Math.PI );         // define a rotation matrix about the y-axis
        this.screenMeshRotationMatrixZ = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0, 0 ), Math.PI / 8 );     // define a rotation matrix about the z-axis
        this.screenMeshRotationMatrixComposed = new THREE.Matrix4().copy(this.screenMeshRotationMatrixY).multiply( this.screenMeshRotationMatrixZ );      // multiply rotation matrices

        this.screenMesh.quaternion.setFromRotationMatrix( this.screenMeshRotationMatrixComposed )       // apply rotation matrix ( so screen is facing track and facing down a bit )
        
        this.gameWorld.scene.add( this.screenMesh )             // add screenMesh to scene


        // create screenLight geometry
        this.screenLight = new THREE.RectAreaLight( 0x8822aa, 0.25, this.screenWidth, this.screenHeight - 20 );
        
        // set screenLight position and rotation
        this.screenLightRotationMatrix = new THREE.Matrix4().makeRotationAxis( new THREE.Vector3( 1, 0 ,0 ), - Math.PI / 8 );
        this.screenLight.quaternion.setFromRotationMatrix( this.screenLightRotationMatrix )             // rotate to face -z direction
        this.screenLight.position.set( this.screenX, this.screenY + 10, this.screenZ + 20 );

        // create screen body
        this.screenBody = new RectAreaLightHelper( this.screenLight )

        // add to scene
        this.gameWorld.scene.add( this.screenLight );
        this.gameWorld.scene.add( this.screenBody );




    }

    // PURPOSE: Updates uTime variable in fragment shader of screenMaterial for animation
    // USED BY: LevelManager.gameloop()
    updateScanlines( delta ) { this.screenMaterial.uniforms.uTime.value += delta }

}


// PURPOSE: Creates a platform for the player to spawn on using FloorPiece and a door using RectAreaLight 
// USED BY: createSceneLevelX() functions
export class SpawnArea {
    
    // PURPOSE: Initialise RectAreaLightUniformLib, define position and size variables, and call makeDoor() and makePlatform() functions
    constructor( gameWorld, spawnPlatformXStart, playerSpawnY, playerHeight, trackZCentre ) {
        
        initRectAreaLight();

        this.gameWorld = gameWorld;
        this.platformXStart = spawnPlatformXStart;
        this.platformXLength = 1.50;
        this.platformY = playerSpawnY - playerHeight;
        this.doorXStart = this.platformXStart + 0.01      // looks better if it is moved slightly forward
        this.doorWidth = 0.75;
        this.doorHeight = 1.4;
        this.trackZCentre = trackZCentre;

        this.makeDoor();
        this.makePlatform();

    }

    // PURPOSE: Creates door object using RectAreaLight and adds it to the scene
    // USED BY: SpawnArea.constructor()
    makeDoor() {

        // create door light and door body and set position and rotation
        this.doorLight = new THREE.RectAreaLight( 0xffffff, 2, this.doorWidth, this.doorHeight );
        this.doorLight.quaternion.set(0, 1/Math.sqrt(2), 0, -1/Math.sqrt(2))    // rotate to face +x direction
        this.doorLight.position.set( this.doorXStart, this.platformY + ( this.doorHeight / 2 ), this.trackZCentre );
        this.doorBody = new RectAreaLightHelper( this.doorLight )

        // add both to scene
        this.gameWorld.scene.add( this.doorLight );
        this.gameWorld.scene.add( this.doorBody );

    }


    // PURPOSE: Creates platform object using FloorPiece
    // USED BY: SpawnArea.constructor()
    makePlatform() {

        this.platform   =   new FloorPiece( this.gameWorld, 
                                            [ this.platformXStart, this.platformY, this.trackZCentre ], 
                                            [ this.platformXLength, 0.5, ( this.doorWidth / 2 ) ],
                                            10.0
                                          )
    }

}


// PURPOSE: Creates a staircase object by creating lots of FloorPieces and spawning them in a staircase shape
// USED BY: createSceneLevelX() functions
export class Staircase {

    // PURPOSE: Define variables for staircase and call createStaircase() function
    constructor( gameWorld, startingPosition, numberOfSteps, stairDepth, stairWidth, colorHue ) {

        this.gameWorld = gameWorld;
        
        // color of staircase to pass to FloorPiece
        this.colorHue = colorHue;

        // stores each step in case it needs to be accessed later
        this.stepsArray = [];

        // position and size variables
        this.numberOfSteps = numberOfSteps;
        this.startingPosition = startingPosition;
        this.stairDepth = stairDepth;
        this.stairWidth = stairWidth;
        this.stairHeight = 0.15;

        this.tempFloorPiece;

        // spawn FloorPieces
        this.createStaircase();

    }


    // PURPOSE: Creates numberOfSteps amount of FloorPieces in a staircase pattern
    createStaircase() {

        // tracking variables
        this.depthIncrement = 0;
        this.heightIncrement = 0;

        // loop numberOfSteps times
        for ( let i = 0; i < this.numberOfSteps; ++i ) {

            // make a step
            this.tempFloorPiece = new FloorPiece( this.gameWorld, 
                                                  [ this.startingPosition[0] + this.depthIncrement, 
                                                    this.startingPosition[1] + this.heightIncrement, 
                                                    this.startingPosition[2] ],
                                                  [ this.stairDepth, 
                                                    this.stairHeight, 
                                                    this.stairWidth ],
                                                    this.colorHue
                                                );

            this.stepsArray.push( this.tempFloorPiece );        // add step to stepsArray

            // increment tracking variables
            this.depthIncrement += this.stairDepth;
            this.heightIncrement += this.stairHeight;
            
        }

    }

}


// PURPOSE: FLOORPIECE SPAWNS A IMMOVABLE CUBOID (MESH AND RIGIDBODY) TO ACT AS THE FLOOR.
//
//          IT TAKES:
//               GAMEWORLD FOR SPAWNING
//               POSITION = THE MIDPOINT OF THE TOP BACK EDGE OF THE CUBOID
//               SIZE = ABSOLUTE DISTANCE IN EACH COORDINATE FROM POSITION COORDINATE TO THE RIGHT FRONT BOTTOM VERTEX OF THE CUBOID (ALL VALUES MUST BE POSITIVE)
//          NO ROTATION PARAMETER IS NEEDED AS THE FLOOR PIECES ALL HAVE THE SAME ORIENTATION
//          
//          THE POSITION AND SIZE HAVE BEEN SET UP LIKE THIS TO MAKE IT EASIER TO POSITION THE FLOOR PIECES
//          
//          HERE IS AN EXAMPLE:
//               ``` new FloorPiece( GameWorld, [ 0, 0, 0 ], [ 4, 3, 1 ] ) ```
//               
//               THIS WOULD CREATE A 4x3x2 CUBOID IN GAMEWORLD WITH VERTICES:
//               [ 0,  0, -1 ]
//               [ 0,  0,  1 ]
//               [ 0, -3, -1 ]
//               [ 0, -3,  1 ]
//               [ 4,  0, -1 ]
//               [ 4,  0,  1 ]
//               [ 4, -3, -1 ]
//               [ 4, -3,  1 ]
// USED BY: createSceneLevelX() functions 
export class FloorPiece {
    
    // PURPOSE: Define variables for cuboid and call createFloorBody() and createFloorMesh() functions
    constructor( gameWorld, position, size, colorHue ) {

        this.colorHue = colorHue;

        // allows other objects to set floor to white by sending a hue value over 2
        if (this.colorHue > 2) { this.colorLightness = 1.0 }
        else { this.colorLightness = 0.6 }
        
        this.gameWorld = gameWorld;

        // define variables for position, rotation, and size
        this.floorMass = 0;                                                         // immovable
        this.floorSize = new THREE.Vector3( size[0], size[1], 2 * size[2] );        // size for mesh
        this.ammoFloorPosition = new Ammo.btVector3( position[0] + ( size[0] / 2 ), position[1] - ( size[1] / 2 ), position[2] );   // position for rigidbody
        this.ammoFloorQuaternion = new Ammo.btQuaternion( 0, 0, 0, 1 );                                 // rotation for rigidbody
        this.ammoFloorSize = new Ammo.btVector3( 0.5 * size[0], 0.5 * size[1], size[2]);                // size for rigidbody

        this.floorBody;
        this.floorMesh;

        // create floorBody and floorMesh
        this.createFloorBody();
        this.createFloorMesh();

        //this.gameWorld.rigidBodies.push( { mesh: this.floorMesh, motionstate: this.floorMotionState } );      // not needed because not effected by physics simulation

    }


    // PURPOSE: Create physics body for floor
    // USED BY: FloorPiece.constructor()
    createFloorBody() {

        // set position and rotation for physics sim
        this.floorTransform = new Ammo.btTransform();
        this.floorTransform.setIdentity();
        this.floorTransform.setOrigin( this.ammoFloorPosition );
        this.floorTransform.setRotation( this.ammoFloorQuaternion );

        // set up rigid body variables for physics sim
        this.floorMotionState = new Ammo.btDefaultMotionState( this.floorTransform );

        this.floorShape = new Ammo.btBoxShape( this.ammoFloorSize );
        this.floorShape.setMargin( 0.05 );

        this.floorIntertia = new Ammo.btVector3( 0, 0, 0 );

        this.floorInfo = new Ammo.btRigidBodyConstructionInfo( this.floorMass, 
                                                               this.floorMotionState, 
                                                               this.floorShape, 
                                                               this.floorIntertia 
                                                             );

        this.floorBody = new Ammo.btRigidBody( this.floorInfo );

        // set collision flag to static filter to act as a static object
        this.floorBody.setCollisionFlags( Ammo.btCollisionObject.CF_STATIC_OBJECT );

        // add to physics world
        this.gameWorld.physicsWorld.addRigidBody( this.floorBody ); 

    }

    // refactor
    createFloorMesh() {

        let floorGeometry = new THREE.BoxGeometry( this.floorSize.x, 
                                                   this.floorSize.y, 
                                                   this.floorSize.z 
                                                 );

        let color = new THREE.Color();                          // make color object to populate later
        
        floorGeometry = floorGeometry.toNonIndexed();           // gives a triangle/square effect

        const position = floorGeometry.attributes.position;     // get vertex position 

        const colors = [];                                      // list to populate

        for ( let i = 0, l = position.count; i < l; i ++ ) {

            // set vertex color
            color.setHSL(  this.colorHue + Math.random() * 0.2, 
                                0.75, 
                                this.colorLightness + Math.random() * 0.3, 
                                THREE.SRGBColorSpace 
                             );
            colors.push( color.r, color.g, color.b );           // populate colors list

        }

        // set vertex colors from list
        floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ) );

        // make material from vertex colors
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.1, metalness: 0.3, vertexColors: true  } );
        floorMaterial.castShadow = false;
        floorMaterial.receiveShadow = true;

        // make floorMesh using floorGeometry and floorMaterial
        this.floorMesh = new THREE.Mesh( floorGeometry, floorMaterial );

        // set floorMesh position
        this.floorMesh.position.set( this.ammoFloorPosition.x(), 
                                     this.ammoFloorPosition.y(), 
                                     this.ammoFloorPosition.z()
                                   );

        // add floorMesh to scene
        this.gameWorld.scene.add( this.floorMesh );

    }

}
