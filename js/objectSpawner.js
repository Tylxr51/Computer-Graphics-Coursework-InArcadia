import * as THREE from '/three.js-r170/build/three.module.js';

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
    
    
    constructor( gameWorld, position, size) {
        
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
        this.floorMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
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
