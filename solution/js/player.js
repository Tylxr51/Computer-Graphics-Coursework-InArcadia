import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js'; 
import { PlayerGLTF } from './objectSpawner.js'



// PURPOSE: Handles player objects such as physics body, wireframe mesh, and GLTF mesh, and has function for (re)spawning player
// USED BY: LevelManager
export default class Player {
    
    // Create player physics body, player wireframe mesh, and player GLTF mesh
    constructor(size, gameWorld) {

        this.playerIsDead = false;      // variable to track if player is dead for menu logic

        //////////// PLAYER PHYSICS ////////////

        this.gameWorld = gameWorld;     // define gameWorld

        // set up player physics shape
        this.playerRadius = size.x;
        this.playerHeight = size.y;
        this.playerShape = new Ammo.btCapsuleShape( this.playerRadius, this.playerHeight );

        this.maxStepHeight = 0.2;       // max height the player can step up onto

        this.transform = new Ammo.btTransform();      // set up player transform 

        // set up player ghost object
        this.ghostObject = new Ammo.btPairCachingGhostObject();
        this.ghostObject.setCollisionShape( this.playerShape );
        this.ghostObject.setCollisionFlags( Ammo.btCollisionObject.CF_CHARACTER_OBJECT ) ;     // lets physicsWorld know which objects this should collide with

        // set up player kinematic controller
        this.movementController = new Ammo.btKinematicCharacterController(
            this.ghostObject,
            this.playerShape,
            this.maxStepHeight
        );

        // add player ghost object to physics world for collision detection
        this.gameWorld.physicsWorld.addCollisionObject(
            this.ghostObject,
            Ammo.btBroadphaseProxy.CharacterFilter,
            Ammo.btBroadphaseProxy.StaticFilter | Ammo.btBroadphaseProxy.DefaultFilter
        );

        // set gravity for player controller
        this.movementController.setGravity( - 5 * this.gameWorld.gravityVector.y );       // multiply gravity for player to make jump less floaty



        ////////////// PLAYER WIREFRAME MESH ///////////////

        // set up wireframe capsule mesh to represent player (used for debugging purposes, set to transparent when debugger is off)
        const playerGeometry = new THREE.CapsuleGeometry( this.playerRadius, this.playerHeight, 2, 8, 1 );
        const playerWireframe = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );

        playerWireframe.transparent = !debug;          // make transparent if debug is on
        playerWireframe.opacity = Number( debug );     // have to set opacity to 0 as well to make it transparent

        this.playerMesh = new THREE.Mesh( playerGeometry, playerWireframe );



        ///////////////// PLAYER GLTF MESH /////////////////

        this.playerGLTFMesh = new PlayerGLTF( this.gameWorld );         // create player GLTF Model



        //////////// INITIALISE PLAYER CONTROLS ////////////

        // create playerControls
        this.playerControls = new PlayerControls( this, 
                                                  this.gameWorld.firstPersonCamera, 
                                                  this.gameWorld.renderer, 
                                                  this.movementController 
                                                );

    }


    // PURPOSE: Handles the cameras, scene, renderer, and physics simulation
    // USED BY: LevelManager.buildBackend() and DeadGameMenu.onRespawnButtonClick()
    spawnPlayer( isInitialSpawn, ammoPlayerSpawnPosition, ammoPlayerSpawnQuaternion ) {

        // set spawn position ( don't have to worry about orientation as ghost object never rotates, only camera )
        this.transform.setIdentity();
        this.transform.setOrigin( ammoPlayerSpawnPosition );

        // move ghost object according to spawn position and orientation
        this.ghostObject.setWorldTransform( this.transform );


        // set initial position and rotation of player mesh
        this.playerMesh.position.set(   ammoPlayerSpawnPosition.x(), 
                                        ammoPlayerSpawnPosition.y(), 
                                        ammoPlayerSpawnPosition.z()
                                    );
        this.playerMesh.quaternion.set( ammoPlayerSpawnQuaternion.x(), 
                                        ammoPlayerSpawnQuaternion.y(), 
                                        ammoPlayerSpawnQuaternion.z(), 
                                        ammoPlayerSpawnQuaternion.w()
                                    );


        // check if spawning for the first time
        if ( isInitialSpawn ) {

            // add player controller to physics world to enable movement
            this.gameWorld.physicsWorld.addAction( this.movementController );

            // add player mesh to scene
            this.gameWorld.scene.add( this.playerMesh );

        }

        // create a new document wide event to swap to first person camera on spawn
        document.dispatchEvent( new CustomEvent( 'spawn-set-first-person-camera' ) );

        this.playerIsDead = false;
        
    }


    // PURPOSE: Call playerControls disposal function, ammo garbage collection, and set variables to null
    // USED BY: levelManager.disposeLevel()
    disposePlayer() {

        this.playerControls.disposePlayerControls();    // dispose playerControls

        // destroy ammo variables
        Ammo.destroy( this.playerShape );
        Ammo.destroy( this.transform );
        Ammo.destroy( this.ghostObject );
        Ammo.destroy( this.movementController );

        // set variables to null
        this.gameWorld = null;
        this.playerControls = null;
        this.playerShape = null;
        this.transform = null;
        this.ghostObject = null;
        this.movementController = null;

    }

}


