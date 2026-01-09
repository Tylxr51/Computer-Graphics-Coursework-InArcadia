import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

export class RigidBody {
    constructor() {
    }

    createBox(size, mass, position, quaternion) {
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z) );
        this.transform.setRotation( new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w) );
        this.motionState = new Ammo.btDefaultMotionState( this.transform );

        const btSize = new Ammo.btVector3( size.x * 0.5, size.y * 0.5, size.z * 0.5 );
        this.shape = new Ammo.btBoxShape( btSize );
        this.shape.setMargin( 0.05 );

        this.intertia = new Ammo.btVector3( 0, 0, 0 );
        if (mass > 0) {
            this.shape.calculateLocalInertia( mass, this.intertia );
        }

        this.info = new Ammo.btRigidBodyConstructionInfo( 
            mass, 
            this.motionState, 
            this.shape, 
            this.intertia );
        this.body = new Ammo.btRigidBody( this.info );

        Ammo.destroy( btSize );
    }
}

export class triggerPlatform {

    constructor( gameWorld, player, position, size, contactEvent, debugColor ) {

        this.gameWorld = gameWorld;     // define gameWorld
        this.player = player;
        this.contactEvent = contactEvent;

        this.mass = 0;                  // immovable

        this.ammoPlatformPosition = new Ammo.btVector3( position[0] + ( size[0] / 2 ), position[1] - ( size[1] / 2 ), position[2] );   // position for rigidbody
        this.ammoPlatformQuaternion = new Ammo.btQuaternion( 0, 0, 0, 1 );                                 // rotation for rigidbody
        this.ammoPlatformSize = new Ammo.btVector3( 0.5 * size[0], 0.5 * size[1], size[2]);                // size for rigidbody

        this.platformShape = new Ammo.btBoxShape( this.ammoPlatformSize );
        this.platformShape.setMargin( 0.05 );

        this.platformTransform = new Ammo.btTransform();      // set up platform transform 
        this.platformTransform.setIdentity();
        this.platformTransform.setOrigin( this.ammoPlatformPosition );          // position platform
        this.platformTransform.setRotation( this.ammoPlatformQuaternion );      // rotate platform
        


        this.platformInertia = new Ammo.btVector3( 0, 0, 0 );

        this.platformMotionState = new Ammo.btDefaultMotionState( this.platformTransform );

        this.platformInfo = new Ammo.btRigidBodyConstructionInfo( this.mass,
                                                                  this.platformMotionState,
                                                                  this.platformShape,
                                                                  this.platformInertia
                                                                );

        this.platformBody = new Ammo.btRigidBody( this.platformInfo );

        this.platformBody.setCollisionFlags( Ammo.btBroadphaseProxy.StaticFilter );

        // Add to world
        this.gameWorld.physicsWorld.addRigidBody( this.platformBody,
                                                  Ammo.btBroadphaseProxy.StaticFilter,
                                                  Ammo.btBroadphaseProxy.CharacterFilter
                                                );


        this.platformGeometry = new THREE.BoxGeometry( size[0], size[1], 2*size[2] );

        this.platformMaterial = new THREE.MeshStandardMaterial( { color: debugColor } );
        this.platformMesh = new THREE.Mesh( this.platformGeometry, this.platformMaterial );
        this.platformMesh.position.set( this.ammoPlatformPosition.x(), this.ammoPlatformPosition.y(), this.ammoPlatformPosition.z() )
        if ( debug ) { this.gameWorld.scene.add( this.platformMesh ) };

    }

    triggerContactEvent() {
        
        document.dispatchEvent( new CustomEvent( this.contactEvent ) );

    }

}

export class LevelCompletePlatform extends triggerPlatform {

    constructor( gameWorld, player, position, size ) {

        super( gameWorld, player, position, size, 'trigger-level-passed', 0x00ff00 );

    }

}

export class OutOfBoundsPlatform extends triggerPlatform {

    constructor( gameWorld, player ) {

        super( gameWorld, player, [-30, -40, 0], [150, 0.5, 50], 'trigger-player-death', 0xff0000 );
        
    }
    
}


function initRectAreaLight() {

    if (!isRectAreaLightUniformLibInit) { 
            
            RectAreaLightUniformsLib.init();

            isRectAreaLightUniformLibInit = true;
        
        };

}

export class Screen {
    
