//////////// VARIABLES TO BE ACCESSED BY ALL FILES ////////////

let debug = false;               // set true for debug mode

let isFlickerOn = true;         // set default to true, can be changed in settings

let screenVertexShader;
let screenFragmentShader;

let isRectAreaLightUniformLibInit = false;

level0ColorHue = 0.6; // Color of floor pieces
level1ColorHue = 0.65; // Color of floor pieces

let gameInProgress;
let stopGameloop;
let levelIndex;
let currentLevelAbortController;
let currentLevelEnvironment;

let toggleSprint = true;        // set default to true, can be changed in settings
let stationaryIsToggle = true;

let dashCooldown = 0.5;

let userInputFOV = 75;          // set default value to 75, can be changed in settings
let walkFOV = userInputFOV;
let runFOV = walkFOV + 15;
let dashFOV = runFOV + 15;

let mouseControlsSensitivity = 0.7;

let textureFileNames = [
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

let loadedTextures = {};