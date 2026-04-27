/**
 * VideoModal —— 全屏播放目的地循环动图。
 *
 * 用法：
 *   const modal = new VideoModal();
 *   modal.show(destination);
 *   modal.hide();
 *
 * 优雅降级：如果 mp4 文件不存在（用户还没生成），显示彩色占位 + 等待提示，
 * 仍然可以看到目的地标语，UI 流程不被打断。
 */
export class VideoModal {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'video-modal hidden';
    this.el.innerHTML = `
      <div class="video-modal-content">
        <div class="video-modal-name"></div>
        <div class="video-modal-frame">
          <video class="video-modal-video" loop playsinline muted></video>
          <div class="video-modal-fallback">
            <div class="video-modal-fallback-emoji"></div>
            <div class="video-modal-fallback-hint">等待 AI 生成视频<br><code></code></div>
          </div>
        </div>
        <div class="video-modal-tagline"></div>
        <button class="video-modal-close" aria-label="关闭">✕</button>
      </div>
    `;
    document.body.appendChild(this.el);

    this.nameEl       = this.el.querySelector('.video-modal-name');
    this.frameEl      = this.el.querySelector('.video-modal-frame');
    this.videoEl      = this.el.querySelector('.video-modal-video');
    this.fallbackEl   = this.el.querySelector('.video-modal-fallback');
    this.fallbackEmoji= this.el.querySelector('.video-modal-fallback-emoji');
    this.fallbackHint = this.el.querySelector('.video-modal-fallback code');
    this.taglineEl    = this.el.querySelector('.video-modal-tagline');

    this.el.querySelector('.video-modal-close').addEventListener('click', () => this.hide());

    // 点击背景关闭
    this.el.addEventListener('click', (e) => {
      if (e.target === this.el) this.hide();
    });

    // ESC 关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible()) this.hide();
    });

    // 视频加载失败 → 显示占位
    this.videoEl.addEventListener('error', () => this._showFallback());
  }

  show(destination) {
    this.nameEl.textContent = `${destination.emoji}  ${destination.name}`;
    this.taglineEl.textContent = destination.tagline;

    // 视频帧背景色——用目的地配色当作占位背景
    this.frameEl.style.background = '#' + destination.color.toString(16).padStart(6, '0');
    this.fallbackEmoji.textContent = destination.emoji;
    this.fallbackHint.textContent = destination.video;

    // 尝试加载视频
    this.videoEl.style.display = '';
    this.fallbackEl.style.display = 'none';
    this.videoEl.src = destination.video;
    const playPromise = this.videoEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => this._showFallback());
    }

    this.el.classList.remove('hidden');
  }

  _showFallback() {
    this.videoEl.style.display = 'none';
    this.fallbackEl.style.display = '';
  }

  hide() {
    if (this.el.classList.contains('hidden')) return;
    this.el.classList.add('hidden');
    this.videoEl.pause();
    this.videoEl.removeAttribute('src');
    this.videoEl.load();
  }

  isVisible() {
    return !this.el.classList.contains('hidden');
  }
}
