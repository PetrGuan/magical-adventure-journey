# 3D 场景设计文档（单场景版）

> 本项目仅 1 个 3D 场景：**探险大本营**。用 Three.js 搭建。
> 体验时长：5-10 分钟。

---

## 技术栈

| 用途 | 选择 | 备注 |
|------|------|------|
| 3D 引擎 | **Three.js r160+** | CDN 引入，ES Module |
| 模型加载 | **GLTFLoader** | GLB 格式 |
| 控件 | **自定义**（鼠标拖动 + WASD） | 不用 PointerLock |
| 角色动画 | **Mixamo idle 循环** | 通过 GLB 内置 AnimationClip |
| 视频画框 | **VideoTexture** | 5 个 mp4 实时贴图 |
| 字幕 | DOM 覆盖层（绝对定位 div） | Noto Sans SC |
| TTS 音频 | 预生成的 6 个 mp3（运行时直接播放） | HTMLAudioElement |
| 字体 | Noto Sans SC（Google Fonts CDN） | 中文显示 |
| 构建 | **无构建**（CDN + import map） | 单 HTML 入口 |

**为什么不用打包工具：**
老师的电脑可能没装 Node.js，**纯静态文件 + CDN** 最省事。

**为什么需要本地 HTTP server：**
浏览器安全策略不允许 `file://` 协议加载 GLB / mp3 / mp4 文件。
README 里会说明：双击 `start.command`（macOS）或 `start.bat`（Windows）启动 Python 自带的简易 server。

---

## 文件结构

```
magical-adventure-journey/
├── index.html              ← 入口
├── start.command           ← macOS 一键启动脚本（python3 -m http.server）
├── start.bat               ← Windows 一键启动脚本
├── src/
│   ├── main.js             ← 初始化
│   ├── core/
│   │   ├── Engine.js       ← Three.js 场景 / 渲染 / 循环
│   │   ├── Player.js       ← 第一人称控制
│   │   ├── HotspotManager.js ← 热点系统
│   │   └── BaseCamp.js     ← 大本营场景搭建
│   ├── ui/
│   │   ├── Subtitle.js     ← NPC 字幕
│   │   ├── VideoModal.js   ← 视频全屏弹窗
│   │   ├── LoadingScreen.js
│   │   └── styles.css
│   └── data.js             ← 角色 + 视频元数据
├── assets/
│   ├── audio/              ← 6 个 mp3
│   │   ├── 01-li-dashan.mp3
│   │   ├── 02-chen-yutong.mp3
│   │   ├── 03-amushu.mp3
│   │   ├── 04-xiaoyu.mp3
│   │   ├── 05-zhang-dazhuang.mp3
│   │   └── 06-xiaoming.mp3
│   ├── videos/             ← 5 个 mp4
│   ├── models/             ← 约 15 个 GLB
│   ├── skybox/             ← 营地天空（equirect jpg）
│   ├── textures/           ← 草地、木纹等
│   └── ambient/            ← 篝火噼啪声、风声
└── content/ design/        ← Markdown 文档
```

---

## 主场景设计

详见 [`content/scenes/00-base-camp.md`](../content/scenes/00-base-camp.md)。

---

## 实现阶段（5-7 小时）

### Phase 1：基础引擎（约 2 小时）
1. `index.html` + Three.js 初始化（场景、相机、渲染器）
2. 加载 skybox + 地面 plane + 灯光
3. 第一人称控制（鼠标拖动转视角 + WASD 移动 + 边界限制）
4. 加载页 + 进度条
5. 测试：能在一个空营地里自由走动看四周

### Phase 2：营地搭建（约 2 小时）
1. 帐篷 / 篝火（含跳动光源）/ 装备桌
2. 装备道具散落桌上（hover 反馈）
3. 5 张视频画框（VideoTexture 接入 mp4）
4. 周围松树点缀

### Phase 3：NPC 与交互（约 1.5 小时）
1. 6 个 Mixamo NPC + idle 动画
2. 点击 NPC → 头顶光环 + 播放音频 + 滚动字幕
3. 点击画框 → 全屏播放视频 + 标语
4. 字幕同步高亮（按时间戳）

### Phase 4：打磨（约 1 小时）
1. 篝火粒子（向上飘的小火星）
2. 落叶粒子
3. 环境音效（篝火噼啪、风声）
4. 性能优化（InstancedMesh 用于树木）
5. 浏览器兼容性测试

---

## 工作分工

| 任务 | 谁来 | 产出 |
|---|---|---|
| Three.js 工程代码 | 我（Claude） | `src/` 全部 + `index.html` |
| 6 个 mp3 配音 | 你（运行 6 行命令） | `assets/audio/*.mp3` |
| 5 个 mp4 目的地动图 | 你（即梦/可灵生成） | `assets/videos/*.mp4` |
| Sketchfab GLB 模型下载 | 我给清单 + 链接，你下载 | `assets/models/*.glb` |
| Mixamo NPC 模型 | 我给清单，你下载 | `assets/models/npc-*.glb` |
| Skybox 天空 | 你（Skybox Lab 生成 1 张） | `assets/skybox/base-camp.jpg` |

---

## 风险与应对

| 风险 | 应对 |
|---|---|
| Sketchfab 模型不合适 | 用基础几何体 + 贴图代替（圆柱当水壶等） |
| Mixamo 角色性别 / 年龄不合适 | 找接近的，必要时用纸片人 sprite |
| Edge TTS 中文童声不够稚嫩 | 试 zh-CN-XiaomengNeural，或在 SSML 提高 pitch |
| AI 视频不能完美循环 | 用 ffmpeg 反向拼接（A→B→A）或裁剪到能接 |
| 老师电脑性能差 | 限制总三角面数 < 15 万；按需用 LOD |
| 字体加载慢 | Noto Sans SC 字体子集化（只打包用到的 ~1500 个汉字） |
| `file://` 协议无法加载 | 提供 `start.command` / `start.bat` 一键启动本地 server |
