import * as THREE from 'three';

const PLAYER_HEIGHT = 1.6;
const ROTATE_SPEED = 0.0035;
const PITCH_LIMIT = Math.PI / 2.2;

/**
 * Player —— 站在原地的"看客"。
 * 全景模式下学生只能转视角，不能走动。
 */
export class Player {
  constructor(camera) {
    this.camera = camera;
    this.position = new THREE.Vector3(0, PLAYER_HEIGHT, 0);
    this.yaw = 0;
    this.pitch = 0;

    this.dragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;

    this.updatePose();
  }

  attachControls(canvas) {
    canvas.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      this.dragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });
    window.addEventListener('mouseup',    () => { this.dragging = false; });
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

    // 触屏（教室触屏大屏支持）
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
  }

  /** 全景模式：站着不动，每帧无需更新位置 */
  update() {}

  updatePose() {
    this.camera.position.copy(this.position);
    const cosP = Math.cos(this.pitch);
    const lookX = this.position.x - Math.sin(this.yaw) * cosP;
    const lookY = this.position.y + Math.sin(this.pitch);
    const lookZ = this.position.z - Math.cos(this.yaw) * cosP;
    this.camera.lookAt(lookX, lookY, lookZ);
  }
}
