import * as THREE from 'three';

/**
 * 全景大本营场景。
 * 学生站在球心，背景是 360° 全景图（来自 AI 生成的真实感图像）。
 * 6 个 NPC sprite + 5 个目的地画框漂浮在球内空间。
 * 学生只能转视角，不能移动。
 */

const PANORAMA_URL = 'assets/skybox/base-camp.jpg';

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

  // ====== 灯光（sprite 基本不需要，但保留一点环境氛围）======
  scene.add(new THREE.AmbientLight(0xffffff, 1.0));

  // ====== 顶部标题牌 ======
  const titleSprite = makeTitleSprite('探险大本营');
  titleSprite.position.set(0, 6, -8);
  titleSprite.scale.set(8, 1.6, 1);
  scene.add(titleSprite);

  // ====== 5 张目的地画框（学生正前方一面"墙"）======
  const frames = [];
  destinations.forEach((destination, i) => {
    const x = -7 + i * 3.5;
    const y = 2.6;
    const z = -10;

    const sprite = makeFrameSprite(destination);
    sprite.position.set(x, y, z);
    sprite.scale.set(2.6, 2.0, 1);
    scene.add(sprite);

    frames.push({ sprite, inner: sprite, outer: sprite, destination });
  });

  // ====== 6 位 NPC（左右两侧半圆排开）======
  const npcs = [];
  characters.forEach((character, i) => {
    const isLeft = i < 3;
    const localIdx = i % 3;
    const angleOffset = isLeft ? -1 : 1;
    // 半圆：A 列在左 -90°~-30°，B 列在右 +30°~+90°
    const angle = angleOffset * (Math.PI / 6 + (localIdx / 2) * (Math.PI / 3));
    const r = 6;
    const x = Math.sin(angle) * r;
    const z = -Math.cos(angle) * r;

    const sprite = makeNPCSprite(character);
    sprite.position.set(x, 1.6, z);
    sprite.scale.set(1.5, 1.8, 1);

    const halo = makeHaloSprite();
    halo.position.set(x, 2.7, z);
    halo.scale.set(1.0, 1.0, 1);
    halo.visible = false;

    scene.add(sprite);
    scene.add(halo);

    npcs.push({
      sprite,
      halo,
      character,
      // 兼容现有 main.js 的 hover/click 逻辑（用 sprite 当 body+head）
      body: sprite,
      head: sprite,
    });
  });

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