// PURPOSE: Handles inputs relating to player movement and mouse movement, calculates player motion, handles sprint and dash calculations, and can enable and disable movement 
// USED BY: Called by levelManager on level exit
class PlayerControls {

    // PURPOSE: initialise variables for player controls
    constructor( player, camera, renderer, movementController ) {

        // set up player, camera, renderer, controllers, and camera controls
        this.player = player;
        this.camera = camera
        this.renderer = renderer
        this.movementController = movementController;
        this.cameraController = new PointerLockControls( this.camera, this.renderer.domElement );
        
        // set camera control settings (avoid direction glitches by ensuring player can't look directly down or up)
        this.cameraController.minPolarAngle = 0.001; 
		this.cameraController.maxPolarAngle = Math.PI - 0.001;
        this.cameraController.pointerSpeed = 0.7;                   // sensitivity

        // set movement variables
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // set jump variable
        this.canJump = false;

        // set sprint and sprint settings variables
        this.sprint = false;

        // set dash variable
        this.dash = false;
        this.canDash = true;

        this.dashTimer = new THREE.Clock( false );
        this.dashTimer.elapsedTime = dashCooldown;

        // set fov variables
        this.currentFOV;
        this.FOVWalkRunChangeSpeed = 10;      // how quickly FOV changes when player starts/stops sprinting
        this.FOVDashChangeSpeed = 8;

        // set movement speed variables
        this.walkSpeed = 3;
        this.runSpeed = 1.7 * this.walkSpeed;
        this.dashSpeed = 10 * this.walkSpeed;
        this.currentDashSpeed = this.dashSpeed;

        this.movementSpeed = this.walkSpeed;

        // set jump speed
        this.jumpSpeed = 12
        this.movementController.setJumpSpeed( this.jumpSpeed );

        // set up direction vectors for calculating movement later
        this.dashDirection              = new THREE.Vector3(  0, 0, 0 );
        this.lookDirection              = new THREE.Vector3(  0, 0, 0 );
        this.inputDirection             = new THREE.Vector2(  0, 0    );
        this.forwardVector              = new THREE.Vector3(  0, 0, 0 );
        this.rightVector                = new THREE.Vector3(  0, 0, 0 );
        this.movementDirection          = new THREE.Vector3(  0, 0, 0 );
        this.scaledMovementDirection    = new THREE.Vector3(  0, 0, 0 );
        this.tmpScaledMovementDirection = new Ammo.btVector3( 0, 0, 0 );

    }

