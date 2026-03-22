App({
  globalData: {
    // 当前游戏玩家列表及分数状态
    players: [],
    // 每轮历史记录
    rounds: [],
    // 游戏是否进行中
    gameStarted: false,
    // 当前轮次
    currentRound: 1,
  },

  onLaunch() {
    // 尝试恢复本地存储的游戏状态
    try {
      const savedGame = wx.getStorageSync('cabo_game');
      if (savedGame) {
        this.globalData = Object.assign(this.globalData, savedGame);
      }
    } catch (e) {
      console.log('No saved game found');
    }
  },

  // 保存游戏状态到本地存储
  saveGame() {
    try {
      wx.setStorageSync('cabo_game', {
        players: this.globalData.players,
        rounds: this.globalData.rounds,
        gameStarted: this.globalData.gameStarted,
        currentRound: this.globalData.currentRound,
      });
    } catch (e) {
      console.error('Save failed', e);
    }
  },

  // 清除游戏状态
  clearGame() {
    this.globalData.players = [];
    this.globalData.rounds = [];
    this.globalData.gameStarted = false;
    this.globalData.currentRound = 1;
    try {
      wx.removeStorageSync('cabo_game');
    } catch (e) {}
  },
});
