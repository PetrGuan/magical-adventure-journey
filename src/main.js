import { Engine } from './core/Engine.js';
import { Player } from './core/Player.js';
import { buildPlaceholderCamp, updatePlaceholderCamp } from './core/PlaceholderCamp.js';

// ====== DOM 引用 ======
const loadingScreen = document.getElementById('loading-screen');
const enterButton   = document.getElementById('enter-button');
const progressFill  = document.querySelector('.progress-fill');
const progressText  = document.querySelector('.progress-text');
const hud           = document.getElementById('hud');
const canvas        = document.getElementById('canvas');

// ====== 全局对象 ======
let engine, player;

// ====== 初始化 ======
async function init() {
  await fakeLoad(); // Phase 1：模拟加载，Phase 2 改成真实资源加载进度

  engine = new Engine(canvas);
  buildPlaceholderCamp(engine.scene);

  player = new Player(engine.camera);
  player.attachControls(canvas);

  // 注册帧回调
  engine.onUpdate((delta, elapsed) => {
    player.update(delta);
    updatePlaceholderCamp(engine.scene, delta, elapsed);
  });

  // 渲染一帧让加载页背后能看到一点点画面（增加期待感）
  engine.renderer.render(engine.scene, engine.camera);

  progressText.textContent = '准备就绪 · 点击进入';
  enterButton.disabled = false;
  enterButton.classList.add('ready');
  enterButton.addEventListener('click', enterCamp);
}

/** Phase 1 占位加载动画 */
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
    await sleep(450);
  }
}

/** 玩家点击「进入营地」 */
function enterCamp() {
  loadingScreen.classList.add('hidden');
  hud.classList.remove('hidden');
  engine.start();
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ====== 启动 ======
init().catch(err => {
  console.error('初始化失败:', err);
  progressText.textContent = '加载失败：' + err.message;
});
