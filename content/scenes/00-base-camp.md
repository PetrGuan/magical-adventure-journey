# 大本营 · 项目唯一的 3D 场景 🏕️

> 这是项目里**唯一的 3D 场景**。
> 学生进入这里体验 5-10 分钟，然后开始写作。

---

## 场景目标

让学生**情境化地进入"探险家身份"**——
- 见到 6 位有声有形的探险队员
- 看到桌上的真实装备
- 在墙上的 5 张画面前停留，幻想自己将要去的地方

**全程 0 选择压力**，纯感受。

---

## Skybox · AI 生成 prompt

**英文：**

```
Adventure base camp at golden hour, warm orange sunset sky,
distant snow-capped mountain silhouettes, soft golden light,
cozy welcoming atmosphere, photorealistic, 360 panorama, equirectangular
```

**生成后保存为：** `assets/skybox/base-camp.jpg`

---

## 场景布局（俯视图）

```
                ⛰️ 远山轮廓 (skybox)

    🌲                                          🌲

                    [北墙：5 张视频画框]
              🖼️  🖼️  🖼️  🖼️  🖼️
              大漠 雨林 荒岛 洞穴 冰川

   👤A1  👤A2  👤A3        👤B1  👤B2  👤B3
   导师们 (左侧)              伙伴们 (右侧)
   (idle 站姿动画)            (idle 站姿动画)

         ⛺ 帐篷       🔥 篝火       ⛺ 帐篷

                    🪵 装备桌
              🧭🗺️🔭💧🍫💊🪢🔦🎒⛺

                    [玩家初始位置]
                    (面朝营地中央，正对篝火)
```

---

## 关键 3D 元素

### 模型清单

| 编号 | 元素 | 来源 / 方式 | 数量 |
|------|------|------|------|
| M1 | 草地 / 土地 | 自建 plane + grass texture | 1 |
| M2 | 帐篷 | Sketchfab "camping tent low poly" CC | 2 |
| M3 | 篝火 + 跳动光源 | 自建 cylinder + 火苗贴片 + PointLight | 1 |
| M4 | 装备桌 | Sketchfab "wooden table" CC | 1 |
| M5 | 装备道具 × 10 | Sketchfab CC（compass / map / binoculars / water bottle / chocolate / first aid / tent mini / rope / flashlight / backpack） | 10 |
| M6 | 视频画框 × 5 | 自建 plane + frame border + VideoTexture | 5 |
| M7 | NPC × 6 | Mixamo low-poly + idle 动画 | 6 |
| M8 | 远山 + 天空 | skybox 自带（AI 生成） | 1 |
| M9 | 周围松树（点缀） | Sketchfab "pine tree low poly" CC | 4-6 |

### 灯光

| 灯 | 类型 | 设置 |
|---|---|---|
| 环境天光 | HemisphereLight | skyColor 0xffaa55, groundColor 0x665544, intensity 0.6 |
| 主光（夕阳） | DirectionalLight | color 0xffcc88, intensity 0.8, 从右上斜射 |
| 篝火 | PointLight | color 0xff7733, intensity 2, distance 8, **跳动**（intensity 用 sin 函数调制） |
| 画框打光 × 5 | SpotLight | color 0xffeeaa, intensity 1.2, 从墙上方打下 |
| 装备桌打光 | SpotLight | color 0xffffff, intensity 0.8, 从上方斜下 |

---

## 交互热点

| 编号 | 位置 | 触发 |
|---|---|---|
| H1-H6 | 6 位 NPC | 点击 → 头顶光环亮起 + 播放音频 + 字幕滚动 |
| H7-H11 | 5 张视频画框 | 点击 → 全屏播放视频 + 显示标语 |
| (no) | 桌上装备 | hover 浮起 + 微光，**不弹窗** |

---

## 氛围细节（让画面活起来）

| 细节 | 实现 |
|---|---|
| 篝火跳动 | PointLight intensity = 2 + 0.3 * sin(t * 8)，火苗贴片随机抖动 |
| 火星粒子 | THREE.Points，向上飘几秒后消失 |
| NPC idle | Mixamo "idle" 动画循环（1.5x 慢速） |
| 远山天空 | skybox 静态，可加一层缓慢移动的云贴图（uv 偏移） |
| 落叶飘 | THREE.Points 数十片，缓慢向下飘 |
| 篝火噼啪声 | 循环音频（音量 30%，不要盖过 NPC 配音） |
| 风声 | 循环音频（音量 15%） |

---

## 玩家控制

- **鼠标拖动（左键按住）**：转视角
- **WASD**：移动（速度 3 m/s，限制在营地半径 12 米内）
- **鼠标点击发光物**：触发热点
- **ESC**：暂停 / 老师退出

---

## NPC 站位坐标（相对玩家初始位置，单位米）

| ID | 角色 | 位置 (x, y, z) | 朝向 |
|---|---|---|---|
| A1 | 李大山 | (-4, 0, -6) | 朝向篝火 |
| A2 | 陈雨桐 | (-4, 0, -4) | 朝向篝火 |
| A3 | 阿木叔 | (-4, 0, -2) | 朝向篝火 |
| B1 | 小雨 | (+4, 0, -2) | 朝向篝火 |
| B2 | 张大壮 | (+4, 0, -4) | 朝向篝火 |
| B3 | 小明 | (+4, 0, -6) | 朝向篝火 |

篝火位置：(0, 0, -4)
装备桌位置：(0, 0, +1)（玩家身后稍偏）
画框墙位置：(0, 2, -10)（北墙，墙上 5 个画框等距）
