/**
 * Diagnostics —— ?debug=1 时启用的屏上调试日志面板。
 *
 * 截获：
 * - console.log / info / warn / error（保留原行为）
 * - window 'error' 事件（脚本异常 + 资源加载失败 <img>/<video>/<audio>/<script>）
 * - window 'unhandledrejection' 事件（Promise 错误）
 *
 * 给老师/客户截图诊断时使用，不需要 F12。带「📋 复制日志」一键打包给开发者。
 */
export class Diagnostics {
  constructor() {
    this.lines = [];
    this.maxLines = 200;

    this._buildPanel();
    this._installHooks();
    this._collectStartupInfo();
  }

  log(level, ...args) {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    const text = args.map(a => this._stringify(a)).join(' ');
    const line = { time, level, text };
    this.lines.push(line);
    if (this.lines.length > this.maxLines) this.lines.shift();
    this._render();
  }

  _stringify(v) {
    if (v == null) return String(v);
    if (typeof v === 'string') return v;
    if (v instanceof Error) {
      return (v.message || 'Error') + (v.stack ? '\n' + v.stack : '');
    }
    if (v instanceof Event) {
      const t = v.target;
      const tag = t && t.tagName ? t.tagName.toLowerCase() : '';
      const src = t && (t.src || t.currentSrc || t.href || '');
      return `${v.type} <${tag}> ${src}`;
    }
    try { return JSON.stringify(v); } catch (_) { return String(v); }
  }

  _buildPanel() {
    this.el = document.createElement('div');
    this.el.className = 'diag-panel';
    this.el.innerHTML = `
      <div class="diag-header">
        <span class="diag-title">🔍 调试日志</span>
        <button class="diag-copy" type="button">📋 复制全部</button>
        <button class="diag-min" type="button" title="折叠/展开">━</button>
      </div>
      <div class="diag-log"></div>
    `;
    document.body.appendChild(this.el);

    this.logEl = this.el.querySelector('.diag-log');

    this.el.querySelector('.diag-copy').addEventListener('click', () => this._copy());
    this.el.querySelector('.diag-min').addEventListener('click', () => {
      this.el.classList.toggle('diag-collapsed');
    });
  }

  _installHooks() {
    // 截获 console，原行为保留
    ['log', 'info', 'warn', 'error'].forEach((kind) => {
      const orig = console[kind].bind(console);
      console[kind] = (...args) => {
        try { this.log(kind.toUpperCase(), ...args); } catch (_) {}
        orig(...args);
      };
    });

    // 脚本运行时错误
    window.addEventListener('error', (e) => {
      // 资源加载错误（target 不是 window）
      if (e.target && e.target !== window && e.target.tagName) {
        const tag = e.target.tagName.toLowerCase();
        const src = e.target.src || e.target.currentSrc || e.target.href || '';
        this.log('ASSET_FAIL', `<${tag}> 加载失败: ${src}`);
        return;
      }
      // 脚本错误
      this.log('PAGE_ERROR', e.message, `(${e.filename}:${e.lineno}:${e.colno})`);
    }, true);

    window.addEventListener('unhandledrejection', (e) => {
      this.log('UNHANDLED', e.reason || '(no reason)');
    });
  }

  _collectStartupInfo() {
    this.log('INFO', '协议:', location.protocol);
    this.log('INFO', '地址:', location.href);
    this.log('INFO', 'UA:', navigator.userAgent);
    this.log('INFO', '屏幕:', `${window.innerWidth}x${window.innerHeight}`);
  }

  _render() {
    const html = this.lines.map(l => {
      const cls = `diag-line diag-${l.level.toLowerCase()}`;
      return `<div class="${cls}"><span class="diag-time">${l.time}</span><span class="diag-level">[${l.level}]</span><span class="diag-text">${escapeHtml(l.text)}</span></div>`;
    }).join('');
    this.logEl.innerHTML = html;
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }

  _copy() {
    const text = this.lines.map(l => `[${l.time}] [${l.level}] ${l.text}`).join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => alert('已复制日志，粘贴给开发者即可。'))
        .catch(() => this._fallbackCopy(text));
    } else {
      this._fallbackCopy(text);
    }
  }

  _fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '50%';
    ta.style.left = '50%';
    ta.style.transform = 'translate(-50%, -50%)';
    ta.style.width = '80vw';
    ta.style.height = '60vh';
    ta.style.zIndex = 99999;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    alert('请按 Ctrl+A 全选 → Ctrl+C 复制 → 关闭弹窗后发给开发者。');
    setTimeout(() => ta.remove(), 60000);
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}
