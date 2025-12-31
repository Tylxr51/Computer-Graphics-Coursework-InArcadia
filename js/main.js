import * as THREE from '/three.js-r170/build/three.module.js'; 
import OverheadLights from '/js/lighting.js';  
import { RigidBody } from '/js/objectSpawner.js'
import Level from '/js/levelEnvironment.js'
import { MainMainMenu, LevelsMainMenu, SettingsMainMenu } from '/js/menus.js'


let mainMenu;
let levelsMenu;
let settingsMenu;






function launchLevel() {

    mainMenu.hideMenu();        // hide main menu
    
    currentLevelAbortController = new AbortController()                         // object to remove all in-game listeners

    currentLevelEnvironment = new Level( levelIndex, currentLevelAbortController );         // create level environment

    gameInProgress = true;      // change game state variable
    stopGameloop = false;



    currentLevelEnvironment.gameloop();                // start gameloop
}

// function called on exiting level
function exitLevel() {

    stopGameloop = true;
    gameInProgress = false;         // change game state variable

    currentLevelEnvironment.disposeLevel();     // dispose current level
    currentLevelEnvironment = null;

    
    mainMenu.showMenu();            // show main menu

}


// load physics engine and show main menu
async function main() {

    // load ammo
    const AmmoLib = await Ammo();
    Ammo = AmmoLib;

    document.body.style.margin = '0';       // remove borders around canvas

    // initialise main menus
    settingsMenu = new SettingsMainMenu( 'settings-menu' );
    levelsMenu = new LevelsMainMenu( 'levels-menu' );
    mainMenu = new MainMainMenu( 'main-menu', levelsMenu, settingsMenu );

    // function called on level selection
    let onLaunchLevel = ( e ) => {

        levelIndex = e.detail.level;
        launchLevel();

    }
    let onExitLevel = () => { exitLevel(); }        // function called on level exit

    // make listeners
    document.addEventListener( 'launch-level', onLaunchLevel );     // launch level listener
    document.addEventListener( 'exit-level', onExitLevel );         // exit level listener
    
    gameInProgress = false;             // change game state variable
    stopGameloop = true;

    mainMenu.showMenu();                // show main menu

}

// Load and launch into main menu
main();
