# TTS 配音生成指南

> 本项目用 **Microsoft Edge TTS**（免费、高质量、中文音色丰富）生成 6 位 NPC 的配音。
> 一次性生成 6 个 mp3 文件，放在 `assets/audio/`，3D 场景里点击 NPC 时直接播放。
>
> **每段控制在 15-20 秒**——五年级注意力 + 老师课堂时间紧。

---

## 安装

```bash
pip install edge-tts
```

确认 Python 3.7+：`python3 --version`

---

## 6 个角色生成命令

进入项目根目录，先建好音频文件夹：

```bash
cd magical-adventure-journey
mkdir -p assets/audio
```

### 1. 李大山（沉稳中年男，~15 秒）

```bash
edge-tts \
  --voice zh-CN-YunjianNeural \
  --rate "-5%" \
  --pitch "-2Hz" \
  --text "你好。我叫李大山，42 岁，登过 6 座七千米的雪山。这道疤是在北极被冰棱划的。我话不多——你跟着我，就别担心。想带我一起去吗？" \
  --write-media assets/audio/01-li-dashan.mp3
```

### 2. 陈雨桐（温柔知性女，~18 秒）

```bash
edge-tts \
  --voice zh-CN-XiaoxiaoNeural \
  --rate "+5%" \
  --text "嗨！我是陈雨桐，生物学家。哪些蛇有毒、哪些果子能吃，我都知道。不过——看到没见过的虫子，我会激动得忘记赶路。你愿意带这样的我吗？" \
  --write-media assets/audio/02-chen-yutong.mp3
```

### 3. 阿木叔（豪爽中年男，~18 秒）

```bash
edge-tts \
  --voice zh-CN-YunfengNeural \
  --pitch "+2Hz" \
  --text "哈哈哈，叫我阿木叔！我五十岁，从小在山林里长大。听声音能辨方向，看云能预报天气。闭着眼，我都能找回家。来不来？阿木叔保证不让你迷路！" \
  --write-media assets/audio/03-amushu.mp3
```

### 4. 小雨（活泼女童，~15 秒）

```bash
edge-tts \
  --voice zh-CN-XiaoshuangNeural \
  --rate "+15%" \
  --text "哥哥姐姐！我叫小雨，十岁！我跑得超快，眼睛超尖——树洞里的小松鼠都是我先发现的！我什么都不怕，就是爸爸说我太冲动……带上我嘛，拜托啦——！" \
  --write-media assets/audio/04-xiaoyu.mp3
```

### 5. 张大壮（大嗓门男少年，~15 秒）

```bash
edge-tts \
  --voice zh-CN-YunxiaNeural \
  --rate "+10%" \
  --pitch "+5Hz" \
  --text "嘿！张大壮，14 岁，全班最高的！我力气大，学过武术，什么都不怕！我妈说我太冲动，但我超讲义气！让我打头阵——一起去！" \
  --write-media assets/audio/05-zhang-dazhuang.mp3
```

### 6. 小明（腼腆细致男童，~18 秒）

```bash
edge-tts \
  --voice zh-CN-YunxiaNeural \
  --rate "-5%" \
  --pitch "-2Hz" \
  --text "你……你好。我叫小明，11 岁。我胆子有点小，但我观察特别仔细。出门前，我会把清单列三遍。上次同学的红领巾，是我帮她找到的。带上我——我会保护好大家。" \
  --write-media assets/audio/06-xiaoming.mp3
```

---

## 一键全部生成

我会在 `scripts/generate-voices.sh` 里把这 6 条命令打包：

```bash
bash scripts/generate-voices.sh
```

**总耗时约 15 秒**，输出 6 个 mp3 文件，每个 60-150 KB。

---

## 试听 / 调整

| 想要的效果 | 调什么 |
|---|---|
| 更慢 | `--rate "-15%"` |
| 更快 | `--rate "+15%"` |
| 更高亢 / 更童声 | `--pitch "+5Hz"` 或 `+10Hz` |
| 更低沉 / 更老成 | `--pitch "-5Hz"` |
| 完全换音色 | 替换 `--voice zh-CN-*Neural` |

列出所有中文音色：

```bash
edge-tts --list-voices | grep "zh-CN"
```

---

## 备选音色速查

| 音色 ID | 性别 | 年龄 | 风格 |
|---|---|---|---|
| zh-CN-XiaoxiaoNeural | 女 | 成年 | 温柔知性（默认助理音） |
| zh-CN-XiaohanNeural | 女 | 成年 | 温暖亲切 |
| zh-CN-XiaomengNeural | 女 | 童声 | 可爱活泼 |
| zh-CN-XiaoshuangNeural | 女 | 童声 | 7 岁左右 |
| zh-CN-XiaoxuanNeural | 女 | 中年 | 成熟干练 |
| zh-CN-YunjianNeural | 男 | 成年 | 沉稳低音 |
| zh-CN-YunfengNeural | 男 | 中年 | 豪爽大叔 |
| zh-CN-YunyangNeural | 男 | 成年 | 新闻播报 |
| zh-CN-YunzeNeural | 男 | 中年 | 商业 |
| zh-CN-YunxiNeural | 男 | 青年 | 阳光 |
| zh-CN-YunxiaNeural | 男 | 童声 | 7 岁左右 |
| zh-CN-YunhaoNeural | 男 | 成年 | 商业播音 |

---

## 在 3D 场景里播放（参考实现）

```javascript
// src/core/HotspotManager.js
function onClickNPC(characterId) {
  const character = charactersData[characterId];
  
  // 头顶光环亮起
  character.halo.visible = true;
  
  // 播放音频
  const audio = new Audio(`assets/audio/${character.audioFile}`);
  audio.play();
  
  // 同步显示字幕
  showSubtitle(character.name, character.speech);
  
  // 播放结束后熄灭光环
  audio.addEventListener('ended', () => {
    character.halo.visible = false;
    hideSubtitle();
  });
}
```

---

## 故障排除

### "command not found: edge-tts"
重新检查 pip 安装路径：`pip show edge-tts` 看看在哪里。或改用 `python3 -m edge_tts ...`。

### "网络错误"
Edge TTS 调用微软的服务，**生成时需要联网**。中国大陆访问微软 Azure 通常没问题，失败试一下 VPN。

### "中文显示成乱码"
zsh / bash 对部分中文标点敏感。可以把 text 单独存到 `.txt` 文件再用 `--file` 参数代替 `--text`。