    constructor( gameWorld ) {
        
        this.gameWorld = gameWorld;
        
        initRectAreaLight();
        
        // load texture to go on screen
        this.screenTexture = new THREE.TextureLoader().load('./assets/screenTexture.png')
        
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
            { vertexShader: screenVertexShader, 
              fragmentShader: screenFragmentShader, 
              transparent : true, 
              uniforms : { shapeWidth : { value : this.screenWidth },
                           shapeHeight : { value : this.screenHeight },
                           uTime : { value : 0 },
                           uColor : { value : new THREE.Color( 0xffffff ) },
                           uScreen : { value : this.screenTexture },
                           isFlickerOn : {value : Number( isFlickerOn ) }
                         }
            } 
        );

        // screen mesh with screenGeometry and screenMaterial
        this.screenMesh = new THREE.Mesh(this.screenGeometry, this.screenMaterial);

        // set position and rotation
        this.screenMesh.position.set(this.screenX, this.screenY, this.screenZ)                         // far away in +z direction
        this.screenMesh.quaternion.set(0, 0.9805807, -0.1961161, 0)       // facing track and tilted down a bit
        
        // add to scene
        this.gameWorld.scene.add(this.screenMesh)


        this.screenLight = new THREE.RectAreaLight( 0x8822aa, 0.25, this.screenWidth, this.screenHeight - 20 );
        this.screenLight.quaternion.set(-0.258819, 0, 0, 0.9659258)    // rotate to face +x direction
        this.screenLight.position.set( this.screenX, this.screenY + 10, this.screenZ + 20 );
        this.screenBody = new RectAreaLightHelper( this.screenLight )


        this.gameWorld.scene.add( this.screenLight );
        this.gameWorld.scene.add( this.screenBody );




    }

    updateScanlines( delta ) {
        this.screenMaterial.uniforms.uTime.value += delta
    }
}

export class SpawnArea {
    
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

    makeDoor() {

        this.doorLight = new THREE.RectAreaLight( 0xffffff, 2, this.doorWidth, this.doorHeight );
        this.doorLight.quaternion.set(0, 1/Math.sqrt(2), 0, -1/Math.sqrt(2))    // rotate to face +x direction
        this.doorLight.position.set( this.doorXStart, this.platformY + ( this.doorHeight / 2 ), this.trackZCentre );
        this.doorBody = new RectAreaLightHelper( this.doorLight )


        this.gameWorld.scene.add( this.doorLight );
        this.gameWorld.scene.add( this.doorBody );


    }

    makePlatform() {
        this.platform   =   new FloorPiece( this.gameWorld, 
                                            [ this.platformXStart, this.platformY, this.trackZCentre ], 
                                            [ this.platformXLength, 0.5, ( this.doorWidth / 2 ) ],
                                            10.0
                                          );
    }
}


export class Staircase {

    constructor( gameWorld, startingPosition, numberOfSteps, stairDepth, stairWidth, colorHue ) {

        this.gameWorld = gameWorld;
        
        this.colorHue = colorHue;

        this.stepsArray = [];

        this.numberOfSteps = numberOfSteps;
        this.startingPosition = startingPosition;
        this.stairDepth = stairDepth;
        this.stairWidth = stairWidth;
        this.stairHeight = 0.15;

        this.tempFloorPiece;

        this.createStaircase();

    }

    createStaircase() {

        this.depthIncrement = 0;
        this.heightIncrement = 0;

        for ( let i = 0; i < this.numberOfSteps; ++i ) {
            this.tempFloorPiece = new FloorPiece( this.gameWorld, 
                                                  [ this.startingPosition[0] + this.depthIncrement, 
                                                    this.startingPosition[1] + this.heightIncrement, 
                                                    this.startingPosition[2] ],
                                                  [ this.stairDepth, 
                                                    this.stairHeight, 
                                                    this.stairWidth ],
                                                    this.colorHue
                                                );

            this.stepsArray.push( this.tempFloorPiece );

            this.depthIncrement += this.stairDepth;
            this.heightIncrement += this.stairHeight;
            
        }

    }

}

