
import * as THREE from 'three';

export function buildBoard() {
  const group = new THREE.Group();

  // ==============================
  // MATERIAL
  // ==============================

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x526174,
    metalness: 0.75,
    roughness: 0.3
  });

  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.45
  });

  const silverMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.85,
    roughness: 0.2
  });

  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.5
  });

  const blueMat = new THREE.MeshStandardMaterial({
    color: 0x1e40af,
    roughness: 0.7
  });

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.7
  });

  const yellowMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.7
  });

  const greenMat = new THREE.MeshStandardMaterial({
    color: 0x15803d,
    roughness: 0.7
  });

  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7
  });

  // ==============================
  // FUNGSI MEMBUAT BOX
  // ==============================

  function addBox(w, h, d, material, x, y, z) {
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
  // PAPAN UTAMA
  // ==============================

  addBox(
    0.28, 0.19, 0.012,
    darkMat, 0, 0, 0
  );

  addBox(
    0.254, 0.164, 0.004,
    boardMat, 0, 0, 0.009
  );

  // FRAME ATAS
  addBox(
    0.28, 0.013, 0.014,
    frameMat, 0, 0.088, 0.009
  );

  // FRAME BAWAH
  addBox(
    0.28, 0.013, 0.014,
    frameMat, 0, -0.088, 0.009
  );

  // FRAME KIRI
  addBox(
    0.013, 0.164, 0.014,
    frameMat, -0.1335, 0, 0.009
  );

  // FRAME KANAN
  addBox(
    0.013, 0.164, 0.014,
    frameMat, 0.1335, 0, 0.009
  );

  // GARIS METALIK ATAS
  addBox(
    0.20, 0.0015, 0.001,
    silverMat, 0, 0.076, 0.011
  );

  // ==============================
  // FUNGSI MEMBUAT POSTER
  // ==============================

  function createPoster({
    x, y, w, h,
    color,
    title,
    subtitle,
    accent,
    lines = 2
  }) {
    const poster = new THREE.Group();

    // Kertas poster
    const paper = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, 0.002),
      new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.85
      })
    );

    poster.add(paper);

    // Header poster
    const header = new THREE.Mesh(
      new THREE.BoxGeometry(
        w * 0.88,
        h * 0.22,
        0.001
      ),
      new THREE.MeshStandardMaterial({
        color: accent,
        roughness: 0.7
      })
    );

    header.position.set(
      0,
      h * 0.34,
      0.0015
    );

    poster.add(header);

    // Dekorasi garis pada poster
    for (let i = 0; i < lines; i++) {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(
          w * (0.65 - i * 0.08),
          0.0018,
          0.001
        ),
        new THREE.MeshStandardMaterial({
          color: accent,
          roughness: 0.7
        })
      );

      line.position.set(
        0,
        h * 0.02 - i * h * 0.12,
        0.002
      );

      poster.add(line);
    }

    // Dekorasi lingkaran
    const circle = new THREE.Mesh(
      new THREE.CircleGeometry(
        Math.min(w, h) * 0.13,
        24
      ),
      new THREE.MeshStandardMaterial({
        color: accent,
        roughness: 0.6
      })
    );

    circle.position.set(
      -w * 0.27,
      -h * 0.31,
      0.002
    );

    poster.add(circle);

    // Posisi poster
    poster.position.set(x, y, 0.017);

    poster.traverse((obj) => {
      if (obj.isMesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    group.add(poster);

    // Pin bagian atas
    const pin = new THREE.Mesh(
      new THREE.SphereGeometry(0.003, 12, 12),
      silverMat
    );

    pin.position.set(
      x,
      y + h * 0.46,
      0.023
    );

    group.add(pin);

    // Pin bagian bawah
    const pinBottom = pin.clone();

    pinBottom.position.set(
      x,
      y - h * 0.46,
      0.023
    );

    group.add(pinBottom);
  }

  // ==============================
  // POSTER 1 - CAMPUS EVENT
  // ==============================

  createPoster({
    x: -0.078,
    y: 0.032,
    w: 0.092,
    h: 0.108,
    color: 0xfef3c7,
    accent: 0x1e40af,
    title: 'CAMPUS EVENT 2026',
    subtitle: 'University Activities',
    lines: 3
  });

  // ==============================
  // POSTER 2 - SEMINAR
  // ==============================

  createPoster({
    x: 0.034,
    y: 0.045,
    w: 0.086,
    h: 0.082,
    color: 0xdbeafe,
    accent: 0x2563eb,
    title: 'TECHNOLOGY SEMINAR',
    subtitle: 'Innovation and Future',
    lines: 2
  });

  // ==============================
  // POSTER 3 - STUDENT ACTIVITIES
  // ==============================

  createPoster({
    x: 0.035,
    y: -0.033,
    w: 0.086,
    h: 0.065,
    color: 0xffe4e6,
    accent: 0xdc2626,
    title: 'STUDENT ACTIVITIES',
    subtitle: 'Join Our Community',
    lines: 2
  });

  // ==============================
  // POSTER 4 - CAMPUS NEWS
  // ==============================

  createPoster({
    x: -0.078,
    y: -0.046,
    w: 0.065,
    h: 0.048,
    color: 0xdcfce7,
    accent: 0x15803d,
    title: 'CAMPUS NEWS',
    subtitle: 'Latest Information',
    lines: 1
  });

  // ==============================
  // DEKORASI KERTAS KECIL
  // ==============================

  addBox(
    0.012, 0.012, 0.002,
    yellowMat, 0.105, 0.066, 0.019
  );

  addBox(
    0.012, 0.012, 0.002,
    redMat, 0.105, -0.056, 0.019
  );

  // ==============================
  // RAK SPIDOL
  // ==============================

  addBox(
    0.25, 0.009, 0.032,
    frameMat, 0, -0.105, 0.018
  );

  addBox(
    0.25, 0.006, 0.004,
    silverMat, 0, -0.099, 0.035
  );

  // ==============================
  // PENGHAPUS
  // ==============================

  addBox(
    0.035, 0.012, 0.018,
    darkMat, 0.075, -0.096, 0.025
  );

  // ==============================
  // SPIDOL
  // ==============================

  function addMarker(x, material) {
    const marker = new THREE.Group();

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.0035, 0.0035, 0.052, 12
      ),
      material
    );

    body.rotation.z = Math.PI / 2;
    marker.add(body);

    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.004, 0.004, 0.009, 12
      ),
      darkMat
    );

    cap.rotation.z = Math.PI / 2;
    cap.position.x = 0.027;

    marker.add(cap);

    marker.position.set(
      x, -0.092, 0.025
    );

    group.add(marker);
  }

  addMarker(-0.075, darkMat);
  addMarker(-0.015, blueMat);
  addMarker(0.045, redMat);

  // ==============================
  // BAUT SUDUT PAPAN
  // ==============================

  const screwPositions = [
    [-0.133, 0.088],
    [0.133, 0.088],
    [-0.133, -0.088],
    [0.133, -0.088]
  ];

  screwPositions.forEach(([x, y]) => {
    const screw = new THREE.Mesh(
      new THREE.CylinderGeometry(
        0.0025, 0.0025, 0.0015, 16
      ),
      silverMat
    );

    screw.rotation.x = Math.PI / 2;
    screw.position.set(x, y, 0.017);

    group.add(screw);
  });

  return group;
}
