import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * 全景大本营场景。
 * 学生站在球心，背景是 360° 全景图（来自 AI 生成的真实感图像）。
 * 6 个 NPC（sprite / 视频 / 3D 模型）+ 5 个目的地画框漂浮在球内空间。
 * 学生只能转视角，不能移动。
 */

const PANORAMA_URL = 'assets/skybox/base-camp.webp';
const gltfLoader = new GLTFLoader();

async function loadPanorama(url) {
  return new Promise((resolve) => {
    new THREE.TextureLoader().load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.mapping = THREE.EquirectangularReflectionMapping;
        resolve(tex);
      },
      undefined,
      (err) => {
        console.warn(`[Panorama] 加载失败 ${url}:`, err);
        resolve(null);
      }
    );
  });
}

/**
 * @returns {{ npcs, frames }}
 */
export async function buildPlaceholderCamp(scene, characters, destinations) {
  // ====== 全景背景 ======
  const panoTex = await loadPanorama(PANORAMA_URL);
  if (panoTex) {
    scene.background = panoTex;
    scene.environment = panoTex;
  } else {
    scene.background = new THREE.Color(0xfdc080);
  }

  // ====== 灯光 ======
  // sprite 不需要灯光，但 3D 模型（GLB）需要 PBR 灯光才能看清材质
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  // 模拟黄昏阳光，从右上方 45° 斜射，给 3D 角色做出立体感
  const sun = new THREE.DirectionalLight(0xffd99a, 1.2);
  sun.position.set(5, 8, 3);
  scene.add(sun);

  // ====== 顶部标题牌 ======
  const titleSprite = makeTitleSprite('探险大本营');
  titleSprite.position.set(0, 6, -8);
  titleSprite.scale.set(8, 1.6, 1);
  scene.add(titleSprite);

  // 目的地不再以画框形式出现在场景里——
  // 改为点击 NPC 后从对话框选择（见 src/ui/Subtitle.js）
  const frames = [];

  // ====== 6 位 NPC（左右两侧半圆排开）======
  const npcs = [];
  await Promise.all(characters.map(async (character, i) => {
    const isLeft = i < 3;
    const localIdx = i % 3;
    const angleOffset = isLeft ? -1 : 1;
    // 6 位 NPC 整体往右拨：B 列累计右移 40°，A 列累计右移 60°
    // 原始角度：A 列 -30°/-60°/-90°，B 列 +30°/+60°/+90°
    const SHIFT_A = Math.PI / 3;        // A 列累计右移 60°
    const SHIFT_B = Math.PI / 9 * 2;    // B 列累计右移 40°
    let angle = angleOffset * (Math.PI / 6 + (localIdx / 2) * (Math.PI / 3));
    angle += isLeft ? SHIFT_A : SHIFT_B;

    const r = 6;
    const x = Math.sin(angle) * r;
    const z = -Math.cos(angle) * r;

    // ----- 视觉表现：3D 模型 / 静态画布头像 -----
    // 注意：character.video 字段是给【对话框头像】用的（点 NPC 后才播放），
    // 这里 3D 场景里只用静态头像 sprite——避免 6 个视频在场景里同时循环（"假"）。
    let visualObject;
    let mixer = null;

    if (character.model) {
      // 3D 模型 + idle 动画
      const result = await makeNPCModel(character);
      visualObject = result.model;
      mixer = result.mixer;
      visualObject.position.set(x, 0, z);
      visualObject.lookAt(0, visualObject.position.y, 0);
    } else {
      visualObject = makeNPCSprite(character);
      visualObject.position.set(x, 1.6, z);
      visualObject.scale.set(1.5, 1.8, 1);
    }
    scene.add(visualObject);

    // ----- 透明点击靶（统一 raycast，不管视觉是 sprite 还是 GLB 嵌套）-----
    const clickTarget = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 1.8, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    clickTarget.position.set(x, 0.9, z);
    scene.add(clickTarget);

    // ----- 头顶光环 -----
    const halo = makeHaloSprite();
    halo.position.set(x, 2.5, z);
    halo.scale.set(1.0, 1.0, 1);
    halo.visible = false;
    scene.add(halo);

    // ----- 3D 模型角色加名字小牌（model 本身没有名字文字）-----
    // canvas sprite 头像本身已含名字，不需要额外牌子
    if (character.model) {
      const namePlate = makeNamePlateSprite(character);
      namePlate.position.set(x, 0.2, z);
      namePlate.scale.set(1.6, 0.4, 1);
      scene.add(namePlate);
    }

    npcs[i] = {
      visualObject,
      mixer,
      clickTarget,
      halo,
      character,
      // 让 main.js 的 hover/click 逻辑统一指向 clickTarget
      body: clickTarget,
      head: clickTarget,
    };
  }));

  return { npcs, frames };
}

