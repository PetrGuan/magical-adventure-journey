/**
 * DestinationPicker —— 远方树/标记物的「目的地选择」卡片。
 *
 * 用户点击场景里的树热点 → 弹出此卡片：
 * - 顶部：旁白「你想去哪里探险呢？」
 * - 主体：5 个目的地按钮（沙漠 / 雨林 / 荒岛 / 洞穴 / 冰川）
 * - 点击 → 触发 onPick(destination)，由 main.js 转交 VideoModal 播 mp4。
 */
export class DestinationPicker {
  constructor(destinations) {
    this.destinations = destinations || [];

    this.el = document.createElement('div');
    this.el.className = 'destination-picker hidden';
    this.el.innerHTML = `
      <div class="destination-picker-content">
        <div class="destination-picker-prompt">你想去哪里探险呢？</div>
        <div class="destination-picker-grid"></div>
        <button class="destination-picker-close" aria-label="关闭">✕</button>
      </div>
    `;
    document.body.appendChild(this.el);

    this.gridEl = this.el.querySelector('.destination-picker-grid');

    this.el.querySelector('.destination-picker-close').addEventListener('click', () => this.hide());
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) this.hide();
    });

    this.onPick = null;
    this._render();
  }

  _render() {
    this.gridEl.innerHTML = '';
    this.destinations.forEach((dest) => {
      const btn = document.createElement('button');
      btn.className = 'destination-picker-btn';
      btn.style.background = `linear-gradient(135deg,
        #${dest.color.toString(16).padStart(6, '0')},
        #${darkenHex(dest.color, 0.3).toString(16).padStart(6, '0')})`;
      btn.innerHTML = `
        <span class="destination-picker-emoji">${dest.emoji}</span>
        <span class="destination-picker-name">${dest.name}</span>
      `;
      btn.addEventListener('click', () => {
        if (this.onPick) this.onPick(dest);
      });
      this.gridEl.appendChild(btn);
    });
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

function darkenHex(num, amount) {
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.floor(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.floor(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.floor(255 * amount));
  return (r << 16) | (g << 8) | b;
}
