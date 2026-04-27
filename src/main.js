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
  await fakeLoad();

  engine = new Engine(canvas);
  camp = buildPlaceholderCamp(engine.scene, characters, destinations);

  player = new Player(engine.camera);
  player.attachControls(canvas);

  // ====== 交互 ======
  hotspotManager = new HotspotManager(engine.camera, canvas);

  // 注册 6 位 NPC（身体和头都可点）
  camp.npcs.forEach(npc => {
    hotspotManager.registerNPC(npc.body, npc);
    hotspotManager.registerNPC(npc.head, npc);
  });

  // 注册 5 张画框（点内画）
  camp.frames.forEach(frame => {
    hotspotManager.registerFrame(frame.inner, frame);
  });

  // ====== UI ======
  subtitle = new Subtitle();
  videoModal = new VideoModal();

  // 字幕隐藏时熄灭所有 NPC 光环
  subtitle.onHidden = () => {
    camp.npcs.forEach(n => { n.halo.visible = false; });
  };

  // 点击事件
  hotspotManager.onClick = (type, data) => {
    if (type === 'npc') {
      onNPCClick(data);
    } else if (type === 'frame') {
      onFrameClick(data);
    }
  };

  // 悬停事件（高亮 emissive）
  hotspotManager.onHover = (type, data) => {
    // 重置所有
    camp.npcs.forEach(n => {
      n.body.material.emissive.setHex(0x000000);
      n.head.material.emissive.setHex(0x000000);
    });
    camp.frames.forEach(f => {
      f.outer.material.emissive.setHex(0x2a1a08);
    });

    if (type === 'npc') {
      data.body.material.emissive.setHex(0x332211);
      data.head.material.emissive.setHex(0x221a10);
    } else if (type === 'frame') {
      data.outer.material.emissive.setHex(0x6a4a1a);
    }
  };

  // ====== 帧循环 ======
  engine.onUpdate((delta, elapsed) => {
    player.update(delta);
    updatePlaceholderCamp(engine.scene, delta, elapsed);
    spinHalos(camp.npcs, elapsed);
  });

  // 第一帧（让画面在加载页背后渲染好）
  engine.renderer.render(engine.scene, engine.camera);

  progressText.textContent = '准备就绪 · 点击进入';
  enterButton.disabled = false;
  enterButton.classList.add('ready');
  enterButton.addEventListener('click', enterCamp);
}

function onNPCClick(npc) {
  // 如果 subtitle 已经在显示同一个角色，则关闭（再次点击 = 关闭）
  if (subtitle.isVisible() && subtitle.currentNpc === npc) {
    subtitle.hide();
    return;
  }

  // 熄灭其他光环，亮起这个
  camp.npcs.forEach(n => { n.halo.visible = false; });
  npc.halo.visible = true;

  subtitle.currentNpc = npc;
  subtitle.show(npc.character);
}

function onFrameClick(frame) {
  // 打开视频弹窗时，先关字幕
  if (subtitle.isVisible()) subtitle.hide();
  videoModal.show(frame.destination);
}

async function fakeLoad() {
  const stages = [
    { p: 25,  t: '搭建营地……' },
    { p: 50,  t: '点燃篝火……' },
    { p: 75,  t: '集结探险队……' },
    { p: 100, t: '准备就绪' },
  ];
  for (const stage of stages) {
    progressFill.style.width = stage.p + '%';
    progressText.textContent = stage.t;
    await sleep(420);
  }
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
