import * as THREE from '/three.js-r170/build/three.module.js';
import { PointerLockControls } from '/three.js-r170/examples/jsm/controls/PointerLockControls.js'; 


export default class World {
    constructor() {

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
        this.firstPersonCamera.position.set( -3, 0.5, 0 );
        this.firstPersonCamera.lookAt( 0, 0, 0 );
        
        // this.secondCamera;

        this.currentCamera = this.firstPersonCamera;
        
        
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.style.margin = '0';
        document.body.appendChild( this.renderer.domElement );

        
        
        this.controls = new PointerLockControls( this.currentCamera, this.renderer.domElement );
        this.controls.pointerSpeed = 0.5;
        
        this.gravityVector = new THREE.Vector3(0, -9.81, 0);
        
        this.physicsWorld;
        this.tmpTransform;
        this.rigidBodies = []; 

        window.addEventListener( 'resize', () => {
            this.currentCamera.aspect = window.innerWidth / window.innerHeight;
            this.currentCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }, false );  


    }

    initPhysics() {
        this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
        this.dispatcher = new Ammo.btCollisionDispatcher( this.collisionConfiguration );
        this.broadphase = new Ammo.btDbvtBroadphase();
        this.solver = new Ammo.btSequentialImpulseConstraintSolver();
        this.physicsWorld = new Ammo.btDiscreteDynamicsWorld( this.dispatcher, this.broadphase, this.solver, this.collisionConfiguration );
        
        this.physicsWorld.setGravity( new Ammo.btVector3(this.gravityVector.x, this.gravityVector.y, this.gravityVector.z) );
        this.tmpTransform = new Ammo.btTransform();
    }
}