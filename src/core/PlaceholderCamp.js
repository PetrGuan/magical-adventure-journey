import * as THREE from 'three';

/**
 * Phase 1-2 占位营地：用基础几何体勾勒出大本营的雏形。
 * Phase 3 会用 Sketchfab GLB 模型替换。
 *
 * 布局参考：content/scenes/00-base-camp.md
 *
 * @returns {{ npcs, frames }} 可交互对象的引用
 *   - npcs: [{ body, head, halo, character }]
 *   - frames: [{ outer, inner, destination }]
 */
export function buildPlaceholderCamp(scene, characters, destinations) {
  // ====== 天空 + 雾 ======
  scene.background = new THREE.Color(0xfdc080);
  scene.fog = new THREE.Fog(0xfdc080, 25, 80);

  // ====== 灯光 ======
  scene.add(new THREE.HemisphereLight(0xffaa66, 0x4a3322, 0.7));

  const sun = new THREE.DirectionalLight(0xffcc88, 1.1);
  sun.position.set(8, 12, 6);
  scene.add(sun);

  // ====== 地面 ======
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x4a6b3e, roughness: 0.95 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // ====== 帐篷 ======
  const tentMat = new THREE.MeshStandardMaterial({ color: 0x8a5a3a });
  for (const x of [-3.5, 3.5]) {
    const tent = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 4), tentMat);
    tent.position.set(x, 1.2, -3);
    tent.rotation.y = Math.PI / 4;
    scene.add(tent);
  }

  // ====== 篝火 ======
  const firePit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0a })
  );
  firePit.position.set(0, 0.1, -4);
  scene.add(firePit);

  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.0, 8),
    new THREE.MeshBasicMaterial({ color: 0xff5511 })
  );
  fire.position.set(0, 0.8, -4);
  scene.add(fire);

  const fireLight = new THREE.PointLight(0xff7733, 2.5, 12, 1.5);
  fireLight.position.set(0, 1.5, -4);
  scene.add(fireLight);

  scene.userData.fire = fire;
  scene.userData.fireLight = fireLight;

  // ====== 装备桌 ======
  const wood = new THREE.MeshStandardMaterial({ color: 0x6b4a2a, roughness: 0.8 });
  const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.1, 1.4), wood);
  tableTop.position.set(0, 1, 1.5);
  scene.add(tableTop);
  for (const [x, z] of [[-1.5, 0.9], [1.5, 0.9], [-1.5, 2.1], [1.5, 2.1]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1, 0.1), wood);
    leg.position.set(x, 0.5, z);
    scene.add(leg);
  }

  const eqColors = [0xc0b08a, 0xb0782a, 0x444444, 0x6688aa, 0xaa3322, 0xffffff];
  for (let i = 0; i < 6; i++) {
    const eq = new THREE.Mesh(
      i % 2 === 0
        ? new THREE.BoxGeometry(0.25, 0.15, 0.2)
        : new THREE.CylinderGeometry(0.12, 0.12, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: eqColors[i] })
    );
    eq.position.set(-1.2 + i * 0.5, 1.13, 1.5);
    scene.add(eq);
  }

  // ====== 6 位 NPC ======
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xe8c8a0 });
  const npcs = [];
  characters.forEach((character, i) => {
    const isLeft = i < 3;
    const x = isLeft ? -4.5 : 4.5;
    const z = -6 + (i % 3) * 2;

    // 身体（独立 material 实例，方便单独高亮）
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 1.4, 10),
      new THREE.MeshStandardMaterial({ color: character.color })
    );
    body.position.set(x, 0.7, z);
    scene.add(body);

    // 头（独立 material 实例，肤色）
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12),
      skinMat.clone()
    );
    head.position.set(x, 1.65, z);
    scene.add(head);

    // 头顶光环（点击时显示）
    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.42, 24),
      new THREE.MeshBasicMaterial({
        color: 0xffd89a,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
        fog: false,
      })
    );
    halo.position.set(x, 2.1, z);
    halo.rotation.x = -Math.PI / 2;
    halo.visible = false;
    scene.add(halo);

    npcs.push({ body, head, halo, character });
  });

  // ====== 5 张视频画框 + 北墙 ======
  const wall = new THREE.Mesh(
    new THREE.BoxGeometry(20, 4.5, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x5a3e22, roughness: 0.85 })
  );
  wall.position.set(0, 2.25, -11);
  scene.add(wall);

  const frames = [];
  destinations.forEach((destination, i) => {
    // 外框（米黄色木框）
    const outer = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xc4a878, emissive: 0x2a1a08 })
    );
    outer.position.set(-7.5 + i * 3.75, 2.4, -10.85);
    scene.add(outer);

    // 内画（占位颜色 + 文字）
    const inner = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 1.3),
      new THREE.MeshStandardMaterial({
        map: makeFrameLabel(destination),
        emissive: 0x000000,
      })
    );
    inner.position.set(-7.5 + i * 3.75, 2.4, -10.84);
    scene.add(inner);

    frames.push({ outer, inner, destination });
  });

  // ====== 周围松树点缀 ======
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });
  const treeMat  = new THREE.MeshStandardMaterial({ color: 0x2a4a1a });
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.2;
    const r = 15 + Math.random() * 4;
    const tx = Math.cos(angle) * r;
    const tz = Math.sin(angle) * r;

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.28, 1.4, 6),
      trunkMat
    );
    trunk.position.set(tx, 0.7, tz);
    scene.add(trunk);

    const top = new THREE.Mesh(
      new THREE.ConeGeometry(0.9 + Math.random() * 0.3, 2.6 + Math.random() * 0.6, 6),
      treeMat
    );
    top.position.set(tx, 2.9, tz);
    scene.add(top);
  }

  // ====== 远山轮廓 ======
  const mountainMat = new THREE.MeshBasicMaterial({ color: 0x3a2a3a, fog: false });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(8, 6 + Math.random() * 3, 4),
      mountainMat
    );
    mountain.position.set(Math.cos(angle) * 50, 3, Math.sin(angle) * 50);
    scene.add(mountain);
  }

  return { npcs, frames };
}

