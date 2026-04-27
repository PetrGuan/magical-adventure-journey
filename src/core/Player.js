import * as THREE from 'three';

const PLAYER_HEIGHT = 1.6; // 米
const MOVE_SPEED = 3.0;    // 米/秒
const BOUNDARY_RADIUS = 12; // 米，营地半径
const ROTATE_SPEED = 0.0035; // 鼠标灵敏度
const PITCH_LIMIT = Math.PI / 2.2; // 上下视角限幅

/**
 * Player —— 第一人称控制器（鼠标拖动转视角 + WASD 移动）。
 * 没有锁定鼠标（PointerLock），五年级零学习成本。
 */
export class Player {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, PLAYER_HEIGHT, 6);
    this.yaw = 0;    // 左右朝向（绕 Y 轴）
    this.pitch = 0;  // 上下俯仰

    this.keys = Object.create(null);
    this.dragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.updatePose();
  }

  attachControls(canvas) {
    // 鼠标拖动转视角（左键按住）
    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.dragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    window.addEventListener('mouseup', () => { this.dragging = false; });
    window.addEventListener('mouseleave', () => { this.dragging = false; });
    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;

      this.yaw -= dx * ROTATE_SPEED;
      this.pitch -= dy * ROTATE_SPEED;
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
      this.updatePose();
    });

    // 触屏支持（教室如果用触屏大屏）
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      this.dragging = true;
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    });
    window.addEventListener('touchend', () => { this.dragging = false; });
    window.addEventListener('touchmove', (e) => {
      if (!this.dragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      const dx = t.clientX - this.lastMouseX;
      const dy = t.clientY - this.lastMouseY;
      this.lastMouseX = t.clientX;
      this.lastMouseY = t.clientY;

      this.yaw -= dx * ROTATE_SPEED;
      this.pitch -= dy * ROTATE_SPEED;
      this.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, this.pitch));
      this.updatePose();
    });

    // 键盘 WASD
    window.addEventListener('keydown', (e) => { this.keys[e.code] = true; });
    window.addEventListener('keyup',   (e) => { this.keys[e.code] = false; });
    // 失焦时清空按键，防止粘键
    window.addEventListener('blur', () => { this.keys = Object.create(null); });
  }

  /** 每帧调用，更新移动 */
  update(delta) {
    let dx = 0, dz = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp'])    dz -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown'])  dz += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft'])  dx -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx += 1;

    if (dx === 0 && dz === 0) return;

    // 归一化方向
    const len = Math.hypot(dx, dz);
    dx /= len;
    dz /= len;

    // 按相机朝向（yaw）旋转，让 W 朝玩家看的方向走
    const sin = Math.sin(this.yaw);
    const cos = Math.cos(this.yaw);
    const worldX = dx * cos + dz * sin;
    const worldZ = -dx * sin + dz * cos;

    const distance = MOVE_SPEED * delta;
    this.position.x += worldX * distance;
    this.position.z += worldZ * distance;

    // 圆形边界裁剪——不能走出营地
    const r = Math.hypot(this.position.x, this.position.z);
    if (r > BOUNDARY_RADIUS) {
      this.position.x *= BOUNDARY_RADIUS / r;
      this.position.z *= BOUNDARY_RADIUS / r;
    }

    this.updatePose();
  }

  /** 把 yaw / pitch / position 应用到相机 */
  updatePose() {
    this.camera.position.copy(this.position);
    const cosP = Math.cos(this.pitch);
    const lookX = this.position.x - Math.sin(this.yaw) * cosP;
    const lookY = this.position.y + Math.sin(this.pitch);
    const lookZ = this.position.z - Math.cos(this.yaw) * cosP;
    this.camera.lookAt(lookX, lookY, lookZ);
  }
}
