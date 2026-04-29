import * as THREE from 'three';

/**
 * 全景大本营场景。
 * 学生站在球心，背景是 360° 全景图（来自 AI 生成的真实感图像）。
 * 6 个 NPC sprite 漂浮在球内空间。点击 NPC 弹出对话框（带视频）。
 * 学生只能转视角，不能移动。
 */

const PANORAMA_URL = 'assets/skybox/Weixin%20Image_20260428014523_165_76.jpg';
const IS_FILE_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'file:';

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
 * @returns {{ npcs, tent, tree }}
 */
export async function buildPlaceholderCamp(scene, characters, destinations) {
  // ====== 全景背景 ======
  const panoTex = IS_FILE_PROTOCOL ? null : await loadPanorama(PANORAMA_URL);
  if (panoTex) {
    scene.background = panoTex;
    scene.environment = panoTex;
  } else {
    // file:// 离线打开时，避免加载外部图片纹理触发浏览器跨域安全限制。
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

  // ====== 帐篷热点（陈老师与王叔叔之间，地面位置）======
  // 王叔叔(A1) 在角度 +π/6 (≈30°)，陈老师(A2) 在角度 0°，
  // 帐篷位于二人之间偏前的地面上：角度 π/12 (≈15°)，r=5。
  const tentAngle = Math.PI / 12;
  const tentR = 5;
  const tentX = Math.sin(tentAngle) * tentR;
  const tentZ = -Math.cos(tentAngle) * tentR;
  const tentSprite = makeTentMarkerSprite();
  tentSprite.scale.set(1.4, 1.575, 1);
  tentSprite.position.set(tentX, 2.0, tentZ);
  tentSprite.userData.kind = 'tent';
  scene.add(tentSprite);

  // ====== 远方一棵树（左前方）热点 ======
  // 角度 -π/3 (≈-60°)，r=8，让树位于 A 组左外侧远处。
  const treeAngle = -Math.PI / 3;
  const treeR = 8;
  const treeX = Math.sin(treeAngle) * treeR;
  const treeZ = -Math.cos(treeAngle) * treeR;
  const treeSprite = makeTreeMarkerSprite();
  treeSprite.scale.set(1.6, 1.8, 1);
  treeSprite.position.set(treeX, 2.4, treeZ);
  treeSprite.userData.kind = 'tree';
  scene.add(treeSprite);

  // ====== 6 位 NPC（位置由 character.position 直接给出）======
  // 这些坐标是 2026-04-29 用 LayoutEditor 拖拽确定的，写在 src/data.js 里。
  const SPRITE_HEIGHT = 2.2;     // sprite 总高度
  const HIT_HEIGHT    = 2.2;     // 点击靶柱高度
  const HALO_OFFSET_Y = 1.45;    // 头顶光环相对 sprite 中心的 Y 偏移

  const npcs = [];
  await Promise.all(characters.map(async (character, i) => {
    const { x, y, z } = character.position;

    // ----- 视觉表现：从视频抽帧，做去白底人像 -----
    const visualObject = await makeNPCSprite(character);
    const spriteAspect = visualObject.userData?.aspect || 0.74;
    const spriteWidth = SPRITE_HEIGHT * spriteAspect;
    visualObject.position.set(x, y, z);
    visualObject.scale.set(spriteWidth, SPRITE_HEIGHT, 1);
    scene.add(visualObject);

    // ----- 透明点击靶（统一 raycast，不管视觉是 sprite 还是 GLB 嵌套）-----
    const clickTarget = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, HIT_HEIGHT, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    clickTarget.position.set(x, y, z);
    scene.add(clickTarget);

    // ----- 头顶光环 -----
    const halo = makeHaloSprite();
    halo.position.set(x, y + HALO_OFFSET_Y, z);
    halo.scale.set(1.0, 1.0, 1);
    halo.visible = false;
    scene.add(halo);

    npcs[i] = {
      visualObject,
      clickTarget,
      halo,
      character,
      // 让 main.js 的 hover/click 逻辑统一指向 clickTarget
      body: clickTarget,
      head: clickTarget,
    };
  }));

  return { npcs, tent: tentSprite, tree: treeSprite };
}

/**
 * 「可点击」提示标记 —— 通用 POI 标识：金光环 + 中心 emoji + 文字标签。
 * 全景图本身已含真实帐篷与树木，标记只负责告诉学生「这里可以点」。
 */
function makePoiMarkerSprite(emoji, label) {
  const W = 320;
  const H = 360;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const cx = W / 2;
  const cy = 132;
  const ringR = 60;

  // 外发光晕
  const glow = ctx.createRadialGradient(cx, cy, ringR * 0.4, cx, cy, ringR * 2.2);
  glow.addColorStop(0, 'rgba(255, 220, 150, 0.55)');
  glow.addColorStop(0.5, 'rgba(255, 200, 110, 0.22)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // 圆形玻璃底盘
  ctx.beginPath();
  ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(20, 12, 6, 0.55)';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ffd89a';
  ctx.shadowColor = 'rgba(255, 200, 100, 0.85)';
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 中心 emoji
  ctx.font = '64px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, cx, cy + 4);

  // 文字标签
  ctx.fillStyle = '#fff7df';
  ctx.font = '700 28px "Noto Serif SC", "PingFang SC", serif';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
  ctx.shadowBlur = 10;
  ctx.fillText(label, cx, cy + ringR + 38);
  ctx.shadowBlur = 0;

  // 提示小三角（指向下方真实物体）
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy + ringR + 6);
  ctx.lineTo(cx + 10, cy + ringR + 6);
  ctx.lineTo(cx, cy + ringR + 18);
  ctx.closePath();
  ctx.fillStyle = '#ffd89a';
  ctx.fill();

  return makeSpriteFromCanvas(canvas);
}

function makeTentMarkerSprite() {
  return makePoiMarkerSprite('🏕️', '帐篷');
}

function makeTreeMarkerSprite() {
  return makePoiMarkerSprite('🧭', '去哪儿探险？');
}

/** 创建 NPC 人像 sprite：优先从角色视频抽帧并去白底 */
async function makeNPCSprite(character) {
  if (IS_FILE_PROTOCOL) {
    const offlineSprite = makeNPCFallbackSprite(character);
    offlineSprite.userData.aspect = 0.74;
    return offlineSprite;
  }

  if (character.video) {
    const frameCanvas = await captureVideoFrameCanvas(character.video);
    if (frameCanvas) {
      try {
        const portraitCanvas = createWhiteKeyPortraitCanvas(frameCanvas);
        if (portraitCanvas) {
          const sprite = makeSpriteFromCanvas(portraitCanvas);
          sprite.userData.aspect = portraitCanvas.width / portraitCanvas.height;
          return sprite;
        }
      } catch (err) {
        console.warn('[Portrait] 抠像失败，自动回退原始帧：', err);
      }

      const frameSprite = makeSpriteFromCanvas(frameCanvas);
      frameSprite.userData.aspect = frameCanvas.width / frameCanvas.height;
      return frameSprite;
    }
  }

  // 回退：不再显示“姓氏单字”，而是无文字的中性人物牌。
  const fallbackSprite = makeNPCFallbackSprite(character);
  fallbackSprite.userData.aspect = 0.74;
  return fallbackSprite;
}

/** 从角色视频抓取一帧（用于场景静态人像） */
function captureVideoFrameCanvas(url) {
  if (!url) return Promise.resolve(null);

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    let settled = false;

    const cleanup = () => {
      try {
        video.pause();
      } catch (_) {}
      video.removeAttribute('src');
      video.load();
    };

    const finish = (result) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(result);
    };

    const fail = (reason) => {
      console.warn(`[Portrait] 视频抽帧失败 ${url}:`, reason);
      finish(null);
    };

    const capture = () => {
      try {
        const srcW = video.videoWidth;
        const srcH = video.videoHeight;
        if (!srcW || !srcH) {
          fail('无效视频尺寸');
          return;
        }

        const maxHeight = 720;
        const scale = Math.min(1, maxHeight / srcH);
        const width = Math.max(1, Math.round(srcW * scale));
        const height = Math.max(1, Math.round(srcH * scale));

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          fail('无法创建 2D canvas');
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        finish(canvas);
      } catch (err) {
        fail(err);
      }
    };

    video.addEventListener('error', () => {
      fail(video.error || 'video load error');
    }, { once: true });

    video.addEventListener('loadedmetadata', () => {
      const seekTime = Number.isFinite(video.duration) && video.duration > 0.35 ? 0.3 : 0;
      if (seekTime > 0) {
        video.addEventListener('seeked', capture, { once: true });
        try {
          video.currentTime = seekTime;
        } catch (_) {
          if (video.readyState >= 2) capture();
          else video.addEventListener('loadeddata', capture, { once: true });
        }
      } else if (video.readyState >= 2) {
        capture();
      } else {
        video.addEventListener('loadeddata', capture, { once: true });
      }
    }, { once: true });

    video.src = url;
    video.load();
  });
}

