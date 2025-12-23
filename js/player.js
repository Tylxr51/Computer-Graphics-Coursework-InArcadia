import * as THREE from '/three.js-r170/build/three.module.js';
import { PointerLockControls } from '/three.js-r170/examples/jsm/controls/PointerLockControls.js'; 

export default class Player {
    constructor(position, size, quaternion, gameWorld, instructions, paused) {

        // PLAYER PHYSICS

        // set up player physics shape
        this.playerRadius = size.x;
        this.playerHeight = size.y;
        this.playerShape = new Ammo.btCapsuleShape(this.playerRadius, this.playerHeight);

        this.maxStepHeight = 0.2;       // max height the player can step up onto

        // set up player transform 
        this.playerTransform = new Ammo.btTransform();
        this.playerTransform.setIdentity();
        this.playerTransform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z ) );
        this.playerTransform.setRotation( 
            new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) 
        );   

        // set up player ghost object
        this.ghostObject = new Ammo.btPairCachingGhostObject();
        this.ghostObject.setWorldTransform(this.playerTransform);
        this.ghostObject.setCollisionShape(this.playerShape);
        this.ghostObject.setCollisionFlags(Ammo.btCollisionObject.CF_CHARACTER_OBJECT);     // collide with other objects with this flag

        // set up player kinematic controller
        this.controller = new Ammo.btKinematicCharacterController(
            this.ghostObject,
            this.playerShape,
            this.maxStepHeight
        );

        // add player ghost object to physics world for collision detection
        gameWorld.physicsWorld.addCollisionObject(
            this.ghostObject,
            Ammo.btBroadphaseProxy.CharacterFilter,
            Ammo.btBroadphaseProxy.StaticFilter | Ammo.btBroadphaseProxy.DefaultFilter
        );

        // set gravity for player controller
        this.controller.setGravity(- 5 * gameWorld.gravityVector.y);

        // add player controller to physics world to enable movement
        gameWorld.physicsWorld.addAction(this.controller);


        // PLAYER MESH

        // set up wireframe capsule mesh to represent player
        this.playerGeometry = new THREE.CapsuleGeometry(this.playerRadius, this.playerHeight, 2, 8, 1);
        this.playerWireframe = new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true});
        this.playerMesh = new THREE.Mesh(this.playerGeometry, this.playerWireframe);

        // set initial position and rotation of player mesh
        this.playerMesh.position.set(position.x, position.y, position.z)
        this.playerMesh.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w)

        // add player mesh to scene
        gameWorld.scene.add(this.playerMesh);

        // INITIALISE PLAYER CONTROLS
        this.playerControls = new PlayerControls(this, gameWorld.currentCamera, gameWorld.renderer, this.controller, instructions, paused);

    }
}

class PlayerControls {
    constructor(player, camera, renderer, controller, instructions, paused) {
        // set up player, camera, renderer, controllers, and camera controls
        this.player = player;
        this.camera = camera
        this.renderer = renderer
        this.controller = controller;
        this.controls = new PointerLockControls( this.camera, this.renderer.domElement );
        this.controls.pointerSpeed = 0.5;

        // set movement variables
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // set jump variable
        this.canJump = false;

        // set sprint and sprint settings variables
        this.sprint = false;
        this.toggleSprint = true;
        this.stationaryIsToggle = true;

        // set movement speed variables
        this.walkSpeed = 7 / 100;
        this.runSpeed = 1.5 * this.walkSpeed;
        this.movementSpeed = this.walkSpeed;

        // set jump speed
        this.controller.setJumpSpeed(12);

        // set up direction vectors for calculating movement later
        this.lookDirection = new THREE.Vector3(0, 0, 0);
        this.inputDirection = new THREE.Vector2(0, 0);
        this.forwardVector = new THREE.Vector3(0, 0, 0);
        this.rightVector = new THREE.Vector3(0, 0, 0);
        this.movementDirection = new THREE.Vector3(0, 0, 0);
        this.scaledMovementDirection = new THREE.Vector3(0, 0, 0);

        // add menus
        this.menuControlListeners(instructions, paused);

    }

    // handle key down events
    onKeyDown = (event) => {
        // check key pressed
        switch ( event.code ) {
            // wasd
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

            // jump
            case 'Space':
                 if ( this.canJump === true ) this.controller.jump();
                 this.canJump = false;
                 break;

            // sprint
            case 'ShiftLeft':
                // pressing shift key down turns on and off sprinting
                if (this.toggleSprint && !this.stationaryIsToggle) {
                    this.sprint = !this.sprint;
                }

                // pressing shift key down only turns on sprinting, doesn't turn off sprinting
                else {
                    this.sprint = true;
                }
                break;
        }
    }

