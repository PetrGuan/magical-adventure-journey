# 探险地预览 · 5 张挂在墙上的动图

> 大本营的一面墙上挂着 5 张「探险家相册」——
> 每张是不同探险地的 **1-2 秒循环动图**。
> 学生走近，能看到沙在飞、叶子在动、雪在飘、海浪在涌。
>
> 学生点击某张 → 全屏播放该动图 + 屏幕下方显示标语 + 5 秒后自动返回。

---

## 5 张动图清单

### 1. 茫茫大漠 🏜️

**中文 prompt（即梦/可灵）：**

> 一望无际的金色沙漠，沙丘轻轻起伏。
> 远处有一队骆驼商队的剪影缓缓走过。
> 沙子被风吹起，在天空飘起细细的金色沙雾。
> 黄昏的天空，橙红色光晕。
> **2 秒循环，1080p**

**英文 prompt（Pika/Runway/Sora）：**

> Vast golden desert, gentle dune ripples, distant camel caravan
> silhouettes walking slowly, sand softly drifting in wind, sunset
> orange sky. 1080p, 2-second seamless loop, cinematic

**画框下的标语：**
> **「在这里，水比黄金更珍贵。」**

**文件：** `assets/videos/01-desert.mp4`

---

### 2. 热带雨林 🌴

**中文 prompt：**

> 茂密的热带雨林，参天大树和挂下的藤蔓。
> 阳光透过树冠洒下金色光斑。
> 一只蓝色蝴蝶慢慢从画面前飞过。
> 远处有水珠从叶尖滴落。
> **2 秒循环，1080p**

**英文 prompt：**

> Lush tropical rainforest, towering trees with hanging vines,
> golden sunlight beams through canopy, blue butterfly slowly flying
> across, water drops falling from leaves. 1080p, 2-second seamless loop

**画框下的标语：**
> **「每一片叶子下，都藏着新的发现。」**

**文件：** `assets/videos/02-rainforest.mp4`

---

### 3. 海中荒岛 🏝️

**中文 prompt：**

> 一座无人小岛，白色沙滩和椰子树。
> 海浪轻轻拍上沙滩，棕榈叶随风摆动。
> 远处一只海鸥飞过。
> 蓝天白云。
> **2 秒循环，1080p**

**英文 prompt：**

> Deserted tropical island, white sandy beach and palm trees, waves
> gently lapping ashore, palm leaves swaying, seagull flying past,
> blue sky white clouds. 1080p, 2-second seamless loop

**画框下的标语：**
> **「等待，是这里最长的一种语言。」**

**文件：** `assets/videos/03-island.mp4`

---

### 4. 幽深洞穴 🕯️

**中文 prompt：**

> 神秘的钟乳石溶洞内部。
> 蓝色发光晶体散布在墙壁上，光芒缓慢闪烁。
> 暗河水面有微微的水波荡漾，水滴从钟乳石尖滴落。
> 远处有蓝色发光蘑菇丛轻轻摇动。
> **2 秒循环，1080p**

**英文 prompt：**

> Mystical cave interior with stalactites, glowing blue crystals on
> walls with gentle pulsing light, underground stream rippling, water
> dripping from stalactites, glowing blue mushrooms swaying gently.
> 1080p, 2-second seamless loop

**画框下的标语：**
> **「黑暗里最闪亮的，不是光，是好奇。」**

**文件：** `assets/videos/04-cave.mp4`

---

### 5. 南极冰川 🧊

**中文 prompt：**

> 南极冰原，蔚蓝色的巨大冰山。
> 海面漂浮着浮冰，几片雪花缓缓飘落。
> 远处一只小海豹从冰洞口探出头，又钻回水里。
> 淡蓝粉色天空。
> **2 秒循环，1080p**

**英文 prompt：**

> Antarctic glacier landscape, towering blue icebergs, floating sea
> ice, gentle snowflakes falling, a small seal poking head from ice
> hole then diving back, pastel pink-blue sky. 1080p, 2-second seamless loop

**画框下的标语：**
> **「最冷的地方，往往最热闹。」**

**文件：** `assets/videos/05-glacier.mp4`

---

## 推荐 AI 视频生成工具（中文友好优先）

| 工具 | 免费额度 | 中文支持 | 推荐场景 |
|---|---|---|---|
| **即梦** (字节) | 每天免费几条 | ✅ 原生中文 | **首选**，画质稳定 |
| **可灵** (快手) | 免费试用 | ✅ 原生中文 | 备选，画面细腻 |
| **Pika 1.5** | 免费版有水印 | ❌ 仅英文 | 备选 |
| **Runway Gen-3** | 免费版限时 | ❌ 仅英文 | 备选 |

**建议**：先用即梦试 1 张，看效果——如果画面不够好再换可灵。

---

## 生成完后的命名规范

下载下来的 mp4 文件按以下命名放到 `assets/videos/` 文件夹：

```
assets/videos/
├── 01-desert.mp4
├── 02-rainforest.mp4
├── 03-island.mp4
├── 04-cave.mp4
└── 05-glacier.mp4
```

**文件大小建议**：每个 < 5 MB（2 秒 1080p mp4 一般 1-3 MB），太大网页加载慢。

---

## 在 3D 场景中的呈现

5 张动图被映射到**画框**上（VideoTexture），挂在营地一面墙上：

```
                  [营地北墙]
   ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
   │ 🏜️    │ │ 🌴    │ │ 🏝️    │ │ 🕯️    │ │ 🧊    │
   │ 大漠 │ │ 雨林 │ │ 荒岛 │ │ 洞穴 │ │ 冰川 │
   └──────┘ └──────┘ └──────┘ └──────┘ └──────┘
   "水比金贵" "每片叶子" "等待最长" "好奇最亮" "最热闹"
```

- 每张画框都是热点
- 画框下方写着该地点的中文名
- 学生鼠标 hover → 画框微微放大 + 边框发光
- 点击 → 全屏播放视频 + 标语
- 5 秒后 / 学生再次点击 → 关闭返回营地
