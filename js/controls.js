import * as THREE from '/three.js-r170/build/three.module.js';
import { PointerLockControls } from '/three.js-r170/examples/jsm/controls/PointerLockControls.js'; 


export default class PlayerControls {
    constructor(camera, renderer) {
        this.camera = camera
        this.renderer = renderer
        this.controls = new PointerLockControls( this.camera, this.renderer.domElement );
        this.controls.pointerSpeed = 0.5;

        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        this.canJump = true;

        this.sprint = false;
        this.toggleSprint = true;
        this.stationaryIsToggle = true;

        this.movementSpeed = 80;

        this.velocity = new THREE.Vector3(0, 0, 0);
        this.direction = new THREE.Vector3(0, 0, 0);

    }


    onKeyDown = (event) => {
        switch ( event.code ) {
            case 'KeyW':
                this.moveForward = true;
                break;

            case 'KeyA':
                this.moveLeft = true;
                break;

            case 'KeyS':
                this.moveBackward = true;
                break;

            case 'KeyD':
                this.moveRight = true;
                break;

            // case 'Space':
            //     if ( this.canJump === true ) velocity.y = 10;
            //     break;

            case 'ShiftLeft':
                if (this.toggleSprint && !this.stationaryIsToggle) {
                    this.sprint = !this.sprint;
                }
                else if (this.toggleSprint && this.stationaryIsToggle) {
                    this.sprint = true;
                }
                else {
                    this.sprint = true;
                }
                break;
        }
    }

    onKeyUp = (event) => {
        switch ( event.code ) {
            case 'KeyW':
                this.moveForward = false;
                break;

            case 'KeyA':
                this.moveLeft = false;
                break;

            case 'KeyS':
                this.moveBackward = false;
                break;

            case 'KeyD':
                this.moveRight = false;
                break;

            case 'ShiftLeft':
                if (!this.toggleSprint) {
                    this.sprint = false;
                }
                break;
        }
    }


    turnOffMovement() {
        document.removeEventListener( 'keydown', this.onKeyDown );
        document.removeEventListener( 'keyup', this.onKeyUp );
        this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false;
    }

    turnOnMovement() {
        document.addEventListener( 'keydown', this.onKeyDown );
        document.addEventListener( 'keyup', this.onKeyUp );
    }


    menuControlListeners(instructions, paused) {
        instructions.addEventListener( 'click', () => {
            this.controls.lock();
        } );

        paused.addEventListener( 'click', () => {
            this.controls.lock();
        } );

        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
            paused.style.display = 'none';
            this.turnOnMovement();
        } );

        this.controls.addEventListener('unlock', () => {
            instructions.style.display = 'none';
            paused.style.display = 'flex';
            this.turnOffMovement();
        } );  
    }

    sprintLogic(delta) {
        this.movementSpeed = 80;
        this.currentFOV = this.camera.fov;

        if (this.velocity.length() !== 0 && this.direction.length() === 0 && this.toggleSprint && this.stationaryIsToggle) {
            this.sprint = false;
        }

        if (this.direction.length() === 0) {
            if (this.currentFOV > 75) {
                this.currentFOV = Math.max(this.currentFOV - (200 * delta), 75);
            }
        }

        else {
            if (this.sprint) {
                this.movementSpeed = 150;
                if (this.currentFOV < 90) {
                    this.currentFOV = Math.min(this.currentFOV + (200 * delta), 90);
                }
            }
            
            else {
                if (this.currentFOV > 75) {
                    this.currentFOV = Math.max(this.currentFOV - (200 * delta), 75);  
                }
            }
        }

        return this.currentFOV
    }

    updatePlayerMotion() {
        if (this.velocity.length() < 0.01) { 
            this.velocity.x = 0;
            this.velocity.z = 0;
        }
    
        this.velocity.x -= this.velocity.x * 30.0 * delta;
        this.velocity.z -= this.velocity.z * 30.0 * delta;
    
    
        // Movement controls
        this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
        this.direction.x = Number( this.moveRight )   - Number( this.moveLeft );
        this.direction.normalize(); 
    
    
        this.camera.fov = this.sprintLogic(delta);
        this.camera.updateProjectionMatrix();
    
        if ( this.moveForward || this.moveBackward ) this.velocity.z += this.direction.z * this.movementSpeed * delta;
        if ( this.moveLeft || this.moveRight ) this.velocity.x += this.direction.x * this.movementSpeed * delta;
    
        this.controls.moveRight( this.velocity.x * delta );
        this.controls.moveForward( this.velocity.z * delta );
    }
    
}






