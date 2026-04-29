import * as THREE from 'three';

/**
 * HotspotManager —— 用 raycaster 检测鼠标点击/悬停在 3D 场景里的可交互物体。
 *
 * 注册：register(mesh, type, data)
 * 回调：onClick(type, data), onHover(type, data | null)
 *   - type: 'npc' | 'tent' | 'tree' | ……
 *   - data: 注册时传入的对象（含 character / equipment / destinations 等）
 */
export class HotspotManager {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.hotspotMeshes = []; // 所有可点击的 mesh

    this.hoveredData = null;
    this.dragStart = null;

    this.onClick = null;
    this.onHover = null;

    this._setupListeners();
  }

  register(mesh, type, data) {
    mesh.userData.hotspot = { type, data };
    this.hotspotMeshes.push(mesh);
  }

  _setupListeners() {
    // 区分"点击"和"拖动转视角"——按下时记录起点，松开时如果位移 < 5px 才算点击
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.dragStart = { x: e.clientX, y: e.clientY };
      }
    });

    this.canvas.addEventListener('mouseup', (e) => {
      if (e.button !== 0 || !this.dragStart) return;
      const dx = e.clientX - this.dragStart.x;
      const dy = e.clientY - this.dragStart.y;
      const moved = Math.hypot(dx, dy);
      this.dragStart = null;

      if (moved < 5) {
        this._handleClick(e);
      }
    });

    this.canvas.addEventListener('mousemove', (e) => this._handleHover(e));
    this.canvas.addEventListener('mouseleave', () => this._setHover(null));
  }

  _updateMouseCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  }

  _intersect() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.hotspotMeshes, false);
  }

  _handleClick(e) {
    this._updateMouseCoords(e);
    const hits = this._intersect();
    if (hits.length === 0) return;

    const hotspot = hits[0].object.userData.hotspot;
    if (hotspot && this.onClick) {
      this.onClick(hotspot.type, hotspot.data);
    }
  }

  _handleHover(e) {
    this._updateMouseCoords(e);
    const hits = this._intersect();
    const hotspot = hits.length > 0 ? hits[0].object.userData.hotspot : null;
    this._setHover(hotspot);
  }

  _setHover(hotspot) {
    if (hotspot === this.hoveredData) return;
    this.hoveredData = hotspot;
    this.canvas.style.cursor = hotspot ? 'pointer' : 'grab';
    if (this.onHover) {
      this.onHover(
        hotspot ? hotspot.type : null,
        hotspot ? hotspot.data : null
      );
    }
  }
}
