import { Engine } from './core/Engine.js';
import { Player } from './core/Player.js';
import {
  buildPlaceholderCamp,
  updatePlaceholderCamp,
  spinHalos,
} from './core/PlaceholderCamp.js';
import { HotspotManager } from './core/HotspotManager.js';
import { Subtitle } from './ui/Subtitle.js';
import { VideoModal } from './ui/VideoModal.js';
import { characters, destinations } from './data.js';

// ====== DOM ======
const loadingScreen = document.getElementById('loading-screen');
const enterButton   = document.getElementById('enter-button');
const progressFill  = document.querySelector('.progress-fill');
const progressText  = document.querySelector('.progress-text');
const hud           = document.getElementById('hud');
const canvas        = document.getElementById('canvas');

let engine, player, camp, hotspotManager, subtitle, videoModal;

async function init() {
  // ====== 启动引擎 ======
  setProgress('初始化引擎……', 15);
  engine = new Engine(canvas);
  await sleep(80);

  // ====== 加载营地 + 模型 ======
  setProgress('搭建营地，加载 3D 模型……', 30);
  camp = await buildPlaceholderCamp(engine.scene, characters, destinations);

  // ====== 玩家控制 ======
  setProgress('集结探险队……', 75);
  player = new Player(engine.camera);
  player.attachControls(canvas);
  await sleep(80);

  // ====== 交互系统 ======
  hotspotManager = new HotspotManager(engine.camera, canvas);

  camp.npcs.forEach(npc => {
    hotspotManager.registerNPC(npc.body, npc);
    hotspotManager.registerNPC(npc.head, npc);
  });
  // 目的地不再以画框形式存在场景中——但保留 hotspot 系统，未来或许有新用途
  // (camp.frames 现在恒为 [])

  subtitle = new Subtitle(destinations);
  videoModal = new VideoModal();

  subtitle.onHidden = () => {
    camp.npcs.forEach(n => { n.halo.visible = false; });
  };

  // 对话框里点目的地按钮 → 播放该场景的视频
  subtitle.onDestinationClick = (destination) => {
    videoModal.show(destination);
  };

  hotspotManager.onClick = (type, data) => {
    if (type === 'npc') onNPCClick(data);
  };

  // 鼠标 hover 时鼠标已经会变 pointer，暂不做更精细高亮
  // （sprite/视频/3D 模型混合，emissive 不通用，留待 polish 阶段）
  hotspotManager.onHover = () => {};

  // ====== 帧循环 ======
  engine.onUpdate((delta, elapsed) => {
    player.update(delta);
    updatePlaceholderCamp(engine.scene, delta, elapsed);
    spinHalos(camp.npcs, elapsed);
    // 3D 角色 idle 动画驱动
    camp.npcs.forEach(n => {
      if (n.mixer) n.mixer.update(delta);
    });
  });

  // 渲染一帧给加载页背后
  engine.renderer.render(engine.scene, engine.camera);

  // ====== 就绪 ======
  setProgress('准备就绪 · 点击进入', 100);
  enterButton.disabled = false;
  enterButton.classList.add('ready');
  enterButton.addEventListener('click', enterCamp);
}

function setProgress(text, percent) {
  progressText.textContent = text;
  progressFill.style.width = percent + '%';
}

function onNPCClick(npc) {
  if (subtitle.isVisible() && subtitle.currentNpc === npc) {
    subtitle.hide();
    return;
  }
  camp.npcs.forEach(n => { n.halo.visible = false; });
  npc.halo.visible = true;
  subtitle.currentNpc = npc;
  subtitle.show(npc.character);
}

function onFrameClick(frame) {
  if (subtitle.isVisible()) subtitle.hide();
  videoModal.show(frame.destination);
}

function enterCamp() {
  loadingScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  engine.start();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

init().catch(err => {
  console.error('初始化失败:', err);
  progressText.textContent = '加载失败：' + err.message;
});
