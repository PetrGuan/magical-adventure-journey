/**
 * 项目数据：6 位角色 + 5 个目的地。
 * 内容源于 content/01-characters.md 和 content/04-destinations.md。
 *
 * 改文案在这里改即可——3D 场景代码会自动读取。
 */

export const characters = [
  {
    id: 'A1',
    name: '李大山',
    role: '经验丰富的探险爱好者',
    color: 0x4a3a28,
    audio: 'assets/audio/01-li-dashan.mp3',
    speech: `你好。我叫李大山，42 岁，登过 6 座七千米的雪山。
这道疤是在北极被冰棱划的。
我话不多——你跟着我，就别担心。
想带我一起去吗？`,
  },
  {
    id: 'A2',
    name: '陈雨桐',
    role: '知识渊博的生物学家',
    color: 0x9a7a4a,
    audio: 'assets/audio/02-chen-yutong.mp3',
    speech: `嗨！我是陈雨桐，生物学家。
哪些蛇有毒、哪些果子能吃，我都知道。
不过——看到没见过的虫子，我会激动得忘记赶路。
你愿意带这样的我吗？`,
  },
  {
    id: 'A3',
    name: '阿木叔',
    role: '见多识广的向导',
    color: 0x8a5a3a,
    audio: 'assets/audio/03-amushu.mp3',
    speech: `哈哈哈，叫我阿木叔！我五十岁，从小在山林里长大。
听声音能辨方向，看云能预报天气。
闭着眼，我都能找回家。
来不来？阿木叔保证不让你迷路！`,
  },
  {
    id: 'B1',
    name: '小雨',
    role: '好奇心强、性格活泼的妹妹',
    color: 0xe88aa0,
    audio: 'assets/audio/04-xiaoyu.mp3',
    speech: `哥哥姐姐！我叫小雨，十岁！
我跑得超快，眼睛超尖——树洞里的小松鼠都是我先发现的！
我什么都不怕，就是爸爸说我太冲动……
带上我嘛，拜托啦——！`,
  },
  {
    id: 'B2',
    name: '张大壮',
    role: '胆子大但行事鲁莽的表哥',
    color: 0xc44a2a,
    audio: 'assets/audio/05-zhang-dazhuang.mp3',
    speech: `嘿！张大壮，14 岁，全班最高的！
我力气大，学过武术，什么都不怕！
我妈说我太冲动，但我超讲义气！
让我打头阵——一起去！`,
  },
  {
    id: 'B3',
    name: '小明',
    role: '心细而胆小的同学',
    color: 0x6688bb,
    audio: 'assets/audio/06-xiaoming.mp3',
    speech: `你……你好。我叫小明，11 岁。
我胆子有点小，但我观察特别仔细。
出门前，我会把清单列三遍。
上次同学的红领巾，是我帮她找到的。
带上我——我会保护好大家。`,
  },
];

export const destinations = [
  {
    id: 'desert',
    name: '茫茫大漠',
    emoji: '🏜️',
    color: 0xe8b878,
    video: 'assets/videos/01-desert.mp4',
    tagline: '在这里，水比黄金更珍贵。',
  },
  {
    id: 'rainforest',
    name: '热带雨林',
    emoji: '🌴',
    color: 0x4aaa6a,
    video: 'assets/videos/02-rainforest.mp4',
    tagline: '每一片叶子下，都藏着新的发现。',
  },
  {
    id: 'island',
    name: '海中荒岛',
    emoji: '🏝️',
    color: 0x6aaadd,
    video: 'assets/videos/03-island.mp4',
    tagline: '等待，是这里最长的一种语言。',
  },
  {
    id: 'cave',
    name: '幽深洞穴',
    emoji: '🕯️',
    color: 0x4a3a6a,
    video: 'assets/videos/04-cave.mp4',
    tagline: '黑暗里最闪亮的，不是光，是好奇。',
  },
  {
    id: 'glacier',
    name: '南极冰川',
    emoji: '🧊',
    color: 0xb0d0e8,
    video: 'assets/videos/05-glacier.mp4',
    tagline: '最冷的地方，往往最热闹。',
  },
];
