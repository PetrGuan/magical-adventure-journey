/**
 * DialogueBox（保留 Subtitle.js 文件名以减少 import 改动）—— 游戏式对话框。
 *
 * 内容：
 * - 左侧：角色"视频通话"画面（mp4 自带语音）/ 没视频时降级为彩色名字圆
 * - 中间：名字 + 身份 + 自我介绍文字
 * - 底部：5 个探险地选项按钮
 *
 * 点击探险地 → 调用 onDestinationClick（main.js 接到 VideoModal）。
 */
export class Subtitle {
  /**
   * @param {Array} destinations 5 个目的地数据
   */
  constructor(destinations) {
    this.destinations = destinations || [];

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
        <div class="dialogue-destinations-label">想去哪里探险？</div>
        <div class="dialogue-destinations"></div>
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
    this.destEl           = this.el.querySelector('.dialogue-destinations');

    this.el.querySelector('.dialogue-close').addEventListener('click', () => this.hide());

    // 播放按钮 / 视频点击控制
    this.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.portraitVideo.play().catch(() => {});
    });
    // 视频上点击：只允许"暂停"，不允许"启动播放"。
    // 原因：用户点 NPC 打开对话框时，那次 click 可能穿透到刚冒出来的 video，
    // 如果允许它启动播放，会变成"自动播放"的假象。播放只能通过 ▶ 按钮。
    this.portraitVideo.addEventListener('click', () => {
      if (!this.portraitVideo.paused) this.portraitVideo.pause();
    });
    // 视频状态 → 控制播放按钮显示
    this.portraitVideo.addEventListener('play',  () => this._setPlayBtn(false));
    this.portraitVideo.addEventListener('pause', () => this._setPlayBtn(true));
    this.portraitVideo.addEventListener('ended', () => {
      this._setPlayBtn(true);
      // 不循环——停在最后一帧；如果想看第一帧，下次点会从头开始
    });

    this.audio = null;
    this.onHidden = null;
    this.onDestinationClick = null;

    this._renderDestinations();
  }

  _setPlayBtn(visible) {
    this.playBtn.style.display = visible ? 'flex' : 'none';
  }

  _renderDestinations() {
    this.destEl.innerHTML = '';
    this.destinations.forEach((dest) => {
      const btn = document.createElement('button');
      btn.className = 'dialogue-dest-btn';
      btn.style.background = `linear-gradient(135deg,
        #${dest.color.toString(16).padStart(6, '0')},
        #${darkenHex(dest.color, 0.3).toString(16).padStart(6, '0')})`;
      btn.innerHTML = `
        <span class="dialogue-dest-emoji">${dest.emoji}</span>
        <span class="dialogue-dest-name">${dest.name}</span>
      `;
      btn.addEventListener('click', () => {
        if (this.onDestinationClick) this.onDestinationClick(dest);
      });
      this.destEl.appendChild(btn);
    });
  }

  show(character) {
    this._stopMedia();

    // ----- 头像区：优先视频 -----
    if (character.video) {
      this.portraitVideo.src = character.video;
      this.portraitVideo.style.display = 'block';
      this.portraitFallback.style.display = 'none';
      this.portraitVideo.muted = false;
      this.portraitVideo.loop = false;
      this.portraitVideo.currentTime = 0;
      this.portraitVideo.load();
      // 用户点击 NPC = 用户手势，浏览器允许带声播放
      this.portraitVideo.play().catch(() => {
        // 个别浏览器 autoplay-with-sound 仍受限——退化到静音播放
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

    // ----- 没视频但有 audio mp3 时降级 -----
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

// ====== 颜色工具 ======
function lightenHex(num, amount) {
  const r = Math.min(255, ((num >> 16) & 0xff) + Math.floor(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0xff) + Math.floor(255 * amount));
  const b = Math.min(255, (num & 0xff) + Math.floor(255 * amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function darkenHex(num, amount) {
  const r = Math.max(0, ((num >> 16) & 0xff) - Math.floor(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0xff) - Math.floor(255 * amount));
  const b = Math.max(0, (num & 0xff) - Math.floor(255 * amount));
  return (r << 16) | (g << 8) | b;
}