    // PURPOSE: Checks which movement key has been pressed down and updates variables accordingly
    // USED BY: keydown listener ( defined in turnOnMovement() )
    onKeyDown = ( event ) => {

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

            case 'KeyR':

                // if dash has not recharged yet, don't let dash start
                if ( this.canDash ) { this.startDash = true };

                break;

            // jump
            case 'Space':

                // check if player can jump
                 if ( this.canJump === true ) { 
                    
                    this.movementController.jump(); 

                    this.canJump = false;
                
                }

                 break;

            // sprint
            case 'ShiftLeft':

                // pressing shift key down turns on and off sprinting
                if ( toggleSprint && !stationaryIsToggle ) { this.sprint = !this.sprint; }

                // pressing shift key down only turns on sprinting, doesn't turn off sprinting
                else { this.sprint = true; }

                break;
        }
    }


    // PURPOSE: Checks which movement key has been released and updates variables accordingly
    // USED BY: keydown listener ( defined in turnOnMovement() )
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
                if ( !toggleSprint ) { this.sprint = false; }

                break;
        }
    }

    // PURPOSE: Disables player and camera movement by removing keydown and keyup listeners and setting mouse sensitivity to 0
    // USED BY: LevelManager.useFirstPersonCamera() and LevelManager.useThirdPersonCamera()
    turnOffMovement() {

        // remove movement listeners
        document.removeEventListener( 'keydown', this.onKeyDown );
        document.removeEventListener( 'keyup', this.onKeyUp );

        this.cameraController.pointerSpeed = 0;    // turn off mouse movement

        // stop movement
        this.moveForward = this.moveBackward = this.moveLeft = this.moveRight = false;
    }


    // PURPOSE: Enables player and camera movement by adding keydown and keyup listeners and setting mouse sensitivity to value defined in globalVariables.js
    // USED BY: LevelManager.useFirstPersonCamera() and LevelManager.useThirdPersonCamera()
    turnOnMovement() {

        // add movement listeners
        document.addEventListener( 'keydown', this.onKeyDown );
        document.addEventListener( 'keyup', this.onKeyUp );

        this.cameraController.pointerSpeed = mouseControlsSensitivity;    // turn on mouse movement

    }

    // PURPOSE: Handles dash logic - checks if player is starting a dash, dashing, or not dashing and calculates movement speed and FOV accordingly
    // USED BY: LevelManager.gameloop()
    dashLogic( delta ) {

        // initiate dash if key has just been pressed
        if ( this.startDash ) {

            // store direction so you dash in a straight line
            this.dashDirection.copy( this.lookDirection );

            // set to dash in progess
            this.dash = true;

            // set to false so dash is not continually initiated
            this.startDash = false;

            // start cooldown timer
            this.dashTimer.start();

        };

        // get value of cooldown timer each gameloop
        this.timeSinceDash = this.dashTimer.getElapsedTime();
        this.dashRechargeProgress =  THREE.MathUtils.clamp( ( this.timeSinceDash / dashCooldown ), 0, 1 ) * 100

        // set canDash to true only when dash has recharged
        if ( this.dashRechargeProgress < 100 ) { this.canDash = false }
        else { this.canDash = true };

        // if not dashing then return
        if ( !this.dash ) { return };
        
        // only increase fov for a short period so it feels like a short and quick acceleration
        if ( this.dashTimer.getElapsedTime() < 0.07 ) { this.currentFOV = THREE.MathUtils.lerp( this.camera.fov, dashFOV, 1 - Math.exp( - this.FOVDashChangeSpeed * delta ) ) };

        // set movement speed to dash speed
        this.movementSpeed = this.currentDashSpeed;

        // smoothly decrease dash speed back to normal
        this.currentDashSpeed = THREE.MathUtils.lerp( this.currentDashSpeed, this.walkSpeed, 1 - Math.exp( - delta ) );

        // set the movement direction to the dash direction that was stored at the start of the dash
        this.movementDirection.copy( this.dashDirection );

        // stops dash after amount of time has passed
        if ( this.timeSinceDash >= 0.1 ) {
            this.dash = false;
            this.currentDashSpeed = this.dashSpeed;
            this.movementSpeed = this.walkSpeed;
        }

    }


    // PURPOSE: Handles sprint logic - checks if player is sprinting or walking and calculates movement speed and FOV accordingly
    // USED BY: LevelManager.gameloop()
    sprintLogic( delta ) {

        // set default movementSpeed and get currentFOV
        this.movementSpeed = this.walkSpeed;

        // checks if the player was moving and has just stopped and disables sprint when stationaryIsToggle is on
        if ( this.inputDirection.length() === 0 && 
             this.scaledMovementDirection.length() !== 0 && 
             toggleSprint && 
             stationaryIsToggle ) {

                this.sprint = false;
        }

        // reduce FOV when stationary
        if ( this.scaledMovementDirection.length() === 0 ) {

            this.currentFOV = THREE.MathUtils.lerp( this.camera.fov, walkFOV, 1 - Math.exp( - this.FOVWalkRunChangeSpeed * delta ) );

        }

        else {

            // increase movementSpeed and FOV is moving and sprinting
            if ( this.sprint ) {

                this.movementSpeed = this.runSpeed;
                this.currentFOV = THREE.MathUtils.lerp( this.camera.fov, runFOV, 1 - Math.exp( - this.FOVWalkRunChangeSpeed * delta ) );

            }
            
            // decrease FOV is moving but not sprinting
            else {

                this.currentFOV = THREE.MathUtils.lerp( this.camera.fov, walkFOV, 1 - Math.exp( - this.FOVWalkRunChangeSpeed * delta ) );
            
            }

        }

    }


    // PURPOSE: Updates player motion - gets lookDirection and inputDirection, calls sprintLogic() and dashLogic() to set movementSpeed, and
    //          sets player walkDirection, updates FOV according to sprintLogic and dashLogic, updates player wireframe material and player GLTF mesh
    //          and updates thirdPersonCamera location
    // USED BY: LevelManager.gameloop()
    updatePlayerMotion( gameWorld, delta ) {
        
        // get FOV
        this.currentFOV = this.camera.fov;
        
        // find direction camera is looking
        gameWorld.firstPersonCamera.getWorldDirection( this.lookDirection );
        this.lookDirection.y = 0;
        this.lookDirection.normalize();
        
        // calculate direction of input
        this.inputDirection.x = Number( this.moveForward ) - Number( this.moveBackward );   // forward(1) / backward(-1)
        this.inputDirection.y = Number( this.moveRight )   - Number( this.moveLeft );       // right(1) / left(-1)
        this.inputDirection.normalize(); 
        
        // calculate forward and right vectors
        this.forwardVector = this.lookDirection;
        this.rightVector.crossVectors( this.forwardVector, new THREE.Vector3( 0, 1, 0 ) );
        
        
        // handle sprinting logic
        this.sprintLogic( delta );
        
        // calculate movementDirection
        this.movementDirection.set(0, 0, 0);
        this.movementDirection.addScaledVector( this.forwardVector, this.inputDirection.x );
        this.movementDirection.addScaledVector( this.rightVector, this.inputDirection.y );
        this.movementDirection.normalize();
        
        // handle dash logic
        this.dashLogic( delta );
        
        // scale movement according to movement speed
        this.scaledMovementDirection.copy( this.movementDirection ).multiplyScalar( this.movementSpeed * delta );
        this.tmpScaledMovementDirection.setValue( this.scaledMovementDirection.x, 
            this.scaledMovementDirection.y, 
            this.scaledMovementDirection.z
        );

        
        // move player according to movement direction
        this.movementController.setWalkDirection( this.tmpScaledMovementDirection );
        

        // update camera FOV
        this.camera.fov = this.currentFOV
        this.camera.updateProjectionMatrix();

        // update player mesh position according to physics simulation
        this.ghostLocation = this.player.ghostObject.getWorldTransform().getOrigin();
        this.player.playerMesh.position.set( this.ghostLocation.x(), 
                                             this.ghostLocation.y(), 
                                             this.ghostLocation.z() 
                                            );

        // update player GLTF mesh position according to physics simulation
        this.player.playerGLTFMesh.updatePlayerGLTFMeshLocation( this.lookDirection, [ this.ghostLocation.x(), this.ghostLocation.y(), this.ghostLocation.z() ] )

        // update camera location to player location
        gameWorld.firstPersonCamera.position.set( this.ghostLocation.x(),
                                                  this.ghostLocation.y() + (this.player.playerHeight / 2),
                                                  this.ghostLocation.z()
                                                );

        gameWorld.thirdPersonCamera.position.set( this.ghostLocation.x(),
                                                  this.ghostLocation.y() + ( this.player.playerHeight / 2),
                                                  gameWorld.thirdPersonCameraDistanceFromScene
                                                );
        gameWorld.thirdPersonCamera.lookAt( this.ghostLocation.x(),
                                            gameWorld.thirdPersonCamera.position.y - 0.1,
                                            0
                                          );
        
        // check if player is on ground to allow jumping
        this.canJump = ( this.movementController.onGround() );  
    }


    // PURPOSE: Unlock user cursor, dispose of camera controls, set variables to null, ammo garbage disposal, and turn off movement ( removes movement listeners )
    // USED BY: Player.disposePlayer()
    disposePlayerControls() {

        this.turnOffMovement();             // remove movement listeners
        
        // set variables to null
        this.player = null;
        this.camera = null;
        this.renderer = null;
        this.movementController = null;
        this.cameraController.unlock();     // unlock player cursor
        this.cameraController.dispose();    // removes pointer lock listeners
        this.cameraController = null;

        this.lookDirection = null;
        this.inputDirection = null;
        this.forwardVector = null;
        this.rightVector = null;
        this.movementDirection = null;
        this.scaledMovementDirection = null;

        Ammo.destroy(this.tmpScaledMovementDirection);
        this.tmpScaledMovementDirection = null;

    }
    
}






