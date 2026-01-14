import * as THREE from 'three';
import LevelManager from './levelManager.js'
import { MainMainMenu, LevelsMainMenu, SettingsMainMenu, ControlsMainMenu } from './menus.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


// variables to be populated later
let gltfLoader;

let currentLevelAbortController;
let currentLevelManager;

let mainMenu;
let levelsMenu;
let settingsMenu;
let controlsMenu;


// PURPOSE: Hide main menu, initialise levelManager
// USED BY: Launch level listener (defined in main())
function launchLevel() {

    mainMenu.hideMenu();        // hide main menu
    
    currentLevelAbortController = new AbortController()         // object to remove all in-game listeners

    currentLevelManager = new LevelManager( levelIndex, currentLevelAbortController );         // create level manager

    // change game state variables
    gameInProgress = true;      
    stopGameloop = false;

    currentLevelManager.gameloop();         // start gameloop

}


// PURPOSE: Stop gameloop, dispose of current level, and return to main menu
// USED BY: Exit level listener (defined in main())
function exitLevel() {

    // change game state variables
    stopGameloop = true;
    gameInProgress = false;

    currentLevelManager.disposeLevel();         // dispose current level
    currentLevelManager = null;
    
    mainMenu.showMenu();            // show main menu

}


// PURPOSE: Load shader from path and append to loadedShaders
// USED BY: loadShaders()
async function awaitShaderFetcher( key, path ) {

    const shader = await fetch( path );
    loadedShaders[ key ] = await shader.text();

}


// PURPOSE: Iterate through list of shaders to load and call load function for each one
// USED BY: loadPackages()
async function loadShaders( url ) {

    shaderFileNames.forEach( fileName => {

        const shaderKey = fileName;
        const shaderPath = `/assets/shaders/${ fileName }.glsl`;

        awaitShaderFetcher( shaderKey, shaderPath );
    })

}


// PURPOSE: Load GLTF from path and append to loadedGLTFs
// USED BY: loadModels()
async function awaitModelLoader( key, path ) {

    const GLTF = await gltfLoader.loadAsync( path );
    loadedGLTFs[ key ] = GLTF;

}


// PURPOSE: Iterate through list of models to load and call load function for each one
// USED BY: loadPackages()
async function loadModels() {

    gltfLoader = new GLTFLoader();

    GLTFFileNames.forEach( fileName => {

        const GLTFKey = fileName;
        const GLTFPath = `/assets/models/glb_files/${ fileName }.glb`;

        awaitModelLoader( GLTFKey, GLTFPath )

        }
    );

}


// PURPOSE: Iterate through list of textures to load, load each one and append to loadedTextures
// USED BY: loadPackages()
async function loadTextures() {

    let textureLoader = new THREE.TextureLoader();

    textureFileNames.forEach( fileName => {

        const textureKey = fileName;
        const texturePath = `/assets/textures/png_files/${ fileName }.png`;

        const texture = textureLoader.load(texturePath);

        // Performance-related settings
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = 1;

        loadedTextures[ textureKey ] = texture;

        }
    );

}


// PURPOSE: Load Ammo physics engine
// USED BY: loadPackages()
async function loadAmmo() {

    let AmmoLib = await Ammo();
    Ammo = AmmoLib;

}


// PURPOSE: Load physics engine, shaders, textures, 3D models
// USED BY: main()
async function loadPackages() {

    loadAmmo();
    loadTextures();
    loadModels();
    loadShaders();

}


// PURPOSE: Calls loading functions, initialises menus, and shows main menu
// USED BY: Entry point of main.js
async function main() {
    
    loadPackages();                         // load packages (assets, physics engine)

    document.body.style.margin = '0';       // remove borders around canvas

    // initialise main menus
    controlsMenu = new ControlsMainMenu( 'controls-menu' )
    settingsMenu = new SettingsMainMenu( 'settings-menu' );
    levelsMenu = new LevelsMainMenu( 'levels-menu' );
    mainMenu = new MainMainMenu( 'main-menu', levelsMenu, settingsMenu, controlsMenu );

    // function called on level selection
    const onLaunchLevel = ( e ) => {

        levelIndex = e.detail.level;
        launchLevel();

    }
    
    const onExitLevel = () => { exitLevel(); }        // function called on level exit

    // make level start and level exit listeners
    document.addEventListener( 'launch-level', onLaunchLevel );     // launch level listener
    document.addEventListener( 'exit-level', onExitLevel );         // exit level listener
    
    // game state variables
    gameInProgress = false;
    stopGameloop = true;

    mainMenu.showMenu();                // show main menu
    
}


// Load and launch into main menu
main();
