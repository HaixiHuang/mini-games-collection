# 迷你游戏集合 — 实现计划

## 架构

```
N:\ClaudeGames\
  index.html              # 唯一入口，一键打开即玩
  common/
    style.css              # 全局样式
    engine.js              # 玩家档案、排行榜(localStorage)、游戏注册表
  games/
    1a2b/game.js           # 1A2B 猜数字
    24point/game.js        # 24点
    sokoban/game.js        # 推箱子
    hanoi/game.js          # 汉诺塔
    math/game.js           # 数学智力题（含奥赛题）
    puzzle/game.js         # 滑动拼图
  docs/
    plan.md                # 本文件
  pics/                    # 素材图片（预留）
```

## 设计原则

- **零依赖**：纯 HTML/CSS/JS，无框架、无构建工具
- **localStorage 持久化**：玩家信息和排行榜均存本地
- **游戏注册制**：新游戏只需创建 `games/xxx/game.js`，调用 `GameRegistry.register()` 即可自动出现在主页
- **三档难度**：每个游戏提供简单/中等/困难

## 通用模块 (common/engine.js)

### PlayerProfile
- 存储：名字 + 头像(emoji)
- 首次访问弹出设置框，之后记住

### Leaderboard
- Key 格式：`lb_{gameId}_{difficulty}`
- 存储字段：name, avatar, score, time, date
- 排序：分数优先 → 时间优先

### GameRegistry
- `register({id, name, icon, desc, difficulties, init})` — 注册游戏
- `list()` — 获取所有已注册游戏
- 游戏 init(container, difficulty, onComplete) — 标准接口

## 各游戏难度设计

| 游戏 | 简单 | 中等 | 困难 |
|------|------|------|------|
| 1A2B | 3位数字 0-5 | 4位数字 0-7 | 4位数字 0-9 |
| 24点 | 1-9 四数 | 1-13 四数 | 1-13 含分数解 |
| 推箱子 | 5×5 2箱 | 7×7 3箱 | 8×8 4箱 |
| 汉诺塔 | 3盘 | 5盘 | 7盘 |
| 数学题 | 四则运算 | 应用题 | 奥赛题 |
| 拼图 | 3×3 | 4×4 | 5×5 |

## 排行榜计分

| 游戏 | 计分方式 |
|------|----------|
| 1A2B | 猜测次数越少越好 |
| 24点 | 解题时间越短越好 |
| 推箱子 | 移动步数越少越好 |
| 汉诺塔 | 移动步数越少越好 |
| 数学题 | 正确率越高越好 |
| 拼图 | 完成时间越短越好 |

## 扩展方式

添加新游戏只需两步：
1. 创建 `games/新游戏/game.js`
2. 在 `index.html` 加一行 `<script src="games/新游戏/game.js"></script>`

游戏脚本调用 `GameRegistry.register({...})` 自动集成。
