

import * as CANNON from 'cannon-es';
import * as THREE from 'three';

// 0. create basic platform
export function createLargePlatform(world, scene, physicsObjects) {
    const platformMaterial = new CANNON.Material({ friction: 0, restitution: 0.2 });
    const platformShape = new CANNON.Box(new CANNON.Vec3(20, 0.05, 20)); 
    const platformBody = new CANNON.Body({
        mass: 0,
        shape: platformShape,
        material: platformMaterial
    });
    platformBody.position.set(0, -0.1, 0); 

    const platformGeometry = new THREE.BoxGeometry(40, 0.1, 40); 
    const platformMeshMaterial = new THREE.MeshPhongMaterial({ color: 0x777777 }); 
    const platformMesh = new THREE.Mesh(platformGeometry, platformMeshMaterial);
    platformMesh.position.copy(platformBody.position);
    platformMesh.receiveShadow = true;

    scene.add(platformMesh);
    world.addBody(platformBody);
    physicsObjects.push({ mesh: platformMesh, body: platformBody });
}


// 1. create ground
export function createGround(world, scene, physicsObjects) {
    const groundMaterial = new CANNON.Material({ friction: 0, restitution: 0.7 });
    const groundShape = new CANNON.Box(new CANNON.Vec3(7.5, 0.05, 7.5)); // Half-court basketball dimensions
    const groundBody = new CANNON.Body({
        mass: 0,
        shape: groundShape,
        material: groundMaterial
    });
    groundBody.position.set(0, 0, 0);
    const groundGeometry = new THREE.BoxGeometry(15, 0.1, 15);
    const groundTexture = new THREE.TextureLoader().load('../textures/basketball_court.png');
    const groundMeshMaterial = new THREE.MeshPhongMaterial({ map: groundTexture });
    const groundMesh = new THREE.Mesh(groundGeometry, groundMeshMaterial);
    scene.add(groundMesh);
    world.addBody(groundBody);
    groundMesh.receiveShadow = true;

    physicsObjects.push({ mesh: groundMesh, body: groundBody });
}

// 2. create walls
export function createWalls(world, scene, physicsObjects) {
    // Common material for walls' physics simulation
    const wallMaterial = new CANNON.Material({ friction: 0.3, restitution: 0.8 });

    // Common texture for side walls
    const sideWallTexture = new THREE.TextureLoader().load('../textures/woodwall.png');
    const sideWallMaterial = new THREE.MeshPhongMaterial({ map: sideWallTexture });

    // Helper function to create individual wall segment
    function createWallSegment(position, scale, material) {
        const geometry = new THREE.BoxGeometry(scale.x * 2, scale.y * 2, scale.z * 2);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position.x, position.y, position.z);
        scene.add(mesh);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        const shape = new CANNON.Box(new CANNON.Vec3(scale.x, scale.y, scale.z));
        const body = new CANNON.Body({
            mass: 0, // Walls are static
            shape: shape,
            material: wallMaterial
        });
        body.position.copy(position);
        world.addBody(body);

        physicsObjects.push({ mesh: mesh, body: body });
    }

    // Creating walls
    // Left wall
    createWallSegment(new CANNON.Vec3(-7.5, 4, 0), new CANNON.Vec3(0.1, 4, 7.5), sideWallMaterial);
    // Right wall top part
    createWallSegment(new CANNON.Vec3(7.5, 6, 0), new CANNON.Vec3(0.1, 2, 7.5), sideWallMaterial);
    // Right wall bottom part
    createWallSegment(new CANNON.Vec3(7.5, 2, 2), new CANNON.Vec3(0.1, 2, 5.5), sideWallMaterial);
    // Back wall uses a different material to demonstrate how to switch materials if needed
    const backWallTexture = new THREE.TextureLoader().load('../textures/stonewall.png');
    const backWallMaterial = new THREE.MeshPhongMaterial({ map: backWallTexture });
    createWallSegment(new CANNON.Vec3(0, 4, -7.5), new CANNON.Vec3(7.5, 4, 0.1), backWallMaterial);
}

