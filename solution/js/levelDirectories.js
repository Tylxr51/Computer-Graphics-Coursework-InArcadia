import createLevel0Scene from './level0Scene.js';
import createLevel1Scene from './level1Scene.js';


export const LEVEL_DIRECTORIES = {
    0: createLevel0Scene,
    1: createLevel1Scene
}
