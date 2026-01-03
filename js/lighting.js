import * as THREE from 'three';

export default class OverheadLights {
    constructor() {
        this.light1 = new THREE.SpotLight(0xffffff, 1000000);
        this.light1.position.set(0, 100, 0);
        this.light1.castShadow = true;
    }
}