    // handle key up events
    onKeyUp = (event) => {
        // check key pressed
        switch ( event.code ) {
            // wasd
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

            // sprint
            case 'ShiftLeft':
                // releasing shift key turns off sprinting
                if (!this.toggleSprint) {
                    this.sprint = false;
                }
                break;
        }
    }

    // disable movement listeners for menu screens
    turnOffMovement() {
        // remove movement listeners
        document.removeEventListener( 'keydown', this.onKeyDown );
        document.removeEventListener( 'keyup', this.onKeyUp );

        // stop movement
        this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false;
    }

    // enable movement listeners for gameplay
    turnOnMovement() {
        // add movement listeners
        document.addEventListener( 'keydown', this.onKeyDown );
        document.addEventListener( 'keyup', this.onKeyUp );
    }


    // set up menu listeners
    menuControlListeners(instructions, paused) {
        // lock pointer when user clicks on instructions menu
        instructions.addEventListener( 'click', () => {
            this.controls.lock();
        } );

        // lock pointer when user clicks on paused menu
        paused.addEventListener( 'click', () => {
            this.controls.lock();
        } );

        // hide menu screen and enable movement when pointer is locked
        this.controls.addEventListener('lock', () => {
            instructions.style.display = 'none';
            paused.style.display = 'none';
            this.turnOnMovement();
        } );

        // show pause menu and diable movement when pointer is unlocked
        this.controls.addEventListener('unlock', () => {
            instructions.style.display = 'none';
            paused.style.display = 'flex';
            this.turnOffMovement();
        } );  
    }

    sprintLogic(minFOV, maxFOV, FOVChangeSpeed) {
        // set default movementSpeed and get currentFOV
        this.movementSpeed = this.walkSpeed;
        this.currentFOV = this.camera.fov;

        // checks if the player was moving and has just stopped and disables sprint when stationaryIsToggle is on
        if (this.inputDirection.length() === 0 && 
            this.scaledMovementDirection.length() !== 0 && 
            this.toggleSprint && 
            this.stationaryIsToggle ) {
                this.sprint = false;
        }

        // reduce FOV when stationary
        if (this.scaledMovementDirection.length() === 0) {
            this.currentFOV = THREE.MathUtils.lerp( this.currentFOV, minFOV, FOVChangeSpeed );
        }

        else {
            // increase movementSpeed and FOV is moving and sprinting
            if (this.sprint) {
                this.movementSpeed = this.runSpeed;
                this.currentFOV = THREE.MathUtils.lerp( this.currentFOV, maxFOV, FOVChangeSpeed );
            }
            
            // decrease FOV is moving but not sprinting
            else {
                this.currentFOV = THREE.MathUtils.lerp( this.currentFOV, minFOV, FOVChangeSpeed );
            }
        }

        // update camera FOV
        this.camera.fov = this.currentFOV
        this.camera.updateProjectionMatrix();
    }

    updatePlayerMotion(gameWorld) {
        // find direction camera is looking
        gameWorld.currentCamera.getWorldDirection( this.lookDirection );
        this.lookDirection.y = 0;
        this.lookDirection.normalize();

        // calculate direction of input
        this.inputDirection.x = Number( this.moveForward ) - Number( this.moveBackward );   // forward(1) / backward(-1)
        this.inputDirection.y = Number( this.moveRight )   - Number( this.moveLeft );       // right(1) / left(-1)
        this.inputDirection.normalize(); 

        // calculate forward and right vectors
        this.forwardVector = this.lookDirection;
        this.rightVector.crossVectors( this.forwardVector, new THREE.Vector3(0, 1, 0) );

        // handle sprinting logic
        this.sprintLogic(75, 90, 0.3);

        // calculate movementDirection
        this.movementDirection.set(0, 0, 0);
        this.movementDirection.addScaledVector( this.forwardVector, this.inputDirection.x );
        this.movementDirection.addScaledVector( this.rightVector, this.inputDirection.y );
        this.movementDirection.normalize();


        // scale movement according to movement speed
        this.scaledMovementDirection.copy(this.movementDirection).multiplyScalar(this.movementSpeed);


        // move player according to movement direction
        this.controller.setWalkDirection( 
            new Ammo.btVector3( this.scaledMovementDirection.x, 
                                this.scaledMovementDirection.y, 
                                this.scaledMovementDirection.z
                            ) 
        );

        // update player mesh position according to physics simulation
        this.ghostLocation = this.player.ghostObject.getWorldTransform().getOrigin();
        this.player.playerMesh.position.set(this.ghostLocation.x(), this.ghostLocation.y(), this.ghostLocation.z());

        // update camera location to player location
        gameWorld.currentCamera.position.set(
            this.ghostLocation.x(),
            this.ghostLocation.y() + (this.player.playerHeight / 2),
            this.ghostLocation.z()
        );
        
        // check if player is on ground to allow jumping
        this.canJump = (this.controller.onGround());  
    }
    
}






