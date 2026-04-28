/**
 * 项目数据：6 位角色 + 5 个目的地。
 * 内容源于 content/01-characters.md 和 content/04-destinations.md。
 *
 * 每位角色的 video 字段是其 mp4 自我介绍——视频自带语音，
 * 点击 NPC 时在对话框头像区域播放（见 src/ui/Subtitle.js）。
 */

export const characters = [
  {
    id: 'A1',
    name: '王叔叔',
    role: '经验丰富的探险爱好者',
    color: 0x4a3a28,
    video: 'assets/videos/character_1.mp4',
    speech: `大家好，我是一名探险爱好者，
我走过无数险峰与秘境，懂野外生存，会应急避险。
跟着我，安全和方向都交给我，你只管放心探险。`,
  },
  {
    id: 'A2',
    name: '陈老师',
    role: '知识渊博的生物学家',
    color: 0x9a7a4a,
    video: 'assets/videos/character_2.mp4',
    speech: `大家好，我是一名生物学家，
山林草木、鸟兽虫鱼我都熟悉，能辨别植物、识别动物踪迹，
还能帮我们避开危险生物，一路解锁自然奥秘。`,
  },
  {
    id: 'A3',
    name: '张大伯',
    role: '见多识广的向导',
    color: 0x8a5a3a,
    video: 'assets/videos/character_3.mp4',
    speech: `大家好，我是经验老道的向导，
地形、路线我了如指掌，哪里有水源，哪里能避险，哪里藏着美景，
我都一清二楚，绝不走弯路。`,
  },
  {
    id: 'B1',
    name: '小雨',
    role: '好奇心强、性格活泼的妹妹',
    color: 0xe88aa0,
    video: 'assets/videos/character_4.mp4',
    speech: `大家好呀，我是活泼好动的小妹妹，
对一切新鲜事物都好奇满满，
总能发现有意思的新奇小惊喜。`,
  },
  {
    id: 'B2',
    name: '小军',
    role: '胆子大但行事鲁莽的表哥',
    color: 0xc44a2a,
    video: 'assets/videos/character_5.mp4',
    speech: `大家好啊，我是表哥，天不怕地不怕，胆子非常大，
就是我做事容易心急冲动，往往不考虑行为后果。`,
  },
  {
    id: 'B3',
    name: '小明',
    role: '心细而胆小的同学',
    color: 0x6688bb,
    video: 'assets/videos/character_6.mp4',
    speech: `大家好啊，我是小同学，
我心思细腻，擅长留意细小线索，
就是胆子不大，遇到危险会忍不住忐忑紧张。`,
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