/** 创建 NPC 圆形头像 sprite（含名字标签）*/
function makeNPCSprite(character) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');

  const cx = 128, cy = 128, radius = 100;

  // 外圈光晕
  const grad = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
  const colorHex = '#' + character.color.toString(16).padStart(6, '0');
  grad.addColorStop(0, lightenColor(colorHex, 0.4));
  grad.addColorStop(1, colorHex);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // 金色描边
  ctx.strokeStyle = '#ffd89a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 3, 0, Math.PI * 2);
  ctx.stroke();

  // 圆心：名字第一个字
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 96px "Noto Serif SC", "PingFang SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.fillText(character.name.charAt(0), cx, cy + 8);

  // 圆下方：完整名字
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 30px "Noto Sans SC", sans-serif';
  ctx.fillText(character.name, cx, 268);

  // 角色身份小字
  ctx.font = '500 18px "Noto Sans SC", sans-serif';
  ctx.fillStyle = '#ffd89a';
  ctx.fillText(character.role, cx, 300);

  return makeSpriteFromCanvas(canvas);
}

/**
 * 视频版 NPC sprite — 用 VideoTexture 替代 canvas。
 * 视频静音循环自动播放（浏览器策略要求 muted 才能 autoplay）。
 */
async function makeNPCVideoSprite(character) {
  const video = document.createElement('video');
  video.src = character.video;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;
  video.crossOrigin = 'anonymous';

  // 等视频元数据 + 第一帧加载（最多等 3 秒，避免卡死场景初始化）
  await new Promise((resolve) => {
    if (video.readyState >= 2) return resolve();
    video.addEventListener('loadeddata', resolve, { once: true });
    video.addEventListener('error', resolve, { once: true });
    setTimeout(resolve, 3000);
  });

  // 触发播放（即使等待超时也尝试）
  video.play().catch(() => {});

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    fog: false,
    depthWrite: false,
  });

  const sprite = new THREE.Sprite(material);
  // 把 video element 挂在 sprite 上，方便后续控制（暂停/继续）
  sprite.userData.video = video;
  return sprite;
}

/**
 * 3D 模型版 NPC — 加载 GLB，自动播放 idle 动画。
 * 返回 { model, mixer }，main.js 每帧调 mixer.update(delta)。
 */
async function makeNPCModel(character) {
  const gltf = await gltfLoader.loadAsync(character.model);
  const model = gltf.scene;

  // 启用阴影（如果以后加灯光阴影会用到）
  model.traverse((node) => {
    if (node.isMesh) {
      node.castShadow = true;
      node.receiveShadow = false;
    }
  });

  let mixer = null;
  if (gltf.animations && gltf.animations.length > 0) {
    mixer = new THREE.AnimationMixer(model);
    // 优先 idle，找不到就用第一个动画
    const idleClip =
      gltf.animations.find((c) => /idle/i.test(c.name)) ||
      gltf.animations[0];
    mixer.clipAction(idleClip).play();
  }

  return { model, mixer };
}

