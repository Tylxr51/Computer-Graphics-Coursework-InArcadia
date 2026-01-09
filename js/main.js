import Level from '/js/levelEnvironment.js'
import { MainMainMenu, LevelsMainMenu, SettingsMainMenu, ControlsMainMenu } from '/js/menus.js'


let AmmoLib
let mainMenu;
let levelsMenu;
let settingsMenu;
let controlsMenu;






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


async function loadShader( url ) {

  const response = await fetch( url );

  return await response.text();

}

async function loadPackages() {

    [ AmmoLib, screenVertexShader, screenFragmentShader ] = await Promise.all([ Ammo(), 
                                                                                loadShader('/shaders/screen-vertex-shader.glsl'), 
                                                                                loadShader('/shaders/screen-fragment-shader.glsl') 
                                                                            ]);
    

    Ammo = AmmoLib;
    
}

// load physics engine and show main menu
async function main() {
    
    loadPackages();

    document.body.style.margin = '0';       // remove borders around canvas

    // initialise main menus
    controlsMenu = new ControlsMainMenu( 'controls-menu' )
    settingsMenu = new SettingsMainMenu( 'settings-menu' );
    levelsMenu = new LevelsMainMenu( 'levels-menu' );
    mainMenu = new MainMainMenu( 'main-menu', levelsMenu, settingsMenu, controlsMenu );

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
