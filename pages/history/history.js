// pages/history/history.js - 历史记录页
const app = getApp();

Page({
  data: {
    rounds: [],
    players: [],
    gameStarted: false,
  },

  onShow() {
    const { rounds, players, gameStarted } = app.globalData;

    // 预处理历史数据，把 WXML 里无法计算的字段提前算好
    const processedRounds = [...rounds].reverse().map(round => {
      // 找到喊Cabo的玩家名称
      let caboCallerName = '';
      let hasCaboCaller = false;
      if (round.caboCallerId !== null && round.caboCallerId !== undefined) {
        hasCaboCaller = true;
        // 优先从记录里的 caboCallerName 取（新数据有这个字段）
        if (round.caboCallerName) {
          caboCallerName = round.caboCallerName;
        } else {
          // 兼容旧数据：从 scores 里找
          const callerScore = round.scores.find(s => s.playerId === round.caboCallerId);
          caboCallerName = callerScore ? callerScore.playerName : '未知';
        }
      }

      return {
        ...round,
        hasCaboCaller,
        caboCallerName,
        caboResultText: round.caboWon ? '赢了🏆' : '输了😢',
      };
    });

    this.setData({
      rounds: processedRounds,
      players,
      gameStarted,
    });
  },
});
