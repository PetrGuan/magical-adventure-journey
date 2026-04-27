/**
 * Subtitle —— 角色对话字幕（含音频播放）。
 *
 * 用法：
 *   const subtitle = new Subtitle();
 *   subtitle.show(character);  // character 对象见 data.js
 *   subtitle.hide();
 *
 * 优雅降级：如果 mp3 文件不存在（用户还没生成），字幕仍然显示，
 * 自动按文字长度估算时长后隐藏。
 */
export class Subtitle {
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'subtitle hidden';
    this.el.innerHTML = `
      <div class="subtitle-name"></div>
      <div class="subtitle-role"></div>
      <div class="subtitle-text"></div>
      <button class="subtitle-close" aria-label="关闭">✕</button>
    `;
    document.body.appendChild(this.el);

    this.nameEl = this.el.querySelector('.subtitle-name');
    this.roleEl = this.el.querySelector('.subtitle-role');
    this.textEl = this.el.querySelector('.subtitle-text');

    this.el.querySelector('.subtitle-close').addEventListener('click', () => this.hide());

    this.audio = null;
    this.fallbackTimer = null;
    this.onHidden = null;  // 回调（外部用来熄灭 NPC 光环）
  }

  show(character) {
    this._stopAudio();

    this.nameEl.textContent = character.name;
    this.roleEl.textContent = character.role;
    this.textEl.textContent = character.speech;
    this.el.classList.remove('hidden');

    // 播放音频
    let audioWillEnd = false;
    if (character.audio) {
      this.audio = new Audio(character.audio);
      this.audio.addEventListener('ended', () => this.hide());
      this.audio.addEventListener('error', () => {
        // 文件不存在或加载失败，回退到文字定时
        this._scheduleFallback(character.speech);
      });
      const playPromise = this.audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise
          .then(() => { audioWillEnd = true; })
          .catch(() => this._scheduleFallback(character.speech));
      }
    } else {
      this._scheduleFallback(character.speech);
    }

    // 安全网：即使音频未结束，最长 25 秒后自动收回
    this.fallbackTimer = setTimeout(() => {
      if (!audioWillEnd) this.hide();
    }, 25000);
  }

  /** 如果没音频，按字数估算朗读时长（每分钟 ~270 字） */
  _scheduleFallback(text) {
    const charsPerMs = 270 / 60 / 1000; // 字/毫秒
    const estimated = Math.max(8000, text.length / charsPerMs);
    if (this.fallbackTimer) clearTimeout(this.fallbackTimer);
    this.fallbackTimer = setTimeout(() => this.hide(), estimated);
  }

  _stopAudio() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    if (this.fallbackTimer) {
      clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  hide() {
    if (this.el.classList.contains('hidden')) return;
    this.el.classList.add('hidden');
    this._stopAudio();
    if (this.onHidden) this.onHidden();
  }

  isVisible() {
    return !this.el.classList.contains('hidden');
  }
}
