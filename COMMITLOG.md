# Commit Log

#### 04.01.26

- Added some color variation in FloorPieces
- Started making scene for level1
- Implemented a dash cooldown
- Added a HUD with an element showing dash cooldown

#### 03.01.26

- Created spawn area with platform and door
- Created screen with custom vertex and fragment shaders
- updated in-game menus with buttons

#### 01.01.26

- Created a basic track for level 0 using FloorPiece objects
- Created a staircase class
- Tried to make level 0 object creation as clear and easy to read as possible
- Got rid of timer delay for respawn (wasn't needed)
- Tried to add double jump but would have been too complicated and isn't necessary

#### 31.12.25

(gonna try and make commits smaller from now on, 29.12.25 was way too big)
- Third person camera follows player
- Added dash mechanic
- Made a FloorPiece class that can easily create floor pieces for level design


#### 29.12.25

- Made a menu system where I moved the in-game menus to and added a main menu with settings and a level select
- Created a level class to handle level environments
- Created level loader and disposal functions to launch and exit levels without memory leaks
- Created global variables file to handle variables that can be changed in settings and variables that should span the whole application
- Added a debug mode
- Made the pause menu stop gameloop and then restart when exited.
- Added third person camera angle for platformer view
- Added an abort controller to remove all in-game listeners when level is exited
- Updated all listener functions by assigning all arrow functions to variables

#### 23.12.25

- Made a new player class that: creates a player, handles movement, binds the camera to the player.
- Added a jump mechanic.

#### 10.12.25

- Refactored code
- Created separate classes for world environment (cameras, scene, renderer, physics initialisation, etc.) and player controls (listeners, updating motion each frame, sprint, etc.)
- Trying to make main.js as simple as possible

#### 6.12.25

- Implemented Ammo.js
- Spawned a cube that drops from the sky and lands on the floor

#### 23.11.25

- WASD controls and sprint with different sprint settings (Hold, Basic Toggle, Stop Toggle). 
- FOV changing between sprint and walk. 
- Changed some lighting just to make it easy to see what was happening. 
- Disabled controls in menu screens.

#### 22.11.25
- Basic environment with floor and a cube
- Simple first person camera controls to look around
- Start menu and pause menu.