import * as THREE from 'three';
import Level from '/js/levelManager.js'
import { MainMainMenu, LevelsMainMenu, SettingsMainMenu, ControlsMainMenu } from '/js/menus.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let AmmoLib;
let gltfLoader;
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

  let response = await fetch( url );

  return await response.text();

}

async function loadPackages() {

    [ AmmoLib, screenVertexShader, screenFragmentShader ] = await Promise.all([ Ammo(), 
                                                                                loadShader('/shaders/screen-vertex-shader.glsl'), 
                                                                                loadShader('/shaders/screen-fragment-shader.glsl') 
                                                                            ]);
    

    Ammo = AmmoLib;

}

async function loadTextures() {

    let textureLoader = new THREE.TextureLoader();

    textureFileNames.forEach( fileName => {

        let textureKey = fileName;
        let texturePath = `/assets/${ fileName }.png`;

        let texture = textureLoader.load(texturePath);

        // Performance-related settings
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 1;

        loadedTextures[ textureKey ] = texture;

        }
    );

}

async function awaitLoader( key, path ) {

    let GLTF = await gltfLoader.loadAsync( path );
    loadedGLTFs[ key ] = GLTF;

}

async function loadModels() {

    gltfLoader = new GLTFLoader();

    GLTFFileNames.forEach( fileName => {

        let GLTFKey = fileName;
        let GLTFPath = `/assets/${ fileName }.glb`;

        awaitLoader( GLTFKey, GLTFPath )

        }
    );

}

// load physics engine and show main menu
async function main() {
    
    loadPackages();
    loadTextures();
    loadModels();

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
