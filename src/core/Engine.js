import * as THREE from 'three';

/**
 * Engine —— 管理 Three.js 场景、相机、渲染器、主循环。
 * 子场景代码通过 onUpdate(callback) 注册帧回调。
 */
export class Engine {
  constructor(canvas) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      72,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.clock = new THREE.Clock();
    this.updateCallbacks = [];
    this.running = false;

    window.addEventListener('resize', () => this.onResize());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /** 注册每帧调用的函数。回调签名: (delta, elapsed) => void */
  onUpdate(callback) {
    this.updateCallbacks.push(callback);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.clock.start();

    const loop = () => {
      if (!this.running) return;
      const delta = Math.min(this.clock.getDelta(), 0.05); // clamp 防卡顿
      const elapsed = this.clock.elapsedTime;
      for (const cb of this.updateCallbacks) cb(delta, elapsed);
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
  }
}