// 3. create basketball
export function createBasketball(world, scene, physicsObjects) {
    const ballMaterial = new CANNON.Material({ friction: 0.1, restitution: 0.8 });
    const ballShape = new CANNON.Sphere(0.3); // Standard basketball radius
    const ballBody = new CANNON.Body({
        mass: 0.6, // The mass for the basketball
        shape: ballShape,
        material: ballMaterial
    });

    const positionYs = [
        2,
        2.3,
        2.6,
        3,
        3.3,
    ];

    const randomY = positionYs[Math.floor(Math.random() * positionYs.length)];

    ballBody.position.set(0, randomY, 3);
    const ballGeometry = new THREE.SphereGeometry(0.3, 32, 32); // Standard basketball radius
    const ballTexture = new THREE.TextureLoader().load('../textures/basketball.png');
    const ballMeshMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });
    const ballMesh = new THREE.Mesh(ballGeometry, ballMeshMaterial);
    ballMesh.receiveShadow = true
    ballMesh.castShadow = true

    // Sync the mesh position and rotation with the Cannon.js body
    ballMesh.position.copy(ballBody.position);
    ballMesh.quaternion.copy(ballBody.quaternion);

    // Add the mesh to the scene and the body to the world
    scene.add(ballMesh);
    world.addBody(ballBody);

    // Push the basketball entities to the physicsObjects array for further tracking
    physicsObjects.push({ mesh: ballMesh, body: ballBody });

    // Return the mesh and body for further manipulation if needed
    return { mesh: ballMesh, body: ballBody };
}

// 4. create a support platform
export function createSupportPlatform(world, scene, physicsObjects) {
    const platformMaterial = new CANNON.Material({ friction: 0.4, restitution: 0 });
    const platformShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 0.5));
    const platformBody = new CANNON.Body({
        mass: 0, // Static body
        material: platformMaterial
    });
    platformBody.addShape(platformShape);
    platformBody.position.set(0, 1.9, 3);

    const platformGeometry = new THREE.BoxGeometry(1, 0.2, 1);
    const platformMeshMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
    const platformMesh = new THREE.Mesh(platformGeometry, platformMeshMaterial);
    platformMesh.position.copy(platformBody.position);
    platformMesh.receiveShadow = true;
    platformMesh.castShadow = true;
    
    scene.add(platformMesh);
    world.addBody(platformBody);
    physicsObjects.push({ mesh: platformMesh, body: platformBody });

}

// 5. create score detector
export function createScoreDetector(world, scene, physicsObjects) {
    // Define the shape and body for the score detector in the physics world
    const shape = new CANNON.Box(new CANNON.Vec3(0.2, 0.05, 0.2));
    const scoreDetectorBody = new CANNON.Body({
        mass: 0, // Static body
        shape: shape,
        material: new CANNON.Material({ friction: 0.0, restitution: 0.0 })
    });
    scoreDetectorBody.position.set(0, 3.65, -6);
    scoreDetectorBody.collisionResponse = false; // Make it a sensor, not affecting other bodies physically

    const geometry = new THREE.BoxGeometry(0.4, 0.1, 0.4);
    const meshMaterial = new THREE.MeshPhongMaterial({
        color: 0x123456,
    });
    const scoreDetectorMesh = new THREE.Mesh(geometry, meshMaterial);
    scoreDetectorMesh.position.copy(scoreDetectorBody.position);
    scoreDetectorMesh.visible = false; // Optionally make it invisible in the final scene

    scene.add(scoreDetectorMesh);
    world.addBody(scoreDetectorBody);

    physicsObjects.push({ mesh: scoreDetectorMesh, body: scoreDetectorBody });

    // Return the mesh and body for further manipulation 
    return { mesh: scoreDetectorMesh, body: scoreDetectorBody };
}


// 6. create basketball hoop
export function createHoopWithSegments(world, scene, physicsObjects) {
    // Define material and properties for hoop segments
    const hoopMaterial = new CANNON.Material({ friction: 0.1, restitution: 0.8 });
    const segments = 100; // Number of segments to form a complete hoop
    const hoopRadius = 0.6; // Radius of the hoop
    const segmentRadius = 0.05; // Radius of each segment
    const hoopPosition = new CANNON.Vec3(0, 3.95, -6); // Position of the hoop

    // Loop through and create each segment of the hoop
    for (let i = 0; i < segments; i++) {
        const angle = (Math.PI * 2 / segments) * i; // Calculate angle for each segment
        const x = hoopPosition.x + Math.cos(angle) * hoopRadius; // X position
        const z = hoopPosition.z + Math.sin(angle) * hoopRadius; // Z position

        // Create physics body for segment
        const segmentShape = new CANNON.Sphere(segmentRadius);
        const segmentBody = new CANNON.Body({
            mass: 0, // Static as segments don't move
            shape: segmentShape,
            material: hoopMaterial
        });
        segmentBody.position.set(x, hoopPosition.y, z);
        world.addBody(segmentBody); // Add to physics world

        const segmentGeometry = new THREE.SphereGeometry(segmentRadius, 16, 16);
        const segmentMeshMaterial = new THREE.MeshPhongMaterial({ color: 0x8c3232 }); // Color of hoop
        const segmentMesh = new THREE.Mesh(segmentGeometry, segmentMeshMaterial);
        segmentMesh.position.set(x, hoopPosition.y, z);
        segmentMesh.receiveShadow = true;
        segmentMesh.castShadow = true;
        scene.add(segmentMesh); // Add to scene

        // Push segment entities to physicsObjects array for tracking
        physicsObjects.push({ mesh: segmentMesh, body: segmentBody });
    }
}

