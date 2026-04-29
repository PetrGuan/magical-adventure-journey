/**
 * DialogueBox（保留 Subtitle.js 文件名以减少 import 改动）—— 游戏式角色对话框。
 *
 * 内容：
 * - 左侧：角色"视频通话"画面（mp4 自带语音）/ 没视频时降级为彩色名字圆
 * - 右侧：名字 + 身份 + 自我介绍文字
 *
 * 选目的地与选装备走独立卡片（DestinationPicker / EquipmentModal），
 * 这里**只**承载「认识探险伙伴」这一步。
 */
export class Subtitle {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'dialogue-box hidden';
    this.el.innerHTML = `
      <div class="dialogue-portrait">
        <video class="dialogue-portrait-video" playsinline preload="auto"></video>
        <div class="dialogue-portrait-fallback"></div>
        <button class="dialogue-portrait-play" aria-label="播放">▶</button>
      </div>
      <div class="dialogue-content">
        <div class="dialogue-header">
          <div class="dialogue-name"></div>
          <div class="dialogue-role"></div>
        </div>
        <div class="dialogue-text"></div>
      </div>
      <button class="dialogue-close" aria-label="关闭">✕</button>
    `;
    document.body.appendChild(this.el);

    this.portraitVideo    = this.el.querySelector('.dialogue-portrait-video');
    this.portraitFallback = this.el.querySelector('.dialogue-portrait-fallback');
    this.playBtn          = this.el.querySelector('.dialogue-portrait-play');
    this.nameEl           = this.el.querySelector('.dialogue-name');
    this.roleEl           = this.el.querySelector('.dialogue-role');
    this.textEl           = this.el.querySelector('.dialogue-text');

    this.el.querySelector('.dialogue-close').addEventListener('click', () => this.hide());

    this.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.portraitVideo.play().catch(() => {});
    });
    // 视频上点击：只允许「暂停」，不允许「启动播放」。
    // 原因：用户点 NPC 打开对话框时，那次 click 可能穿透到刚冒出来的 video，
    // 如果允许它启动播放，会变成「自动播放」的假象。播放只能通过 ▶ 按钮。
    this.portraitVideo.addEventListener('click', () => {
      if (!this.portraitVideo.paused) this.portraitVideo.pause();
    });
    this.portraitVideo.addEventListener('play',  () => this._setPlayBtn(false));
    this.portraitVideo.addEventListener('pause', () => this._setPlayBtn(true));
    this.portraitVideo.addEventListener('ended', () => this._setPlayBtn(true));

    this.audio = null;
    this.onHidden = null;
  }

  _setPlayBtn(visible) {
    this.playBtn.style.display = visible ? 'flex' : 'none';
  }

  show(character) {
    this._stopMedia();

    if (character.video) {
      this.portraitVideo.src = character.video;
      this.portraitVideo.style.display = 'block';
      this.portraitFallback.style.display = 'none';
      this.portraitVideo.muted = false;
      this.portraitVideo.loop = false;
      this.portraitVideo.currentTime = 0;
      this.portraitVideo.load();
      this.portraitVideo.play().catch(() => {
        this.portraitVideo.muted = true;
        this.portraitVideo.play().catch(() => {});
      });
    } else {
      this.portraitVideo.style.display = 'none';
      this.portraitFallback.style.display = 'flex';
      this._setPlayBtn(false);
      const colorHex = '#' + character.color.toString(16).padStart(6, '0');
      this.portraitFallback.style.background = `radial-gradient(circle at 35% 30%,
        ${lightenHex(character.color, 0.35)}, ${colorHex})`;
      this.portraitFallback.textContent = character.name.charAt(0);
    }

    this.nameEl.textContent = character.name;
    this.roleEl.textContent = character.role;
    this.textEl.textContent = character.speech;
    this.el.classList.remove('hidden');

    if (!character.video && character.audio) {
      this.audio = new Audio(character.audio);
      this.audio.play().catch(() => {});
    }
  }

  _stopMedia() {
    if (this.portraitVideo) {
      this.portraitVideo.pause();
      this.portraitVideo.removeAttribute('src');
      this.portraitVideo.load();
    }
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }
  }

  hide() {
    if (this.el.classList.contains('hidden')) return;
    this.el.classList.add('hidden');
    this._stopMedia();
    if (this.onHidden) this.onHidden();
  }

  isVisible() {
    return !this.el.classList.contains('hidden');
  }
}

function lightenHex(num, amount) {
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}
