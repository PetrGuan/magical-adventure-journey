/**
 * EquipmentModal —— 帐篷里的「装备清单」卡片。
 *
 * 用户点击场景里的帐篷热点 → 弹出此卡片：
 * - 顶部：旁白文字「你在帐篷里发现了很多探险装备……准备带上哪些呢？」
 * - 主体：一张帐篷内装备合成图（纯展示，挑选是心理过程）
 *
 * 关闭：✕ 按钮 / ESC / 点击半透明背景。
 */
export class EquipmentModal {
  constructor(equipment) {
    this.equipment = equipment;

    this.el = document.createElement('div');
    this.el.className = 'equipment-modal hidden';
    this.el.innerHTML = `
      <div class="equipment-modal-content">
        <div class="equipment-modal-prompt"></div>
        <div class="equipment-modal-frame">
          <img class="equipment-modal-image" alt="帐篷里的探险装备">
        </div>
        <button class="equipment-modal-close" aria-label="关闭">✕</button>
      </div>
    `;
    document.body.appendChild(this.el);

    this.promptEl = this.el.querySelector('.equipment-modal-prompt');
    this.imageEl  = this.el.querySelector('.equipment-modal-image');

    this.el.querySelector('.equipment-modal-close').addEventListener('click', () => this.hide());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) this.hide();
    });

    this.promptEl.textContent = equipment.prompt;
    this.imageEl.src = equipment.image;
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  isVisible() {
    return !this.el.classList.contains('hidden');
  }
}