/** 视频角色下方的名字小牌（视频里看不出谁是谁）*/
function makeNamePlateSprite(character) {
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 120;
  const ctx = canvas.getContext('2d');

  // 半透明深色底
  ctx.fillStyle = 'rgba(20, 12, 8, 0.85)';
  ctx.beginPath();
  ctx.roundRect(0, 10, canvas.width, canvas.height - 20, 18);
  ctx.fill();

  // 金色描边
  ctx.strokeStyle = '#c4a878';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(2, 12, canvas.width - 4, canvas.height - 24, 16);
  ctx.stroke();

  // 名字
  ctx.fillStyle = '#ffd89a';
  ctx.font = '700 38px "Noto Serif SC", "PingFang SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(character.name, canvas.width / 2, canvas.height / 2 - 6);

  // 角色身份小字
  ctx.fillStyle = '#c4a878';
  ctx.font = '500 18px "Noto Sans SC", sans-serif';
  ctx.fillText(character.role, canvas.width / 2, canvas.height / 2 + 26);

  return makeSpriteFromCanvas(canvas);
}

/** 目的地画框 sprite */
function makeFrameSprite(destination) {
  const canvas = document.createElement('canvas');
  canvas.width = 384;
  canvas.height = 296;
  const ctx = canvas.getContext('2d');

  // 主体彩色背景
  ctx.fillStyle = '#' + destination.color.toString(16).padStart(6, '0');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 暗化覆盖让文字更清晰
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 木框描边
  ctx.strokeStyle = '#c4a878';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

  // Emoji
  ctx.font = '140px "Apple Color Emoji", "Segoe UI Emoji"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(destination.emoji, canvas.width / 2, canvas.height / 2 - 25);

  // 地名
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 38px "Noto Serif SC", "PingFang SC", serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 6;
  ctx.fillText(destination.name, canvas.width / 2, canvas.height - 50);

  return makeSpriteFromCanvas(canvas);
}

/** 顶部标题（金色横匾感）*/
function makeTitleSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 200;
  const ctx = canvas.getContext('2d');

  // 木质横匾背景
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#3a2818');
  grad.addColorStop(0.5, '#5a3e22');
  grad.addColorStop(1, '#3a2818');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 金边
  ctx.strokeStyle = '#c4a878';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, canvas.width - 16, canvas.height - 16);
  ctx.strokeStyle = '#ffd89a';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // 标题文字
  ctx.fillStyle = '#ffd89a';
  ctx.font = '900 100px "Noto Serif SC", "PingFang SC", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(255, 200, 100, 0.5)';
  ctx.shadowBlur = 16;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 8);

  return makeSpriteFromCanvas(canvas);
}

/** 头顶光环（点击 NPC 时显示）*/
function makeHaloSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  // 径向渐变金光
  const grad = ctx.createRadialGradient(128, 128, 70, 128, 128, 120);
  grad.addColorStop(0, 'rgba(255, 220, 150, 0)');
  grad.addColorStop(0.5, 'rgba(255, 220, 150, 0.9)');
  grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  return makeSpriteFromCanvas(canvas);
}

/** 通用 canvas → Sprite */
function makeSpriteFromCanvas(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    fog: false,
    depthWrite: false,
  });
  return new THREE.Sprite(material);
}

/** 颜色变亮（用于 NPC 头像渐变高光）*/
function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

/** 每帧动画 */
export function updatePlaceholderCamp(scene, delta, elapsed) {
  // 全景静态场景没有动态需求
}

/** 头顶光环旋转 */
export function spinHalos(npcs, elapsed) {
  for (const npc of npcs) {
    if (npc.halo && npc.halo.visible) {
      // Sprite 不能直接 rotate（永远面向相机），但可以缩放呼吸感
      const scale = 1.0 + Math.sin(elapsed * 3) * 0.08;
      npc.halo.scale.set(scale, scale, 1);
    }
  }
}
