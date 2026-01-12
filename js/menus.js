function writeVariable( HTMLLocation, variable ) {
    if ( typeof(variable) == 'boolean' ) {
        variable = 'on'.repeat( Number( variable ) ) + 'off'.repeat( Number( !variable ) );
    }
    HTMLLocation.innerHTML = variable;
}


// base class for menu screens
class Menu {
    
    // get menu screen location from index.html and make a back button function
    constructor ( menuHTMLName ) {
        this.menu = document.getElementById( menuHTMLName );
        this.onBackClick = () => this.hideMenu();
    }

    // menu display functions
    showMenu() {
        this.menu.style.display = 'flex';      //  show menu
    }

    hideMenu() {
        this.menu.style.display = 'none';      //  hide menu
    }

    exitLevel() {
        document.dispatchEvent( new CustomEvent( 'exit-level' ) );      // send signal to end level to level manager
    }

}


// main menu class using base menu class
export class MainMainMenu extends Menu {

    constructor ( menuHTMLName, levelsMenu, settingsMenu, controlsMenu ) {
        
        // get menu screen location, back button function, and show/hide functions
        super( menuHTMLName );

        // get menu button locations
        this.levelsButton = document.getElementById( 'levels-button' );
        this.controlsButton = document.getElementById( 'controls-button' );
        this.settingsButton = document.getElementById( 'settings-button' );

        // define button click functions
        this.onLevelsButtonClick = () => levelsMenu.showMenu();
        this.onControlsButtonClick = () => controlsMenu.showMenu();
        this.onSettingsButtonClick = () => settingsMenu.showMenu();
        
        // make listeners for button clicks
        this.levelsButton.addEventListener( 'click', this.onLevelsButtonClick );
        this.controlsButton.addEventListener( 'click', this.onControlsButtonClick );
        this.settingsButton.addEventListener( 'click', this.onSettingsButtonClick );
    }
}


// levels menu class using base menu class
export class LevelsMainMenu extends Menu {

    constructor ( menuHTMLName ) {

        // get menu screen, back button function, and show/hide functions
        super ( menuHTMLName );

        // get menu button locations
        this.level0Button = document.getElementById('level-0-button');
        this.level1Button = document.getElementById('level-1-button');
        this.backButton   = document.getElementById('levels-back-button');

        // define button click functions
        this.onLevel0Click = () => this.selectLevel(0);
        this.onLevel1Click = () => this.selectLevel(1);

        // make listeners for button clicks
        this.level0Button.addEventListener('click', this.onLevel0Click);
        this.level1Button.addEventListener('click', this.onLevel1Click);
        this.backButton.addEventListener('click', this.onBackClick);
    }

    // function to hide menu and launch given level
    selectLevel = (levelIndex) => {
        this.hideMenu()
        document.dispatchEvent(new CustomEvent('launch-level', {detail: {level: levelIndex}}));
    }
}


export class ControlsMainMenu extends Menu {

    constructor ( menuHTMLName ) {
        
        // get menu screen location, back button function, and show/hide functions
        super( menuHTMLName );

        // get menu button locations
        this.backButton = document.getElementById('controls-back-button');

        // define button click functions
        
        // make listeners for button clicks
        this.backButton.addEventListener('click', this.onBackClick);
    }
}


// settings menu class using base menu class
export class SettingsMainMenu extends Menu {

    constructor ( menuHTMLName ) {

        // get menu screen, back button function, and show/hide functions
        super ( menuHTMLName );

        // get variable write locations
        this.HTMLToggleSprintVariableLocation = document.getElementById( 'toggle-sprint-value' );
        this.HTMLStationaryIsToggleVariableLocation = document.getElementById( 'stationary-is-toggle-value' );
        this.HTMLIsFlickerOnVariableLocation = document.getElementById( 'is-flicker-on-value' );
        this.HTMLDebugVariableLocation = document.getElementById( 'toggle-debug-value' );

        // write variable states on initilisation
        writeVariable( this.HTMLToggleSprintVariableLocation, toggleSprint );
        writeVariable( this.HTMLStationaryIsToggleVariableLocation, stationaryIsToggle );
        writeVariable( this.HTMLIsFlickerOnVariableLocation, isFlickerOn );
        writeVariable( this.HTMLDebugVariableLocation, debug );

        // get menu button locations
        this.toggleSprintButton = document.getElementById( 'toggle-sprint-button' );
        this.stationaryIsToggleButton = document.getElementById( 'stationary-is-toggle-button' );
        this.isFlickerOnButton = document.getElementById( 'is-flicker-on-button' );
        this.debugButton = document.getElementById( 'toggle-debug-button' );
        this.backButton = document.getElementById( 'settings-back-button' );

        // define button click functions
        this.onToggleSprintButtonClick = () => {

            toggleSprint = !toggleSprint;
            writeVariable( this.HTMLToggleSprintVariableLocation, toggleSprint );

        }

        this.onStationaryIsToggleButtonClick = () => {

            stationaryIsToggle = !stationaryIsToggle;
            writeVariable( this.HTMLStationaryIsToggleVariableLocation, stationaryIsToggle );

        }

        this.onIsFlickerOnButtonClick = () => {

            isFlickerOn = !isFlickerOn;
            writeVariable( this.HTMLIsFlickerOnVariableLocation, isFlickerOn );

        }

        this.onDebugButtonClick = () => {

            debug = !debug;
            writeVariable( this.HTMLDebugVariableLocation, debug );

        }

        // make listeners for button clicks
        this.toggleSprintButton.addEventListener( 'click', this.onToggleSprintButtonClick );
        this.stationaryIsToggleButton.addEventListener( 'click', this.onStationaryIsToggleButtonClick );
        this.isFlickerOnButton.addEventListener( 'click', this.onIsFlickerOnButtonClick );
        this.debugButton.addEventListener( 'click', this.onDebugButtonClick );
        this.backButton.addEventListener( 'click', this.onBackClick );

    }
}


