# 迷你游戏集合 — 项目状态

> 更新于 2026-07-01

## 概览

- **总游戏数**：13 个
- **总代码量**：~3500 行
- **URL**：[https://haixihuang.github.io/mini-games-collection/](https://haixihuang.github.io/mini-games-collection/)
- **仓库**：`HaixiHuang/mini-games-collection`
- **技术栈**：纯 HTML/CSS/JS，零依赖，localStorage 持久化

## 游戏列表

| # | 游戏 | ID | 图标 | 模式 | 难度 | 题库/关卡 |
|---|------|----|------|------|------|-----------|
| 1 | 1A2B | `1a2b` | 🔢 | 猜数字推理 | 3位→4位(0-7)→4位(0-9) | — |
| 2 | 24点 | `24point` | 🃏 | 四则运算得24 | 1-9→1-13→含分数解 | 内置求解器 |
| 3 | 推箱子 | `sokoban` | 📦 | 经典推箱子 | 5×5/1箱→6×6/2箱→7×7/3箱 | 7个经典可解关卡 |
| 4 | 汉诺塔 | `hanoi` | 🗼 | 递归谜题 | 3盘→5盘→7盘 | — |
| 5 | 数学智力题 | `math` | 🧮 | 选择题 | 四则运算→应用题→奥赛题 | 101题 |
| 6 | 拼图游戏 | `puzzle` | 🧩 | 滑动拼图 | 3×3→4×4→5×5 | — |
| 7 | 扫雷 | `minesweeper` | 💣 | 经典扫雷 | 9×9/10雷→16×16/40雷→16×30/99雷 | — |
| 8 | 脑筋急转弯 | `riddle` | 🤔 | 选择题 | 经典→进阶→烧脑 | 100题 |
| 9 | 科学知识 | `science` | 🔬 | 选择题 | 小学→初中基础→中考核心 | 197题 |
| 10 | 地理知识 | `geography` | 🌍 | 选择题 | 小学→初中基础→中考核心 | 196题 |
| 11 | 英语谜语 | `enriddle` | 💡 | 选择题（英文） | 小学→初中基础→进阶 | 200题 |
| 12 | 填字母 | `wordfill` | 🔤 | 看中文补全英文，60秒限时 | 小学→初中基础→中考核心 | ~460词/级 |
| 13 | 选意思 | `wordpick` | 📝 | 看英文选中文，60秒限时 | 小学→初中基础→中考核心 | ~460词/级 |
| 14 | 单词学习 | `wordstudy` | 📚 | 闪卡+间隔复习，无时限 | 同上，每日计划可调 | ~460词/级 |

## 文件结构

```
N:\ClaudeGames\
  index.html                 # 唯一入口
  README.md                  # 说明文档
  start-server.bat           # 局域网共享一键启动
  docs/plan.md               # 实现计划
  common/
    engine.js                # 玩家档案、排行榜(localStorage)、游戏注册表
    style.css                # 全局样式（暗色主题）
  games/
    1a2b/game.js             # 1A2B 猜数字
    24point/game.js          # 24点（含求解器+屏幕键盘）
    sokoban/game.js          # 推箱子（D-pad触屏支持）
    hanoi/game.js            # 汉诺塔（点击交互）
    math/game.js             # 数学智力题
    puzzle/game.js           # 滑动拼图（D-pad触屏支持）
    minesweeper/game.js      # 扫雷（长按插旗，触屏优化）
    riddle/game.js           # 脑筋急转弯
    science/game.js          # 科学知识问答
    geography/game.js        # 地理知识问答
    enriddle/game.js         # 英语谜语
    wordgame/game.js         # 填字母 + 选意思 + 单词学习（共享词库~1385词）
```

## 通用功能

- 👤 玩家头像（15个emoji可选）+ 名字
- 🏆 排行榜（localStorage 持久化），🥇🥈🥉 前三名高亮
- 📊 每个游戏 3 个难度级别
- 📱 iPad 触屏支持（D-pad 方向键、长按插旗、屏幕键盘）
- ⌨️ 桌面键盘支持
- 🏠 首页直接查看各游戏排行榜（下拉切换游戏/难度）

## 扩展方式

添加新游戏：

1. 创建 `games/新游戏/game.js`
2. 调用 `GameRegistry.register({ id, name, icon, desc, difficulties, init })`
3. 在 `index.html` 加 `<script src="games/新游戏/game.js"></script>`

```js
GameRegistry.register({
  id: 'mygame',
  name: '我的游戏',
  icon: '🎯',
  desc: '游戏简介',
  difficulties: [
    { id: 'easy', name: '简单', icon: '🌱', desc: '...' },
    { id: 'medium', name: '中等', icon: '🔥', desc: '...' },
    { id: 'hard', name: '困难', icon: '💀', desc: '...' },
  ],
  init(container, difficulty, onComplete) {
    // container: DOM 元素
    // difficulty: 'easy' | 'medium' | 'hard'
    // onComplete({ win, score, title, detail, time })
  }
});
```

## 最近修复

| 日期 | 问题 | 修复 |
|------|------|------|
| 07-01 | 排行榜排名总是第0名 | `indexOf` 改 `findIndex` + 时间戳 |
| 07-01 | 24点游戏消失 | `let numbers` 重复声明 → 合并 |
| 07-01 | 单词填空跳不过提示字母 | `nextElementSibling` → `findNextBlank()` |
| 07-01 | 推箱子D-pad无反应 | 移除 `cell === ' '` 阻挡逻辑 |
| 07-01 | 扫雷iPad双击触发 | `_touchHandled` 标记防重复 |
| 06-30 | GitHub Pages 加载失败 | `Common/` → `common/` 大小写修复 |

## Git 历史

```
34c8fb6 feat: add science quiz (197q), geography quiz (196q), English riddles (200q)
6fcd657 fix: minesweeper touch double-fire, cleanup redundant vars
2bd49d6 feat: add Minesweeper with iPad touch support
753de58 fix: 24point duplicate variable, leaderboard rank always 0
6e73884 fix: 4 bugs + feat: riddle game (100 brain teasers)
a9d21e1 feat: expand math quiz bank to 101 questions
74de46b feat: 24point - add on-screen keypad for iPad
6420f4a feat: add D-pad to puzzle game for iPad
d91014c fix: sokoban - verified solvable levels, add D-pad
6961dee docs: add GitHub Pages deploy guide
6460a9b docs: add README
622e13e fix: rename Common/ to common/ for Linux case-sensitivity
5a06988 initial commit
```
