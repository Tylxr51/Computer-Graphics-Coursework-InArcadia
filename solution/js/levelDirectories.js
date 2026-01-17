import { createLevel0Scene, createLevel0FloorMesh } from './level0Scene.js';
import { createLevel1Scene, createLevel1FloorMesh } from './level1Scene.js';


// PURPOSE: Hold level scene creator functions
// USED BY: LevelManager.chooseLevelScene()
export const LEVEL_DIRECTORIES = {

    0: createLevel0Scene,
    1: createLevel1Scene

}

// PURPOSE: Hold floor mesh creator functions
// USED BY: FloorPiece.createFloorMesh()
export const FLOOR_MESH_CREATOR_DIRECTORIES = {

    0: createLevel0FloorMesh,
    1: createLevel1FloorMesh

}
