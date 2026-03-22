// pages/index/index.js - 玩家管理页
const app = getApp();

Page({
  data: {
    players: [],
    inputName: '',
    gameStarted: false,
    showAddInput: false,
  },

  onShow() {
    this.setData({
      players: app.globalData.players,
      gameStarted: app.globalData.gameStarted,
    });
  },

  // 显示/隐藏输入框
  toggleInput() {
    this.setData({ showAddInput: !this.data.showAddInput, inputName: '' });
  },

  // 输入玩家姓名
  onNameInput(e) {
    this.setData({ inputName: e.detail.value });
  },

  // 添加玩家
  addPlayer() {
    const name = this.data.inputName.trim();
    if (!name) {
      wx.showToast({ title: '请输入玩家名称', icon: 'none' });
      return;
    }
    if (this.data.players.find(p => p.name === name)) {
      wx.showToast({ title: '玩家名称已存在', icon: 'none' });
      return;
    }
    if (this.data.players.length >= 8) {
      wx.showToast({ title: '最多支持8位玩家', icon: 'none' });
      return;
    }

    const newPlayer = {
      id: Date.now(),
      name,
      totalScore: 0,
      hasUsed50Rule: false, // 100分变50分只能用一次
    };

    const players = [...this.data.players, newPlayer];
    app.globalData.players = players;
    app.saveGame();

    this.setData({ players, inputName: '', showAddInput: false });
  },

  // 删除玩家
  removePlayer(e) {
    const { id } = e.currentTarget.dataset;
    if (this.data.gameStarted) {
      wx.showToast({ title: '游戏进行中，无法删除玩家', icon: 'none' });
      return;
    }
    wx.showModal({
      title: '确认删除',
      content: '确定要移除这位玩家吗？',
      success: (res) => {
        if (res.confirm) {
          const players = this.data.players.filter(p => p.id !== id);
          app.globalData.players = players;
          app.saveGame();
          this.setData({ players });
        }
      },
    });
  },

  // 开始游戏
  startGame() {
    if (this.data.players.length < 2) {
      wx.showToast({ title: '至少需要2位玩家', icon: 'none' });
      return;
    }
    if (this.data.gameStarted) {
      // 已有游戏，跳转到记分页
      wx.switchTab({ url: '/pages/game/game' });
      return;
    }

    wx.showModal({
      title: '开始游戏',
      content: `共 ${this.data.players.length} 位玩家，确定开始？`,
      success: (res) => {
        if (res.confirm) {
          // 重置所有玩家分数
          const players = this.data.players.map(p => ({
            ...p,
            totalScore: 0,
            hasUsed50Rule: false,
          }));
          app.globalData.players = players;
          app.globalData.gameStarted = true;
          app.globalData.currentRound = 1;
          app.globalData.rounds = [];
          app.saveGame();

          this.setData({ players, gameStarted: true });
          wx.switchTab({ url: '/pages/game/game' });
        }
      },
    });
  },

  // 结束/重置游戏
  resetGame() {
    wx.showModal({
      title: '重置游戏',
      content: '确定要结束当前游戏并重置所有数据吗？',
      success: (res) => {
        if (res.confirm) {
          // 保留玩家名单，重置分数
          const players = this.data.players.map(p => ({
            ...p,
            totalScore: 0,
            hasUsed50Rule: false,
          }));
          app.globalData.players = players;
          app.globalData.gameStarted = false;
          app.globalData.currentRound = 1;
          app.globalData.rounds = [];
          app.saveGame();

          this.setData({ players, gameStarted: false });
          wx.showToast({ title: '游戏已重置', icon: 'success' });
        }
      },
    });
  },
});
