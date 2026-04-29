/**
 * BGMPlayer —— 背景音乐控制。
 *
 * - `start()` 由用户首次手势（点「进入营地」）触发，绕开浏览器自动播放策略。
 * - `duck()` / `unduck()` 在 NPC 讲话期间临时静音背景音，
 *   让学生听清角色介绍。多次 duck 会被 unduck 抵消（计数式，安全多次调用）。
 */
export class BGMPlayer {
  constructor(src, { volume = 0.35 } = {}) {
    this.audio = new Audio(src);
    this.audio.loop = true;
    this.audio.volume = volume;
    this.audio.preload = 'auto';

    this.preferPlaying = false;
    this.duckCount = 0;
  }

  start() {
    this.preferPlaying = true;
    if (this.duckCount === 0) this._tryPlay();
  }

  duck() {
    this.duckCount++;
    if (this.duckCount === 1) this.audio.pause();
  }

  unduck() {
    if (this.duckCount === 0) return;
    this.duckCount--;
    if (this.duckCount === 0 && this.preferPlaying) this._tryPlay();
  }

  _tryPlay() {
    const p = this.audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch((err) => console.warn('[BGM] 播放失败:', err));
    }
  }
}
