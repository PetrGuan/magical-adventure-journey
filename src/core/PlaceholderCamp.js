import * as THREE from 'three';

/**
 * Phase 1 占位营地：用基础几何体勾勒出大本营的雏形。
 * Phase 2 会用 Sketchfab GLB 模型替换。
 *
 * 布局参考：content/scenes/00-base-camp.md
 */
export function buildPlaceholderCamp(scene) {
  // ====== 天空 + 雾 ======
  scene.background = new THREE.Color(0xfdc080); // 黄昏暖橙
  scene.fog = new THREE.Fog(0xfdc080, 25, 80);

  // ====== 灯光 ======
  const hemi = new THREE.HemisphereLight(0xffaa66, 0x4a3322, 0.7);
  scene.add(hemi);

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

  // ====== 帐篷（占位锥体）======
  const tentMat = new THREE.MeshStandardMaterial({ color: 0x8a5a3a });
  for (const x of [-3.5, 3.5]) {
    const tent = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.4, 4), tentMat);
    tent.position.set(x, 1.2, -3);
    tent.rotation.y = Math.PI / 4;
    scene.add(tent);
  }

  // ====== 篝火 ======
  // 火堆底（深色圆台）
  const firePit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.7, 0.8, 0.2, 12),
    new THREE.MeshStandardMaterial({ color: 0x2a1a0a })
  );
  firePit.position.set(0, 0.1, -4);
  scene.add(firePit);

  // 火苗（emissive 锥体）
  const fireMat = new THREE.MeshBasicMaterial({ color: 0xff5511 });
  const fire = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 8), fireMat);
  fire.position.set(0, 0.8, -4);
  scene.add(fire);

  // 火光（点光源，跳动）
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

  // 桌上装备占位（不同颜色小方块/圆柱）
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

  // ====== 6 位 NPC 占位 ======
  // A 列（导师）= 偏暖色，B 列（伙伴）= 偏冷/活泼色
  const npcMeta = [
    { color: 0x4a3a28, name: '李大山' },   // A1 沉稳深棕
    { color: 0x9a7a4a, name: '陈雨桐' },   // A2 浅棕
    { color: 0x8a5a3a, name: '阿木叔' },   // A3 红棕
    { color: 0xe88aa0, name: '小雨' },     // B1 粉
    { color: 0xc44a2a, name: '张大壮' },   // B2 橙红
    { color: 0x6688bb, name: '小明' },     // B3 蓝
  ];
  scene.userData.npcs = [];
  for (let i = 0; i < 6; i++) {
    const isLeft = i < 3;
    const x = isLeft ? -4.5 : 4.5;
    const z = -6 + (i % 3) * 2;

    // 身体（圆柱）
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 1.4, 10),
      new THREE.MeshStandardMaterial({ color: npcMeta[i].color })
    );
    body.position.set(x, 0.7, z);
    scene.add(body);

    // 头（球）
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0xe8c8a0 })
    );
    head.position.set(x, 1.65, z);
    scene.add(head);

    scene.userData.npcs.push({ body, head, name: npcMeta[i].name });
  }

  // ====== 5 张视频画框 + 北墙 ======
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x5a3e22, roughness: 0.85 });
  const wall = new THREE.Mesh(new THREE.BoxGeometry(20, 4.5, 0.25), wallMat);
  wall.position.set(0, 2.25, -11);
  scene.add(wall);

  // 5 个画框占位（不同颜色暗示不同场景）
  const frameColors = [0xe8b878, 0x4aaa6a, 0x6aaadd, 0x4a3a6a, 0xb0d0e8];
  scene.userData.frames = [];
  for (let i = 0; i < 5; i++) {
    // 外框
    const outer = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 1.6),
      new THREE.MeshStandardMaterial({ color: 0xc4a878, emissive: 0x2a1a08 })
    );
    outer.position.set(-7.5 + i * 3.75, 2.4, -10.85);
    scene.add(outer);

    // 内画
    const inner = new THREE.Mesh(
      new THREE.PlaneGeometry(2.3, 1.3),
      new THREE.MeshStandardMaterial({ color: frameColors[i] })
    );
    inner.position.set(-7.5 + i * 3.75, 2.4, -10.84);
    scene.add(inner);

    scene.userData.frames.push(inner);
  }

  // ====== 周围松树点缀 ======
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3a2a18 });
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x2a4a1a });
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

  // ====== 远山轮廓（一圈低矮 plane 撑起背景）======
  const mountainMat = new THREE.MeshBasicMaterial({ color: 0x3a2a3a, fog: false });
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const r = 50;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(8, 6 + Math.random() * 3, 4),
      mountainMat
    );
    mountain.position.set(Math.cos(angle) * r, 3, Math.sin(angle) * r);
    scene.add(mountain);
  }
}

/** 每帧动画——篝火跳动 + NPC 微小起伏 */
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

  // NPC 呼吸动画（轻微上下浮动）
  if (scene.userData.npcs) {
    scene.userData.npcs.forEach((npc, i) => {
      const phase = i * 0.5;
      const offset = Math.sin(elapsed * 1.2 + phase) * 0.015;
      npc.body.position.y = 0.7 + offset;
      npc.head.position.y = 1.65 + offset;
    });
  }
}
