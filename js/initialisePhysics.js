export default function initPhysics(physicsWorld, tmpTransform, gravityVector) {
    // Physics configuration would go here

    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration );
    const broadphase = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    physicsWorld = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
    
    physicsWorld.setGravity( new Ammo.btVector3(gravityVector.x, gravityVector.y, gravityVector.z) );
    tmpTransform = new Ammo.btTransform();

    return physicsWorld, tmpTransform
}