// 7. create net
export function createHoopNet(world, scene, physicsObjects) {
    const hoopMaterial = new CANNON.Material({ friction: 0.0, restitution: 0.4 });
    const layers = 15;
    const segments = 20;
    const topRadius = 0.6;
    const bottomRadius = 0.25;
    const hoopPosition = new CANNON.Vec3(0, 3.95, -6);
    const segmentHeight = 0.7 / layers;
    const segmentRadius = 0.02;

    // Store references to all net segments for constraint creation
    let previousLayerSegments = [];
    let currentLayerSegments = [];

    for (let j = 0; j < layers; j++) {
        const radius = topRadius - ((topRadius - bottomRadius) / layers) * j;
        const layerPositionY = hoopPosition.y - segmentHeight * j;
        currentLayerSegments = [];

        for (let i = 0; i < segments; i++) {
            const angle = (Math.PI * 2 / segments) * i;
            const x = hoopPosition.x + Math.cos(angle) * radius;
            const z = hoopPosition.z + Math.sin(angle) * radius;

            // Adjust mass for dynamic simulation; top layer segments have zero mass
            const mass = (j === 0) ? 0 : 0.005;
            const segmentShape = new CANNON.Sphere(segmentRadius);
            const segmentBody = new CANNON.Body({
                mass: mass,
                shape: segmentShape,
                material: hoopMaterial
            });
            segmentBody.addShape(segmentShape);
            segmentBody.position.set(x, layerPositionY, z);
            world.addBody(segmentBody);

            const segmentGeometry = new THREE.SphereGeometry(segmentRadius, 8, 8);
            const segmentMeshMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
            const segmentMesh = new THREE.Mesh(segmentGeometry, segmentMeshMaterial);
            segmentMesh.position.copy(segmentBody.position);

            segmentMesh.castShadow = true;
            segmentMesh.receiveShadow = true;

            scene.add(segmentMesh);
            physicsObjects.push({ mesh: segmentMesh, body: segmentBody });
            currentLayerSegments.push(segmentBody);

            if (i > 0) {
                const constraint = new CANNON.DistanceConstraint(segmentBody, currentLayerSegments[i - 1], radius * Math.PI * 2 / segments);
                world.addConstraint(constraint);
            }
        }

        if (currentLayerSegments.length > 1) {
            const firstSegment = currentLayerSegments[0];
            const lastSegment = currentLayerSegments[currentLayerSegments.length - 1];
            const constraint = new CANNON.DistanceConstraint(firstSegment, lastSegment, radius * Math.PI * 2 / segments);
            world.addConstraint(constraint);
        }

        if (j > 0) {
            for (let i = 0; i < segments; i++) {
                const constraint = new CANNON.DistanceConstraint(currentLayerSegments[i], previousLayerSegments[i], segmentHeight);
                world.addConstraint(constraint);
            }
        }

        previousLayerSegments = currentLayerSegments;
    }
}



// 8. create basketball board
export function createBasketballBoard(world, scene, physicsObjects) {
    // Basketball backboard material and shape
    const backboardMaterial = new CANNON.Material({ friction: 0.3, restitution: 0.2 });
    const backboardShape = new CANNON.Box(new CANNON.Vec3(2, 1.0, 0.025));
    const backboardBody = new CANNON.Body({
        mass: 0, // Static
        shape: backboardShape,
        material: backboardMaterial
    });
    backboardBody.position.set(0, 4.5, -6.7);
    
    // Basketball backboard visual representation
    const backboardTexture = new THREE.TextureLoader().load('../textures/backboard.png');
    const backboardMeshMaterial = new THREE.MeshPhongMaterial({ map: backboardTexture });
    const backboardMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 2.0, 0.05), backboardMeshMaterial);
    backboardMesh.position.copy(backboardBody.position);
    backboardMesh.castShadow = true; // Enable casting shadows
    backboardMesh.receiveShadow = true; // Enable receiving shadows
    
    scene.add(backboardMesh);
    world.addBody(backboardBody);
    physicsObjects.push({ mesh: backboardMesh, body: backboardBody });
    
    // Create support structures
    createSupportStructure(world, scene, physicsObjects, 0, 4.5, -7.3, new THREE.Vector3(3, 1, 0.2));
    createSupportStructure(world, scene, physicsObjects, 1, 4.5, -7, new THREE.Vector3(0.1, 1, 0.6));
    createSupportStructure(world, scene, physicsObjects, -1, 4.5, -7, new THREE.Vector3(0.1, 1, 0.6));
}

