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

function writeVariable( HTMLLocation, variable ) {
    if ( typeof(variable) == 'boolean' ) {
        variable = 'on'.repeat( Number( variable ) ) + 'off'.repeat( Number( !variable ) );
    }
    HTMLLocation.innerHTML = variable;
}