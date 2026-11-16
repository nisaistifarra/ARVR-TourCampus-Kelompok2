import * as THREE from 'three';

export function buildLabRoom() {
    const room = new THREE.Group();

    // MATERIAL
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc });
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x111827 });

    const screenMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0ea5e9,
        emissiveIntensity: 0.9
    });

    const blueMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const lampMaterials = [];

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.5
    });

    // FLOOR
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.03, 1.6),
        floorMat
    );
    floor.position.y = -0.25;
    room.add(floor);

    // WALL
    const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.9, 0.03),
        wallMat
    );
    backWall.position.set(0, 0.2, -0.75);
    room.add(backWall);

    // WHITEBOARD
    const whiteboard = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.35, 0.01),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    whiteboard.position.set(0, 0.3, -0.72);
    room.add(whiteboard);

    // PROJECTOR
    const projector = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.05, 0.08),
        blackMat
    );
    projector.position.set(0, 0.55, -0.2);
    room.add(projector);

    // WINDOWS
    for (let i = 0; i < 3; i++) {
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.25, 0.01),
            new THREE.MeshPhysicalMaterial({
                color: 0xa5f3fc,
                transparent: true,
                opacity: 0.6
            })
        );

        glass.position.set(-0.8 + i * 0.3, 0.25, -0.72);
        room.add(glass);
    }

    // COMPUTER SET
    function createComputerSet() {
        const set = new THREE.Group();

        // MEJA
        const table = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.02, 0.14),
            woodMat
        );
        set.add(table);

        // MONITOR
        const monitorFrame = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.06, 0.01),
            blackMat
        );
        monitorFrame.position.y = 0.055;
        set.add(monitorFrame);

        // LAYAR MONITOR
        const screen = new THREE.Mesh(
            new THREE.BoxGeometry(0.07, 0.05, 0.002),
            screenMat
        );
        screen.position.set(0, 0.055, 0.006);
        set.add(screen);

        // CPU
        const cpu = new THREE.Mesh(
            new THREE.BoxGeometry(0.03, 0.07, 0.05),
            blackMat
        );
        cpu.position.set(0.09, -0.02, 0);
        set.add(cpu);

        // KEYBOARD
        const keyboard = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 0.004, 0.02),
            blackMat
        );
        keyboard.position.set(0, 0.013, 0.04);
        set.add(keyboard);

        // KURSI
        const chairSeat = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.01, 0.06),
            blueMat
        );
        chairSeat.position.set(0, -0.09, 0.13);
        set.add(chairSeat);

        const chairBack = new THREE.Mesh(
            new THREE.BoxGeometry(0.06, 0.07, 0.01),
            blueMat
        );
        chairBack.position.set(0, -0.05, 0.17);
        set.add(chairBack);

        return set;
    }

    // 12 KOMPUTER
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const pc = createComputerSet();

            pc.position.set(
                -0.75 + col * 0.5,
                0,
                -0.4 + row * 0.35
            );

            room.add(pc);
        }
    }

    // CEILING LIGHTS
    for (let i = 0; i < 3; i++) {
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.7
        });

        lampMaterials.push(lampMat);

        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.02, 0.08),
            lampMat
        );

        lamp.position.set(-0.5 + i * 0.5, 0.65, 0);
        room.add(lamp);
    }

    // SKALA RUANGAN
    room.scale.set(0.25, 0.25, 0.25);

    // ANIMASI CAHAYA
    room.userData.animate = (time) => {
        const screenGlow = 0.65 + Math.sin(time * 2) * 0.2;
        screenMat.emissiveIntensity = screenGlow;

        lampMaterials.forEach((material, index) => {
            material.emissiveIntensity =
                0.55 + Math.sin(time * 1.5 + index * 0.7) * 0.15;
        });
    };

    return room;
}