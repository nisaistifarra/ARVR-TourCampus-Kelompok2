
import * as THREE from 'three';

export function buildGradCap() {
  const group = new THREE.Group();

  // ==============================
  // MATERIAL
  // ==============================

  const floorMat = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8,
    roughness: 0.9
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: 0xf1eee7,
    roughness: 0.9
  });

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x805333,
    roughness: 0.8
  });

  const lightWood = new THREE.MeshStandardMaterial({
    color: 0xc69b6d,
    roughness: 0.8
  });

  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x252b36,
    roughness: 0.6
  });

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.7
  });

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    metalness: 0.5,
    roughness: 0.4
  });

  const screenMat = new THREE.MeshStandardMaterial({
    color: 0x172554,
    emissive: 0x102050,
    emissiveIntensity: 0.3
  });

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x2563eb,
    roughness: 0.7
  });

  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.8
  });

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.7
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd4a843,
    metalness: 0.4,
    roughness: 0.5
  });

  // ==============================
  // FUNGSI BOX
  // ==============================

  function box(w, h, d, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    group.add(mesh);
    return mesh;
  }

  // ==============================
  // FUNGSI SILINDER
  // ==============================

  function cylinder(rt, rb, h, material, x, y, z) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, h, 12),
      material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;

    group.add(mesh);
    return mesh;
  }

  // ==============================
  // LANTAI RUANGAN
  // ==============================

  box(
    0.65, 0.025, 0.55,
    floorMat, 0, 0, 0
  );

  // Karpet
  box(
    0.30, 0.004, 0.22,
    lightWood, 0.07, 0.015, 0.13
  );

  // ==============================
  // DINDING
  // ==============================

  // Dinding belakang
  box(
    0.65, 0.40, 0.02,
    wallMat, 0, 0.21, -0.27
  );

  // Dinding kiri
  box(
    0.02, 0.40, 0.55,
    wallMat, -0.325, 0.21, 0
  );

  // List bawah dinding
  box(
    0.64, 0.012, 0.025,
    woodMat, 0, 0.025, -0.25
  );

  // ==============================
  // JENDELA
  // ==============================

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x93c5fd,
    roughness: 0.2,
    metalness: 0.1
  });

  box(
    0.17, 0.12, 0.008,
    silverMat, -0.12, 0.28, -0.252
  );

  box(
    0.155, 0.105, 0.003,
    glassMat, -0.12, 0.28, -0.245
  );

  // Pembatas jendela
  box(
    0.004, 0.105, 0.004,
    whiteMat, -0.12, 0.28, -0.24
  );

  box(
    0.155, 0.004, 0.004,
    whiteMat, -0.12, 0.28, -0.24
  );

  // ==============================
  // MEJA DOSEN
  // ==============================

  // Permukaan meja
  box(
    0.30, 0.018, 0.16,
    woodMat, 0.045, 0.19, -0.015
  );

  // Bagian depan meja
  box(
    0.30, 0.075, 0.012,
    lightWood, 0.045, 0.14, 0.063
  );

  // Kaki meja
  box(
    0.012, 0.16, 0.012,
    blackMat, -0.085, 0.10, -0.075
  );

  box(
    0.012, 0.16, 0.012,
    blackMat, 0.175, 0.10, -0.075
  );

  box(
    0.012, 0.16, 0.012,
    blackMat, -0.085, 0.10, 0.045
  );

  box(
    0.012, 0.16, 0.012,
    blackMat, 0.175, 0.10, 0.045
  );

  // ==============================
  // LACI MEJA
  // ==============================

  box(
    0.07, 0.045, 0.12,
    lightWood, 0.13, 0.15, -0.015
  );

  // Pegangan laci
  box(
    0.025, 0.004, 0.003,
    silverMat, 0.13, 0.15, 0.048
  );

  // ==============================
  // MONITOR KOMPUTER
  // ==============================

  box(
    0.12, 0.078, 0.012,
    blackMat, 0.04, 0.255, -0.045
  );

  box(
    0.108, 0.065, 0.002,
    screenMat, 0.04, 0.255, -0.037
  );

  // Stand monitor
  box(
    0.012, 0.025, 0.012,
    silverMat, 0.04, 0.203, -0.045
  );

  box(
    0.05, 0.005, 0.025,
    silverMat, 0.04, 0.189, -0.045
  );

  // Keyboard
  box(
    0.09, 0.005, 0.028,
    blackMat, 0.035, 0.203, 0.035
  );

  // Mouse
  const mouse = new THREE.Mesh(
    new THREE.SphereGeometry(0.008, 12, 10),
    blackMat
  );

  mouse.scale.set(0.8, 0.5, 1.3);
  mouse.position.set(0.11, 0.203, 0.035);
  group.add(mouse);

  // ==============================
  // BUKU DI MEJA
  // ==============================

  box(
    0.045, 0.008, 0.055,
    blueMat, -0.055, 0.204, 0.015
  );

  box(
    0.045, 0.008, 0.055,
    whiteMat, -0.055, 0.213, 0.015
  );

  box(
    0.045, 0.008, 0.055,
    redMat, -0.055, 0.222, 0.015
  );

  // ==============================
  // KURSI DOSEN
  // ==============================

  // Dudukan
  box(
    0.095, 0.016, 0.09,
    blackMat, 0.045, 0.115, 0.16
  );

  // Sandaran
  box(
    0.095, 0.105, 0.018,
    blackMat, 0.045, 0.175, 0.205
  );

  // Tiang kursi
  cylinder(
    0.008, 0.008, 0.065,
    silverMat, 0.045, 0.07, 0.16
  );

  // Kaki kursi
  box(
    0.12, 0.008, 0.018,
    blackMat, 0.045, 0.035, 0.16
  );

  box(
    0.018, 0.008, 0.12,
    blackMat, 0.045, 0.035, 0.16
  );

  // ==============================
  // LEMARI BUKU
  // ==============================

  box(
    0.12, 0.22, 0.055,
    woodMat, -0.235, 0.125, -0.205
  );

  // Rak lemari
  box(
    0.115, 0.006, 0.05,
    lightWood, -0.235, 0.12, -0.172
  );

  box(
    0.115, 0.006, 0.05,
    lightWood, -0.235, 0.20, -0.172
  );

  // Buku
  const bookMaterials = [
    blueMat, redMat, greenMat, goldMat, whiteMat
  ];

  for (let i = 0; i < 5; i++) {
    box(
      0.014, 0.045, 0.026,
      bookMaterials[i],
      -0.275 + i * 0.018,
      0.15, -0.165
    );
  }

  for (let i = 0; i < 4; i++) {
    box(
      0.014, 0.04, 0.026,
      bookMaterials[4 - i],
      -0.265 + i * 0.02,
      0.23, -0.165
    );
  }

  // ==============================
  // PABAN INFORMASI
  // ==============================

  box(
    0.14, 0.095, 0.008,
    woodMat, 0.17, 0.30, -0.25
  );

  box(
    0.13, 0.085, 0.003,
    whiteMat, 0.17, 0.30, -0.244
  );

  // Poster biru
  box(
    0.09, 0.022, 0.002,
    blueMat, 0.17, 0.325, -0.241
  );

  // Informasi poster
  box(
    0.07, 0.003, 0.002,
    goldMat, 0.17, 0.302, -0.241
  );

  box(
    0.055, 0.003, 0.002,
    silverMat, 0.17, 0.29, -0.241
  );

  // ==============================
  // TANAMAN HIAS
  // ==============================

  cylinder(
    0.012, 0.009, 0.025,
    woodMat, 0.25, 0.04, 0.08
  );

  const plantPositions = [
    [-0.01, 0.015, 0],
    [0.01, 0.02, 0],
    [0, 0.025, 0.01]
  ];

  plantPositions.forEach(([x, y, z]) => {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.012, 10, 10),
      greenMat
    );

    leaf.scale.set(0.7, 1.5, 0.7);

    leaf.position.set(
      0.25 + x,
      0.052 + y,
      0.08 + z
    );

    group.add(leaf);
  });

  // ==============================
  // LAMPU MEJA
  // ==============================

  cylinder(
    0.003, 0.003, 0.045,
    goldMat, -0.10, 0.225, -0.015
  );

  const lampHead = new THREE.Mesh(
    new THREE.ConeGeometry(0.014, 0.02, 12),
    goldMat
  );

  lampHead.position.set(-0.10, 0.255, -0.015);
  lampHead.rotation.z = Math.PI;
  group.add(lampHead);

  // ==============================
  // IDENTITAS RUANGAN
  // ==============================

  box(
    0.12, 0.025, 0.004,
    woodMat, 0.10, 0.385, -0.252
  );

  box(
    0.08, 0.003, 0.002,
    goldMat, 0.10, 0.385, -0.249
  );

  return group;
}