// Helper function to create support structures
function createSupportStructure(world, scene, physicsObjects, posX, posY, posZ, scale) {
    const supportMaterial = new CANNON.Material({ friction: 0.3, restitution: 0.2 });
    const shape = new CANNON.Box(new CANNON.Vec3(scale.x / 2, scale.y / 2, scale.z / 2));
    const body = new CANNON.Body({
        mass: 0, // Static
        shape: shape,
        material: supportMaterial
    });
    body.position.set(posX, posY, posZ);
    
    const meshMaterial = new THREE.MeshPhongMaterial({ color: 0x7f7f7f });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(scale.x, scale.y, scale.z), meshMaterial);
    mesh.position.copy(body.position);
    mesh.castShadow = true; // Enable casting shadows
    mesh.receiveShadow = true; // Enable receiving shadows
    
    scene.add(mesh);
    world.addBody(body);
    physicsObjects.push({ mesh: mesh, body: body });
}


export function createBench(world, scene, physicsObjects) {
    const material = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.76, 0.49, 0.26) });

    const seatGeometry = new THREE.BoxGeometry(0.5 * 2, 0.1 * 2, 3 * 2);
    const seatBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.1, 3)),
        position: new CANNON.Vec3(-6.9, 0.9, 3),
    });
    const seatMesh = new THREE.Mesh(seatGeometry, material);
    seatMesh.position.copy(seatBody.position);
    seatMesh.quaternion.copy(seatBody.quaternion);

    const legGeometry = new THREE.BoxGeometry(0.5 * 2, 0.5 * 2, 0.1 * 2);
    const leftLegBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.1)),
        position: new CANNON.Vec3(-6.9, 0.5, 6),
    });
    const leftLegMesh = new THREE.Mesh(legGeometry, material);
    leftLegMesh.position.copy(leftLegBody.position);
    leftLegMesh.quaternion.copy(leftLegBody.quaternion);

    const rightLegBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.1)),
        position: new CANNON.Vec3(-6.9, 0.5, 0),
    });
    const rightLegMesh = new THREE.Mesh(legGeometry, material);
    rightLegMesh.position.copy(rightLegBody.position);
    rightLegMesh.quaternion.copy(rightLegBody.quaternion);

    scene.add(seatMesh);
    scene.add(leftLegMesh);
    scene.add(rightLegMesh);
    seatMesh.receiveShadow = true;
    rightLegMesh.receiveShadow = true;
    leftLegMesh.receiveShadow = true;
    seatMesh.castShadow = true;
    rightLegMesh.castShadow = true;
    leftLegMesh.receiveShadow = true;


    world.addBody(seatBody);
    world.addBody(leftLegBody);
    world.addBody(rightLegBody);

    physicsObjects.push({ mesh: seatMesh, body: seatBody });
    physicsObjects.push({ mesh: leftLegMesh, body: leftLegBody });
    physicsObjects.push({ mesh: rightLegMesh, body: rightLegBody });
}

export function createDecorations(scene) {
    const textureLoader = new THREE.TextureLoader();

    const timerTexture = textureLoader.load('../textures/timer.png');
    const timerMaterial = new THREE.MeshBasicMaterial({ map: timerTexture });
    const timerGeometry = new THREE.BoxGeometry(1.8 * 2, 0.8 * 2, 0.1 * 2);
    const timerMesh = new THREE.Mesh(timerGeometry, timerMaterial);
    timerMesh.receiveShadow = true;
    timerMesh.castShadow = true;
    timerMesh.position.set(-5, 6, -7.4);
    scene.add(timerMesh);

    const kobeTexture = textureLoader.load('../textures/kobe.png');
    const kobeMaterial = new THREE.MeshBasicMaterial({ map: kobeTexture });
    const kobeGeometry = new THREE.BoxGeometry(0.01 * 2, 2 * 2, 5 * 2);
    const kobeMesh = new THREE.Mesh(kobeGeometry, kobeMaterial);
    kobeMesh.position.set(-7.4, 4, 0);
    kobeMesh.receiveShadow = true;
    kobeMesh.castShadow = true;
    scene.add(kobeMesh);
}

