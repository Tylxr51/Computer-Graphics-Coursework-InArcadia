import * as THREE from '/three.js-r170/build/three.module.js';


export default class World {
    // initialise game world
    constructor(gravityVector) {

        // first person camera setup
        this.firstPersonCameraWalkFOV = 75;
        this.firstPersonCameraAspect = window.innerWidth / window.innerHeight;
        this.firstPersonCameraNear = 0.1;
        this.firstPersonCameraFar = 1000;
        this.firstPersonCamera = new THREE.PerspectiveCamera( 
            this.firstPersonCameraWalkFOV, 
            this.firstPersonCameraAspect, 
            this.firstPersonCameraNear, 
            this.firstPersonCameraFar 
        );
        this.firstPersonCamera.lookAt(new THREE.Vector3(1, 0, 0));
        
        // this.secondCamera;

        // set current camera to first person camera
        this.currentCamera = this.firstPersonCamera;
        
        
        // scene and renderer setup
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.style.margin = '0';
        document.body.appendChild( this.renderer.domElement );

        // define world gravity vector
        this.gravityVector = gravityVector;
        
        // initialise physics variables
        this.physicsWorld;
        this.tmpTransform;
        this.rigidBodies = []; 

        // handle window resizing (MOVE THIS ELSEWHERE LATER)
        window.addEventListener( 'resize', () => {
            this.currentCamera.aspect = window.innerWidth / window.innerHeight;
            this.currentCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }, false );  


    }

    // initialise world physics
    initPhysics() {

        // initialise physicsWorld
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration );
        
        // set gravity
        this.physicsWorld.setGravity( new Ammo.btVector3(this.gravityVector.x, this.gravityVector.y, this.gravityVector.z) );
        
        // initialise temporary tranform variable
        this.tmpTransform = new Ammo.btTransform();

        // enable collision between ghost objects and rigid bodies
        this.physicsWorld.getBroadphase().getOverlappingPairCache().setInternalGhostPairCallback(new Ammo.btGhostPairCallback())
    }
}