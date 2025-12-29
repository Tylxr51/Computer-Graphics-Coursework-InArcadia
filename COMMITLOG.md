# Commit Log

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