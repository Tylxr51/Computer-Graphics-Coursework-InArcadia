import * as THREE from '/three.js-r170/build/three.module.js';

export default class Floor {
    constructor() {
        const floorGeometry = new THREE.PlaneGeometry(30, 10);
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        this.mesh = new THREE.Mesh(floorGeometry, floorMaterial);
        this.mesh.rotation.x = - Math.PI / 2;
        this.mesh.position.x = -9
    }
}