/** 用 CanvasTexture 给画框生成「emoji + 名字」标签作为占位 */
function makeFrameLabel(destination) {
  const canvas = document.createElement('canvas');
  canvas.width = 460;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');

  // 背景色 = destination.color
  ctx.fillStyle = '#' + destination.color.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 半透明深色覆盖让文字更清晰
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 大 emoji
  ctx.font = '120px "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(destination.emoji, canvas.width / 2, canvas.height / 2 - 20);

  // 名称
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 36px "Noto Serif SC", "PingFang SC", serif';
  ctx.fillText(destination.name, canvas.width / 2, canvas.height / 2 + 80);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** 每帧动画 */
export function updatePlaceholderCamp(scene, delta, elapsed) {
  // 篝火光跳动
  const fireLight = scene.userData.fireLight;
  if (fireLight) {
    fireLight.intensity = 2.5 + Math.sin(elapsed * 9) * 0.5 + (Math.random() - 0.5) * 0.4;
  }

  // 火苗轻微缩放
  const fire = scene.userData.fire;
  if (fire) {
    fire.scale.y = 1 + Math.sin(elapsed * 14) * 0.12;
    fire.scale.x = 1 + Math.sin(elapsed * 11) * 0.06;
  }

  // 光环旋转
  if (scene.userData.npcs_) { /* deprecated */ }
}

/** 让 NPC 头顶光环旋转（只旋转可见的） */
export function spinHalos(npcs, elapsed) {
  for (const npc of npcs) {
    if (npc.halo.visible) {
      npc.halo.rotation.z = elapsed * 1.2;
    }
  }
}
