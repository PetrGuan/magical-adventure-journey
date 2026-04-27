# 神奇的探险之旅 · 一节作文课的开头 · 3-5 分钟情境创设

> 给小学**五年级**语文老师的课堂工具：
> 在《神奇的探险之旅》习作课开头的 **3-5 分钟**，
> 让学生先"走进"探险大本营——
> 见到 **6 位有声有形**的探险家，看到桌上的真实装备，
> 在墙上看 **5 个神秘地的预览动图**——
> 然后再下笔，写出他们的想象作文。

## 📋 项目文档

> **首次了解项目，先读这两份文档：**
>
> - 📜 **[`docs/SPEC.md`](./docs/SPEC.md)** — 项目需求规格（"需求圣经"，所有决策的依据）
> - 🗺️ **[`docs/ROADMAP.md`](./docs/ROADMAP.md)** — 里程碑与工作计划
>
> 所有 GitHub issues 都引用 SPEC 章节作为验收依据。

## 这是什么

人教版小学语文五年级下册第六单元习作《神奇的探险之旅》要求学生想象一次探险。

但学生面对空白作文本**写不出来**——
不是没有想象力，是**还没"看见"**那个世界。

这个项目把课堂开头的 5-10 分钟做成一个 3D 探险大本营——
让学生在动笔之前，**先成为一个"准探险家"**。

## 体验流程

```
[加载页] "神奇的探险之旅"
        ↓
[3D 大本营] —— 唯一的场景
  • 转视角看四周（鼠标拖动）
  • 6 位探险家围着篝火 → 点击任一位 → 听他/她自我介绍（**15-20 秒**中文配音）
  • 桌上摆着指南针、望远镜、地图、药箱……（装饰）
  • 一面墙上挂着 5 张神奇地的预览动图（点击可放大）
        ↓
[3-5 分钟后]
  老师按 ESC 退出 → 全班拿出作文本开始写作
```

## 工作量与产出

| 项目 | 工作量 | 谁来做 |
|------|--------|--------|
| Three.js 工程代码 | 5-7 小时 | 我（Claude） |
| 6 个 mp3 配音 | 30 秒（一行命令） | 你（运行 Edge TTS） |
| 5 个 mp4 目的地动图 | 30 分钟 | 你（即梦/可灵 AI 生成） |
| Sketchfab 模型下载 | 30 分钟 | 你（按清单下载） |

**最终交付**：一个文件夹，浏览器双击 `index.html` 即用，**离线可运行**。

## 技术栈

| 用途 | 选择 |
|------|------|
| 3D 引擎 | [Three.js](https://threejs.org) r160+（CDN） |
| 模型 | Sketchfab CC + [Mixamo](https://mixamo.com) Free |
| 配音 | [Edge TTS](https://github.com/rany2/edge-tts)（免费、中文音色丰富） |
| 目的地视频 | 即梦 / 可灵 / Pika / Runway |
| 字体 | Noto Sans SC |

## 文件结构

```
magical-adventure-journey/
├── README.md                       ← 你正在读
├── LICENSE
├── content/                        ← 文案与脚本
│   ├── 01-characters.md            6 位角色 + 配音脚本
│   ├── 02-equipment.md             桌上装备清单
│   ├── 03-narrative-flow.md        课堂使用流程
│   ├── 04-destinations.md          5 张目的地动图 prompt
│   └── scenes/00-base-camp.md      唯一 3D 场景详细设计
├── design/                         ← 工程设计文档
│   ├── 3d-scene-design.md
│   └── tts-voice-guide.md          Edge TTS 配音生成指南
└── (待开发) src/ assets/
```

## 当前进度

- [x] 文案：6 位角色 + 配音脚本
- [x] 文案：5 张目的地动图 prompt
- [x] 设计：3D 场景蓝图
- [x] 设计：TTS 配音生成指南
- [x] **Phase 1**：Three.js 基础引擎（占位营地，可走动可看四周）
- [ ] **Phase 2**：替换占位为真实 Sketchfab GLB 模型
- [ ] **Phase 3**：6 位 NPC 接入（点击播放音频 + 字幕）
- [ ] **Phase 4**：5 张视频画框接入（VideoTexture）
- [ ] 资产：你生成 6 个 mp3（运行 `design/tts-voice-guide.md` 中命令）
- [ ] 资产：你生成 5 个 mp4（即梦/可灵）
- [ ] 资产：从 Sketchfab 下载约 15 个 GLB 模型

## 如何运行（Phase 1）

**macOS：** 双击 `start.command`
**Windows：** 双击 `start.bat`

脚本会启动一个本地 HTTP 服务器（占用端口 8000），并自动打开浏览器。
建议 Chrome 或 Edge，按 F11 全屏体验。

⚠️ **macOS 首次运行**可能提示"无法打开"——
右键 `start.command` → 打开 → 在弹窗确认即可（之后双击就能用）。

⚠️ **依赖**：Python 3（macOS / Win 11 自带；如果没有，去 [python.org](https://www.python.org/downloads/) 下载）。

## 协议

- **代码**：MIT
- **文案**：CC BY-SA 4.0
- 模型 / 字体 / 第三方资产协议见 `assets/CREDITS.md`
