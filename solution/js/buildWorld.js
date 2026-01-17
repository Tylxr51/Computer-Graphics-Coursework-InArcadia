import * as THREE from 'three';


// PURPOSE: Handles the cameras, scene, renderer, and physics simulation
// USED BY: LevelManager
export default class World {

    // PURPOSE: Initialise game world - set up cameras, scene, renderer, and call physics simulation initialisation
    constructor( gravityVector, abortController ) {

        // FIRST PERSON CAMERA INIT
        const firstPersonCameraWalkFOV = 75;
        const firstPersonCameraAspect = window.innerWidth / window.innerHeight;
        const firstPersonCameraNear = 0.1;
        const firstPersonCameraFar = 1000;

        this.firstPersonCamera = new THREE.PerspectiveCamera(
            firstPersonCameraWalkFOV, 
            firstPersonCameraAspect,
            firstPersonCameraNear, 
            firstPersonCameraFar 
        );


        // THIRD PERSON CAMERA INIT
        const thirdPersonCameraWalkFOV = 50;
        const thirdPersonCameraAspect = window.innerWidth / window.innerHeight;
        const thirdPersonCameraNear = 0.1;
        const thirdPersonCameraFar = 1000;
        this.thirdPersonCameraDistanceFromScene = 15;

        this.thirdPersonCamera = new THREE.PerspectiveCamera( 
            thirdPersonCameraWalkFOV, 
            thirdPersonCameraAspect, 
            thirdPersonCameraNear, 
            thirdPersonCameraFar 
        );


        // SCENE INIT
        this.scene = new THREE.Scene();

        const sceneBackgroundColor = 0x000000;
        const sceneFogColor = 0x000000;
        const sceneFogNear = 0;
        this.sceneFogFar = 30;

        this.scene.background = new THREE.Color( sceneBackgroundColor );                                        // default black background color
		if ( !debug ) { this.scene.fog = new THREE.Fog( sceneFogColor, sceneFogNear, this.sceneFogFar ) }       // default black fog

        // RENDERER INIT
        this.renderer = new THREE.WebGLRenderer( { antialias: true } );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.setPixelRatio( window.devicePixelRatio );
        document.body.appendChild( this.renderer.domElement );              // add canvas to document body


        // set up camera array (so levelManager can switch cameras easily)
        this.cameraArray = [ this.firstPersonCamera, this.thirdPersonCamera ];
        this.firstPersonCameraIndex = 0;
        this.thirdPersonCameraIndex = 1;


        // handle window resizing
        const onWindowResize = () => { this.setCameraAspectRatios() };
        window.addEventListener( 'resize', onWindowResize, { signal: abortController.signal } );  


        // define world gravity vector
        this.gravityVector = gravityVector;
        

        // initialise physics variables
        this.physicsWorld;
        this.tmpTransform;
        this.rigidBodies = []; 

    }


    // PURPOSE: Update camera aspect ratios
    // USED BY: called on window resize
    setCameraAspectRatios() {

        // set camera aspect ratios
        this.firstPersonCamera.aspect = window.innerWidth / window.innerHeight;
        this.thirdPersonCamera.aspect = window.innerWidth / window.innerHeight;

        // update cameras        
        this.firstPersonCamera.updateProjectionMatrix();
        this.thirdPersonCamera.updateProjectionMatrix();

        // update renderer
        this.renderer.setSize( window.innerWidth, window.innerHeight );

    }


    // PURPOSE: Initialise world physics
    // USED BY: World.constructor()
    initPhysics() {

        // PHYSICS SIMULATION INIT
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


    // !!UNUSED!!
    // -- WAS WRITTEN AT THE START OF DEVELOPMENT TO TEST AMMO, NO LONGER NEEDED FOR GAME BUT KEPT IN TO SHOW CAPABILITY TO ADD IN PHYSICS OBJECTS EASILY
    // PURPOSE: Updates rigid body mesh positions given by physics simulation
    // USED BY: LevelManager.Gameloop
    updateRigidBodyMeshToSimulation() {

        // iterate through all rigid bodies
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


    // PURPOSE: Dispose of all scene childen, remove renderer from document, ammo garbage disposal
    // USED BY: Called by levelManager on level exit
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