// instructions menu class using base menu class
export class InstructionsGameMenu extends Menu {

    constructor( menuHTMLName, player, abortController ) {

        // get menu screen, back button function, and show/hide functions
        super( menuHTMLName );

        // define menu click function
        this.onInstructionsGameMenuClick = () => {

            this.hideMenu();                                // hide instructions menu
            player.playerControls.turnOnMovement();         // enable player movement
            player.playerControls.cameraController.lock();  // lock user cursor
        }

        // make listener for menu screen click
        this.menu.addEventListener( 'click', this.onInstructionsGameMenuClick, { signal: abortController.signal });

    }
}

// pause menu class using base menu class
export class PauseGameMenu extends Menu {

    constructor( menuHTMLName, player, abortController ) {

        // get menu screen, back button function, and show/hide functions
        super( menuHTMLName );
        
        // define variables to track current camera
        this.currentCameraIndex;
        this.firstPersonCameraIndex = 0;
        this.thirdPersonCameraIndex = 1;
        
        this.unpauseDelayTime = 1200;       // delay when trying to unlock for browser security error

        this.HTMLResumeStatusLocation = document.getElementById( 'resume-status' );


        // define menu click function
        this.onResumeButtonClick = () => {
            
            // display 'Resuming...' below button so user know the button has been pressed
            writeVariable( this.HTMLResumeStatusLocation, 'Resuming...' );

            // timer delay to prevent immediate relocking error
            setTimeout( () => {

                this.hideMenu();            // hide pause menu

                // get rid of 'Resuming...' for next time menu is opened
                writeVariable( this.HTMLResumeStatusLocation, '' );

                if (this.currentCameraIndex === this.firstPersonCameraIndex){ 
                    player.playerControls.turnOnMovement();      //  only enable player movement if using first person camera
                }

                player.playerControls.cameraController.lock();   // lock user cursor

                gameInProgress = true;          // restart game loop

                // add on the dash recharge from before the cooldown was stopped and start cooldown again
                this.storedDashTime = player.playerControls.dashTimer.elapsedTime;
                player.playerControls.dashTimer.start();
                player.playerControls.dashTimer.elapsedTime = this.storedDashTime;

            }, this.unpauseDelayTime );
        }

        this.onExitGamePausedButtonClick = () => { this.exitLevel() }

        // make listeners for button clicks
        this.resumeButton = document.getElementById( 'resume-button' );
        this.exitGameButton = document.getElementById( 'exit-game-paused-button' );

        this.resumeButton.addEventListener('click', this.onResumeButtonClick, { signal: abortController.signal } );
        this.exitGameButton.addEventListener('click', this.onExitGamePausedButtonClick, { signal: abortController.signal } );
        
    }

    // getter function to update currentCameraIndex
    getCurrentCamera( currentCameraIndex ){
        this.currentCameraIndex = currentCameraIndex;
    }
}

// dead menu class using base menu class
export class DeadGameMenu extends Menu {

    constructor( menuHTMLName, player, abortController, isInitialSpawn, ammoPlayerSpawnPosition, ammoPlayerSpawnQuaternion ) {

        // get menu screen, back button function, and show/hide functions
        super( menuHTMLName );

        // define menu click function (no timer needed as controls unlocked by game not user)
        this.onRespawnButtonClick = () => {

            this.hideMenu();                                // hide dead menu
            player.playerControls.turnOnMovement();         // enable player movement
            player.playerControls.cameraController.lock();  // lock user cursor
            player.spawnPlayer(isInitialSpawn, ammoPlayerSpawnPosition, ammoPlayerSpawnQuaternion);     // spawn player

            gameInProgress = true;          // restart game loop

        }

        this.onExitGameDeadButtonClick = () => { this.exitLevel() }


        this.resumeButton = document.getElementById( 'respawn-button' );
        this.exitGameButton = document.getElementById( 'exit-game-dead-button' );

        this.resumeButton.addEventListener('click', this.onRespawnButtonClick, { signal: abortController.signal } );
        this.exitGameButton.addEventListener('click', this.onExitGameDeadButtonClick, { signal: abortController.signal } );
    }
}

// level complete menu class using base menu class
export class LevelCompleteGameMenu extends Menu {

    constructor( menuHTMLName, player, abortController, isInitialSpawn, ammoPlayerSpawnPosition, ammoPlayerSpawnQuaternion ) {

        // get menu screen, back button function, and show/hide functions
        super( menuHTMLName );

        this.onExitGameDeadButtonClick = () => { this.exitLevel() }

        this.exitGameButton = document.getElementById( 'exit-game-complete-button' );

        this.exitGameButton.addEventListener('click', this.onExitGameDeadButtonClick, { signal: abortController.signal } );
    }
}

export class HUD {

    constructor( classHTMLName ) {

        this.dash = document.querySelector( classHTMLName );
        this.progressBarChargedColor = '#68ef93';
        this.progressBarChargingColor = '#e87373';

    }

    updateDashProgress( amount ) {

        this.dash.style.setProperty('--progress', amount );

        if (amount == 100) { this.dash.style.setProperty('--progress-bar-color', this.progressBarChargedColor )}
        else { this.dash.style.setProperty('--progress-bar-color', this.progressBarChargingColor  )}

    }

    showHUD() {

        this.dash.style.opacity = '1';

    }

    hideHUD() {

        this.dash.style.opacity = '0';

    }



}