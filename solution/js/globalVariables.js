//////////// VARIABLES TO BE ACCESSED BY ALL FILES ////////////

let debug = false;                              // set true for debug mode ( shows trigger platforms, player wireframe, light helpers)

let isFlickerOn = true;                         // set default to true, can be changed in settings

let isRectAreaLightUniformLibInit = false;      // so RectAreaLightUniformLib is only initialised once

const colorHueList = { 0 : 0.6,
                       1 : 0.65
                     }

let gameInProgress;
let stopGameloop;

let levelIndex;

let isPlayerGLTFInit = false;                   // so playerGLTF is only initialised once

let toggleSprint = true;                        // set default to true, can be changed in settings
let stationaryIsToggle = true;                  // set default to true, can be changed in settings

const dashCooldown = 0.5;                       // dash cooldown time set here

let userInputFOV = 75;                          // set default value to 75
let walkFOV = userInputFOV;
let runFOV = walkFOV + 15;
let dashFOV = runFOV + 15;

let mouseControlsSensitivity = 0.7;             // mouse sensitivity set here

// textures to load on startup
const textureFileNames = [
    'image_on_screen',
    'press_space_to_jump',
    'wasd',
    'space_+_w',
    'hold_shift_to_sprint',
    'press_shift_to_sprint',
    'press_r_to_dash',
    'dash_arrows',
    'press_t_to_switch_cameras',
    'tube_skull_and_crossbones',
    'tube_spikes',
    'the_maze',
    'straight_arrow',
    'nothing_down_here',
    'arcing_arrow_left',
    'arcing_arrow_right',
    'if_only_camera_angle'
];

// shaders to load on startup
const shaderFileNames = [
    'screen-fragment-shader',
    'screen-vertex-shader'
];

// GLTFs to load on startup
const GLTFFileNames = [
    'player_character'
];

// loaded asset references
const loadedTextures = {};
const loadedShaders = {};
const loadedGLTFs = {};