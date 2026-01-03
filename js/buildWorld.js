import * as THREE from 'three';


export default class World {
    // initialise game world
    constructor(gravityVector, abortController) {

        // scene and renderer setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x222222 );
		this.scene.fog = new THREE.Fog( 0x000000, 0, 1000 );

        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        document.body.appendChild( this.renderer.domElement );              // add canvas to document body



        // first person camera setup
        this.firstPersonCameraWalkFOV = 75;
        this.firstPersonCameraAspect;
        this.firstPersonCameraNear = 0.1;
        this.firstPersonCameraFar = 1000;
        this.firstPersonCamera = new THREE.PerspectiveCamera( this.firstPersonCameraWalkFOV, 
                                                              this.firstPersonCameraAspect,
                                                              this.firstPersonCameraNear, 
                                                              this.firstPersonCameraFar 
                                                            );



        // PERSPECTIVE THIRD PERSON CAMERA
        // this.thirdPersonCameraWalkFOV = 50;
        // this.thirdPersonCameraAspect = window.innerWidth / window.innerHeight;
        // this.thirdPersonCameraNear = 0.1;
        // this.thirdPersonCameraFar = 1000;
        // this.thirdPersonCamera = new THREE.PerspectiveCamera( 
        //     this.thirdPersonCameraWalkFOV, 
        //     this.thirdPersonCameraAspect, 
        //     this.thirdPersonCameraNear, 
        //     this.thirdPersonCameraFar 
        // );


        // ORTHOGRAPHIC THIRD PERSON CAMERA
        this.thirdPersonCameraLeft;
        this.thirdPersonCameraRight;
        this.thirdPersonCameraTop;
        this.thirdPersonCameraBottom;
        this.thirdPersonCameraNear = 0.1;
        this.thirdPersonCameraFar = 1000;
        this.thirdPersonCameraZoomOut = 0.015;
        this.thirdPersonCameraDistanceFromScene = 10;
        this.thirdPersonCamera = new THREE.OrthographicCamera( this.thirdPersonCameraLeft,
                                                               this.thirdPersonCameraRight,
                                                               this.thirdPersonCameraTop,
                                                               this.thirdPersonCameraBottom,
                                                               this.thirdPersonCameraNear,
                                                               this.thirdPersonCameraFar
                                                            );

        // set camera aspect ratios
        this.setCameraAspectRatios();

        this.cameraArray = [ this.firstPersonCamera, this.thirdPersonCamera ];
        this.firstPersonCameraIndex = 0;
        this.thirdPersonCameraIndex = 1;

        // handle window resizing
        this.onWindowResize = () => { this.setCameraAspectRatios(); }
        window.addEventListener( 'resize', this.onWindowResize, { signal: abortController.signal } );  


        // define world gravity vector
        this.gravityVector = gravityVector;
        
        // initialise physics variables
        this.physicsWorld;
        this.tmpTransform;
        this.rigidBodies = []; 

    }

    setCameraAspectRatios() {

        // set first person camera aspect ratio
        this.firstPersonCamera.aspect = window.innerWidth / window.innerHeight;

        // set third person camera aspect ratio
        this.thirdPersonCamera.left     = - this.thirdPersonCameraZoomOut * window.innerWidth  / 2;
        this.thirdPersonCamera.right    =   this.thirdPersonCameraZoomOut * window.innerWidth  / 2;
        this.thirdPersonCamera.top      =   this.thirdPersonCameraZoomOut * window.innerHeight / 2;
        this.thirdPersonCamera.bottom   = - this.thirdPersonCameraZoomOut * window.innerHeight / 2;

        // update cameras        
        this.firstPersonCamera.updateProjectionMatrix();
        this.thirdPersonCamera.updateProjectionMatrix();

        // update renderer
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        
    }

    // initialise world physics
    initPhysics() {

        // initialise physicsWorld
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, 
                                                              this.broadphase, 
                                                              this.solver, 
                                                              this.collisionConfiguration 
                                                            );
        
        // set gravity
        this.ammoGravityVector = new Ammo.btVector3( this.gravityVector.x, 
                                                     this.gravityVector.y, 
                                                     this.gravityVector.z 
                                                    );
        this.physicsWorld.setGravity( this.ammoGravityVector );
        Ammo.destroy( this.ammoGravityVector );
        this.ammoGravityVector = null;
        
        // initialise temporary tranform variable
        this.tmpTransform = new Ammo.btTransform();

        // enable collision between ghost objects and rigid bodies
        this.ammoGhostPairCallback = new Ammo.btGhostPairCallback();
        this.physicsWorld.getBroadphase().getOverlappingPairCache().setInternalGhostPairCallback( this.ammoGhostPairCallback );
    }

    updateRigidBodyMeshToSimulation() {

        for ( let i = 0; i < this.rigidBodies.length; ++i ) {

            this.rigidBodies[i].motionstate.getWorldTransform( this.tmpTransform );   // get world transform

            // extract position and rotation
            this.ammoCurrentRBPos = this.tmpTransform.getOrigin();
            this.ammoCurrentRBQuat = this.tmpTransform.getRotation();
            this.currentRBPos = new THREE.Vector3( this.ammoCurrentRBPos.x(), 
                                                   this.ammoCurrentRBPos.y(), 
                                                   this.ammoCurrentRBPos.z() 
                                                );
            this.currentRBQuat = new THREE.Quaternion( this.ammoCurrentRBQuat.x(), 
                                                       this.ammoCurrentRBQuat.y(), 
                                                       this.ammoCurrentRBQuat.z(), 
                                                       this.ammoCurrentRBQuat.w() 
                                                    );
            
            // update mesh position and roatation
            this.rigidBodies[i].mesh.position.copy( this.currentRBPos );
            this.rigidBodies[i].mesh.quaternion.copy( this.currentRBQuat );
        }
    }

    disposeWorld() {

        // remove canvas from document body
        document.body.removeChild( this.renderer.domElement );


        //////////// DISPOSAL: remove from GPU memory ////////////

        // loop through all objects in scene
        this.scene.traverse(obj => {

            // if not a geometry or material then move to next object
            if (!obj.geometry || !obj.material) return

            // remove geometry
            obj.geometry.dispose()

            // remove material (check if array so can remove all of them)
            if ( Array.isArray( obj.material ) ) { obj.material.forEach( m => m.dispose() ) } 
            else { obj.material.dispose() }

        });

        //////////// REMOVAL: detatch objects from scene graph ////////////

        // remove all scene children
        while ( this.scene.children.length > 0 ) { this.scene.remove( this.scene.children[0] ) };


        // destroy ammo objects
        Ammo.destroy( this.physicsWorld );
        Ammo.destroy( this.tmpTransform );
        Ammo.destroy( this.collisionConfiguration );
        Ammo.destroy( this.dispatcher );
        Ammo.destroy( this.broadphase );
        Ammo.destroy( this.solver );
        Ammo.destroy( this.ammoGhostPairCallback );

        // set variables to null
        this.tmpTransform = null;
        this.collisionConfiguration = null;
        this.dispatcher = null;
        this.broadphase = null;
        this.solver = null;
        this.physicsWorld = null;
        this.ammoCurrentRBPos = null;
        this.ammoCurrentRBQuat = null;
        this.scene = null;
        this.renderer = null;
        this.firstPersonCamera = null;
        this.thirdPersonCamera = null;
        this.rigidBodies = null; 
    }
}