import * as THREE from '/three.js-r170/build/three.module.js';

export default class OverheadLights {
    constructor() {
        this.light1 = new THREE.SpotLight(0xffffff, 100);
        this.light1.position.set(0, 5, 0);
        this.light1.castShadow = true;
    }
}