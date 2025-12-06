import * as THREE from '/three.js-r170/build/three.module.js';

export class RigidBody {
    constructor() {
    }

    createBox(size, mass, position, quaternion) {
        this.transform = new Ammo.btTransform();
        this.transform.setIdentity();
        this.transform.setOrigin( new Ammo.btVector3( position.x, position.y, position.z) );
        this.transform.setRotation( new Ammo.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w) );
        this.motionState = new Ammo.btDefaultMotionState( this.transform );

        const btSize = new Ammo.btVector3( size.x * 0.5, size.y * 0.5, size.z * 0.5 );
        this.shape = new Ammo.btBoxShape( btSize );
        this.shape.setMargin( 0.05 );

        this.intertia = new Ammo.btVector3( 0, 0, 0 );
        if (mass > 0) {
            this.shape.calculateLocalInertia( mass, this.intertia );
        }

        this.info = new Ammo.btRigidBodyConstructionInfo( 
            mass, 
            this.motionState, 
            this.shape, 
            this.intertia );
        this.body = new Ammo.btRigidBody( this.info );

        Ammo.destroy( btSize );
    }
}