// WHAT THIS CLASS DOES AND WHY:
//
// FLOORPIECE SPAWNS A IMMOVABLE CUBOID (MESH AND RIGIDBODY) TO ACT AS THE FLOOR.
//
// IT TAKES:
//      GAMEWORLD FOR SPAWNING
//      POSITION = THE MIDPOINT OF THE TOP BACK EDGE OF THE CUBOID
//      SIZE = ABSOLUTE DISTANCE IN EACH COORDINATE FROM POSITION COORDINATE TO THE RIGHT FRONT BOTTOM VERTEX OF THE CUBOID (ALL VALUES MUST BE POSITIVE)
// NO ROTATION PARAMETER IS NEEDED AS THE FLOOR PIECES ALL HAVE THE SAME ORIENTATION
//
// THE POSITION AND SIZE HAVE BEEN SET UP LIKE THIS TO MAKE IT EASIER TO POSITION THE FLOOR PIECES
//
// HERE IS AN EXAMPLE:
//      ``` new FloorPiece( GameWorld, [ 0, 0, 0 ], [ 4, 3, 1 ] ) ```
//      
//      THIS WOULD CREATE A 4x3x2 CUBOID IN GAMEWORLD WITH VERTICES:
//      [ 0,  0, -1 ]
//      [ 0,  0,  1 ]
//      [ 0, -3, -1 ]
//      [ 0, -3,  1 ]
//      [ 4,  0, -1 ]
//      [ 4,  0,  1 ]
//      [ 4, -3, -1 ]
//      [ 4, -3,  1 ]

export class FloorPiece {
    
    constructor( gameWorld, position, size, colorHue ) {

        this.colorHue = colorHue;

        if (this.colorHue > 2) { 
            this.colorLightness = 1.0 }
        else { 
            this.colorLightness = 0.6 }
        
        this.gameWorld = gameWorld;

        this.floorMass = 0;      // immovable
        this.floorSize = new THREE.Vector3( size[0], size[1], 2 * size[2] );        // size for mesh
        this.ammoFloorPosition = new Ammo.btVector3( position[0] + ( size[0] / 2 ), position[1] - ( size[1] / 2 ), position[2] );   // position for rigidbody
        this.ammoFloorQuaternion = new Ammo.btQuaternion( 0, 0, 0, 1 );                                 // rotation for rigidbody
        this.ammoFloorSize = new Ammo.btVector3( 0.5 * size[0], 0.5 * size[1], size[2]);                // size for rigidbody

        this.floorBody;
        this.floorMesh;

        this.createFloorBody();
        this.createFloorMesh();

        //this.gameWorld.rigidBodies.push( { mesh: this.floorMesh, motionstate: this.floorMotionState } );  // not needed because doesnt move


    }

    createFloorBody() {

        this.floorTransform = new Ammo.btTransform();
        this.floorTransform.setIdentity();
        this.floorTransform.setOrigin( this.ammoFloorPosition );
        this.floorTransform.setRotation( this.ammoFloorQuaternion );

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

        this.floorBody.setCollisionFlags( Ammo.btCollisionObject.CF_STATIC_OBJECT );

        this.gameWorld.physicsWorld.addRigidBody( this.floorBody ); 

    }

    createFloorMesh() {

        this.floorGeometry = new THREE.BoxGeometry( this.floorSize.x, 
                                                    this.floorSize.y, 
                                                    this.floorSize.z 
                                                  );
                                                  
        




        // colour variation

        this.color = new THREE.Color();

        let position = this.floorGeometry.attributes.position;

        this.floorGeometry = this.floorGeometry.toNonIndexed(); // ensure each face has unique vertices

        position = this.floorGeometry.attributes.position;
        this.colorsFloor = [];

        for ( let i = 0, l = position.count; i < l; i ++ ) {

            this.color.setHSL(  this.colorHue + Math.random() * 0.2, 
                                0.75, 
                                this.colorLightness + Math.random() * 0.3, 
                                THREE.SRGBColorSpace 
                             );
            this.colorsFloor.push( this.color.r, this.color.g, this.color.b );

        }

        this.floorGeometry.setAttribute( 'color', new THREE.Float32BufferAttribute( this.colorsFloor, 3 ) );



        this.floorMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc, roughness: 0.1, metalness: 0.3, vertexColors: true  } );
        

        this.floorMesh = new THREE.Mesh( this.floorGeometry, this.floorMaterial );


        this.floorMesh.position.set( this.ammoFloorPosition.x(), 
                                     this.ammoFloorPosition.y(), 
                                     this.ammoFloorPosition.z()
                                   );
                                   

        this.floorMesh.castShadow = false;
        this.floorMesh.receiveShadow = true;

        this.gameWorld.scene.add( this.floorMesh );

    }
}