/** 近白色抠像：把视频白底转为透明，并裁掉多余空白 */
function createWhiteKeyPortraitCanvas(sourceCanvas) {
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  if (!width || !height) return null;

  // 清理视频左上角常见的 "AI 生成" 水印区域（做羽化避免硬边）。
  const watermarkWidth = Math.max(40, Math.round(width * 0.2));
  const watermarkHeight = Math.max(28, Math.round(height * 0.1));
  const watermarkFeather = Math.max(8, Math.round(Math.min(width, height) * 0.015));

  const workCanvas = document.createElement('canvas');
  workCanvas.width = width;
  workCanvas.height = height;
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true });
  if (!workCtx) return null;

  workCtx.drawImage(sourceCanvas, 0, 0, width, height);
  let imageData;
  try {
    imageData = workCtx.getImageData(0, 0, width, height);
  } catch (err) {
    // 某些环境（尤其 file://）会触发 tainted canvas，返回 null 走上层回退。
    console.warn('[Portrait] 无法读取像素数据，跳过抠像：', err);
    return null;
  }
  const data = imageData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const pixelIndex = i / 4;
    const px = pixelIndex % width;
    const py = Math.floor(pixelIndex / width);

    const maxRGB = Math.max(r, g, b);
    const minRGB = Math.min(r, g, b);
    const saturation = maxRGB === 0 ? 0 : (maxRGB - minRGB) / maxRGB;

    const keepByBrightness = clamp01((228 - minRGB) / 45);
    const keepBySaturation = clamp01((saturation - 0.07) / 0.2);
    const skinHint = r > 95 && g > 40 && b > 20 && r > b + 15;

    let alpha = Math.max(keepByBrightness, keepBySaturation);
    if (skinHint) alpha = Math.max(alpha, 0.75);

    alpha = Math.pow(alpha, 0.9);
    let alphaByte = Math.round(alpha * 255);

    if (px < watermarkWidth && py < watermarkHeight) {
      const edgeX = (watermarkWidth - px) / watermarkFeather;
      const edgeY = (watermarkHeight - py) / watermarkFeather;
      const cutStrength = clamp01(Math.min(edgeX, edgeY));
      alphaByte = Math.round(alphaByte * (1 - cutStrength));
    }

    data[i + 3] = alphaByte;

    if (alphaByte > 22) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;

      // 消一点白边，减少头发边缘发灰发白。
      if (alphaByte < 230) {
        const edgeMix = (255 - alphaByte) / 255;
        const darken = 1 - edgeMix * 0.25;
        data[i] = Math.round(r * darken);
        data[i + 1] = Math.round(g * darken);
        data[i + 2] = Math.round(b * darken);
      }
    }
  }

  workCtx.putImageData(imageData, 0, 0);

  if (maxX < minX || maxY < minY) return null;

  const padX = Math.round(width * 0.035);
  const padTop = Math.round(height * 0.04);
  const padBottom = Math.round(height * 0.02);

  const cropX = Math.max(0, minX - padX);
  const cropY = Math.max(0, minY - padTop);
  const cropW = Math.min(width - cropX, (maxX - minX + 1) + padX * 2);
  const cropH = Math.min(height - cropY, (maxY - minY + 1) + padTop + padBottom);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = cropW;
  outCanvas.height = cropH;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return null;

  outCtx.drawImage(workCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return outCanvas;
}

/** 抠像失败时的保底牌（无姓氏文字） */
function makeNPCFallbackSprite(character) {
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 440;
  const ctx = canvas.getContext('2d');

  const colorHex = '#' + character.color.toString(16).padStart(6, '0');

  // 柔和背光
  const glow = ctx.createRadialGradient(160, 190, 40, 160, 190, 180);
  glow.addColorStop(0, lightenColor(colorHex, 0.45));
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 人像底牌
  ctx.fillStyle = 'rgba(30, 22, 16, 0.72)';
  roundRect(ctx, 58, 78, 204, 306, 34);
  ctx.fill();
  ctx.strokeStyle = '#ffd89a';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 头部
  ctx.fillStyle = '#f2e8dc';
  ctx.beginPath();
  ctx.arc(160, 170, 56, 0, Math.PI * 2);
  ctx.fill();

  // 肩部
  ctx.beginPath();
  ctx.moveTo(90, 336);
  ctx.quadraticCurveTo(160, 232, 230, 336);
  ctx.lineTo(230, 358);
  ctx.lineTo(90, 358);
  ctx.closePath();
  ctx.fill();

  return makeSpriteFromCanvas(canvas);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
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
