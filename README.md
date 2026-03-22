# CABO 记分小程序

一款用于记录 CABO 桌游分数的微信小程序。

---

## 🎮 CABO 游戏规则简介

CABO 是一款策略卡牌桌游，目标是通过记忆、推理和运气，让自己手牌的点数总和尽可能小。

### 核心计分规则

| 情况 | 计分方式 |
|------|----------|
| **普通玩家** | 手牌点数总和 = 本轮得分 |
| **喊 CABO 且赢了**（手牌分最低）| 本轮得 **0** 分 |
| **喊 CABO 但输了** | 手牌分 **+ 10** 分 |
| **总分恰好 = 100** | 自动变为 **50** 分（每人限一次）|
| **总分 > 100** | 游戏结束，总分最低者获胜 |

### 游戏流程
1. 每位玩家初始有 4 张手牌（只能看其中 2 张）
2. 轮到自己时，从牌堆抽牌，可选择：
   - 用新牌替换手牌（被换的牌弃掉）
   - 弃掉新牌，使用特殊能力（如偷看他人手牌）
3. 任何时候觉得自己手牌分最低，可以喊 **"CABO"**
4. 喊 CABO 后，所有玩家再轮一次，然后亮牌计分

---

## 📱 小程序功能

### 主要页面

| 页面 | 功能 |
|------|------|
| **玩家** | 添加/删除玩家（2-8人），开始/重置游戏 |
| **记分** | 每轮输入手牌分，标记 CABO 喊话者，自动计算特殊规则 |
| **历史** | 查看每轮详细记录，当前总分榜 |

### 特色功能

- ✅ **自动计分**：CABO 输赢、100分变50分等规则自动处理
- ✅ **本地存储**：游戏进度自动保存，断线续玩
- ✅ **游戏结束判定**：有人超过100分自动结束，显示获胜者
- ✅ **排名展示**：最终排名按分数从低到高排序

---

## 🏗️ 代码架构

```
cabo-miniapp/
├── app.js                 # 应用入口，全局状态管理
├── app.json               # 全局配置（页面路由、TabBar）
├── app.wxss               # 全局样式
├── project.config.json    # 项目配置
├── sitemap.json           # 搜索索引配置
├── .gitignore             # Git 忽略文件
│
├── pages/
│   ├── index/             # 玩家管理页
│   │   ├── index.js       # 添加/删除玩家，开始游戏
│   │   ├── index.wxml
│   │   ├── index.wxss
│   │   └── index.json
│   │
│   ├── game/              # 记分页（核心逻辑）
│   │   ├── game.js        # 每轮计分、CABO规则、游戏结束判定
│   │   ├── game.wxml
│   │   ├── game.wxss
│   │   └── game.json
│   │
│   └── history/           # 历史记录页
│       ├── history.js     # 数据预处理、历史展示
│       ├── history.wxml
│       ├── history.wxss
│       └── history.json
│
└── assets/
    └── icons/             # TabBar 图标
        ├── players.png
        ├── players_active.png
        ├── score.png
        ├── score_active.png
        ├── history.png
        └── history_active.png
```

### 核心数据流

```
app.js (globalData)
├── players[]          # 玩家列表 {id, name, totalScore, hasUsed50Rule}
├── rounds[]           # 每轮历史记录
├── gameStarted        # 游戏状态
└── currentRound       # 当前轮次
```

### 关键逻辑

**记分页 (`pages/game/game.js`)**
- `submitRound()`: 提交本轮分数，处理所有计分规则
- CABO 赢了 → `addScore = 0`
- CABO 输了 → `addScore = handScore + 10`
- 恰好100分 → `totalScore = 50`（标记 `hasUsed50Rule`）
- 有人 >100分 → 游戏结束，排序显示排名

**历史页 (`pages/history/history.js`)**
- `onShow()`: 预处理数据，将 `rounds` 反转（最新在前）
- 计算 `hasCaboCaller`/`caboCallerName` 等展示字段

---

## 🚀 使用方式

1. 使用 **微信开发者工具** 打开项目文件夹
2. 在「玩家」页添加 2-8 位玩家
3. 点击「开始游戏」
4. 每轮在「记分」页输入手牌总分
5. 有人喊 CABO 时，点击对应玩家的 CABO 按钮，选择赢/输
6. 点击「确认本轮分数」，系统自动计算
7. 有人超过 100 分时游戏结束，显示获胜者

---

## 📝 技术栈

- **框架**: 微信小程序原生框架
- **语言**: JavaScript + WXML + WXSS
- **存储**: 微信本地存储 API (`wx.setStorageSync`)

---

## 📄 License

MIT License
