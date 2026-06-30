# 🎮 迷你游戏集合

纯 HTML/CSS/JS 小游戏合集，**一键打开即玩**，无需安装任何东西。

## 快速开始

```
双击 index.html 即可
```

或者局域网共享到 iPad/手机：

```
双击 start-server.bat → 终端里会显示地址和二维码 → iPad 扫码即玩
```

在线版：[https://haixihuang.github.io/mini-games-collection/](https://haixihuang.github.io/mini-games-collection/)

## 游戏列表（8个）

| 游戏 | 说明 | 难度 |
|------|------|------|
| 🔢 **1A2B** | 猜数字推理 | 3位→4位(0-7)→4位(0-9) |
| 🃏 **24点** | 4个数字算24 | 1-9→1-13→含分数解 |
| 📦 **推箱子** | 经典推箱子 | 2箱→3箱→4箱 |
| 🗼 **汉诺塔** | 递归谜题 | 3盘→5盘→7盘 |
| 🧮 **数学智力题** | 四则运算→应用题→奥赛题 | 各5题 |
| 🧩 **拼图游戏** | 滑动拼图 | 3×3→4×4→5×5 |
| 🔤 **填字母** | 看中文补全英文，60秒限时 | 小学→初中基础→中考核心 |
| 📝 **选意思** | 看英文选中文释义，60秒限时 | 小学→初中基础→中考核心 |
| 📚 **单词学习** | 闪卡+间隔复习，无时限 | 每日新词+复习，~1385词库 |

## 功能

- 👤 玩家头像 + 名字
- 🏆 排行榜（localStorage 持久化）
- 🥇🥈🥉 前三名金银铜高亮
- 📊 每个游戏 3 个难度级别

## 扩展

添加新游戏只需两步：

1. 创建 `games/新游戏/game.js`，调用 `GameRegistry.register({...})`
2. 在 `index.html` 加一行 `<script src="games/新游戏/game.js"></script>`

```js
GameRegistry.register({
  id: 'mygame',
  name: '我的游戏',
  icon: '🎯',
  desc: '游戏简介',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '适合新手' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '有一定挑战' },
    { id: 'hard', name: '困难', icon: '💀', desc: '高手挑战' },
  ],
  init(container, difficulty, onComplete) {
    // 你的游戏逻辑
    // container: DOM元素，渲染游戏界面
    // difficulty: 'easy' | 'medium' | 'hard'
    // onComplete({ win, score, title, detail }): 游戏结束时调用
  }
});
```

## 技术

- 零依赖，纯 HTML/CSS/JS
- localStorage 存储玩家数据和排行榜
- 游戏注册制架构，模块化可扩展
