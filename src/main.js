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
import { EquipmentModal } from './ui/EquipmentModal.js';
import { DestinationPicker } from './ui/DestinationPicker.js';
import { BGMPlayer } from './ui/BGMPlayer.js';
import { Diagnostics } from './ui/Diagnostics.js';
import { characters, destinations, equipment } from './data.js';

const BGM_URL = 'assets/audio/bgm.ogg';
const IS_DEBUG = new URLSearchParams(window.location.search).get('debug') === '1';

// 早实例化，确保后续模块的 console / 报错都被捕获
if (IS_DEBUG) new Diagnostics();

// ====== DOM ======
const loadingScreen = document.getElementById('loading-screen');
const enterButton   = document.getElementById('enter-button');
const progressFill  = document.querySelector('.progress-fill');
const progressText  = document.querySelector('.progress-text');
const hud           = document.getElementById('hud');
const canvas        = document.getElementById('canvas');

let engine, player, camp, hotspotManager;
let subtitle, videoModal, equipmentModal, destinationPicker, bgm;

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

  // 6 位 NPC
  camp.npcs.forEach(npc => {
    hotspotManager.register(npc.body, 'npc', npc);
    hotspotManager.register(npc.head, 'npc', npc);
  });
  // 帐篷 → 装备卡 / 远方树 → 目的地选择
  hotspotManager.register(camp.tent, 'tent', null);
  hotspotManager.register(camp.tree, 'tree', null);

  // ====== UI 弹层 ======
  subtitle          = new Subtitle();
  videoModal        = new VideoModal();
  equipmentModal    = new EquipmentModal(equipment);
  destinationPicker = new DestinationPicker(destinations);
  bgm               = new BGMPlayer(BGM_URL);

  subtitle.onHidden = () => {
    camp.npcs.forEach(n => { n.halo.visible = false; });
    bgm.unduck();
  };

  // 远方树点开后选目的地 → 关 picker，弹 VideoModal 播 mp4
  destinationPicker.onPick = (destination) => {
    destinationPicker.hide();
    videoModal.show(destination);
  };

  hotspotManager.onClick = (type, data) => {
    if (type === 'npc')  return onNPCClick(data);
    if (type === 'tent') return onTentClick();
    if (type === 'tree') return onTreeClick();
  };

  // 鼠标 hover 时鼠标已经会变 pointer，暂不做更精细高亮
  hotspotManager.onHover = () => {};

  // ====== 帧循环 ======
  engine.onUpdate((delta, elapsed) => {
    player.update(delta);
    updatePlaceholderCamp(engine.scene, delta, elapsed);
    spinHalos(camp.npcs, elapsed);
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
  const wasShowing = subtitle.isVisible();
  camp.npcs.forEach(n => { n.halo.visible = false; });
  npc.halo.visible = true;
  subtitle.currentNpc = npc;
  subtitle.show(npc.character);
  // 第一次开 NPC 卡片才 duck；从一个 NPC 切到另一个时不重复 duck，
  // 避免 duckCount 失衡。
  if (!wasShowing) bgm.duck();
}

function onTentClick() {
  // 打开装备卡前先把其他卡片收掉，避免叠层
  if (subtitle.isVisible()) subtitle.hide();
  if (destinationPicker.isVisible()) destinationPicker.hide();
  equipmentModal.show();
}

function onTreeClick() {
  if (subtitle.isVisible()) subtitle.hide();
  if (equipmentModal.isVisible()) equipmentModal.hide();
  destinationPicker.show();
}

function enterCamp() {
  loadingScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  engine.start();
  // 借用户点「进入营地」这次手势启动 BGM，绕过浏览器的 autoplay 限制
  bgm.start();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

init().catch(err => {
  console.error('初始化失败:', err);
  progressText.textContent = '加载失败：' + err.message;
});
