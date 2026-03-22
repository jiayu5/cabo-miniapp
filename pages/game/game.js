// pages/game/game.js - 记分页（核心逻辑）
const app = getApp();

Page({
  data: {
    players: [],
    currentRound: 1,
    gameStarted: false,

    // 当前轮次输入
    roundScores: [],      // [{playerId, score: ''}]
    caboCallerId: null,   // 本轮喊Cabo的玩家ID
    caboCallerName: '',   // 本轮喊Cabo的玩家名称
    caboWon: null,        // true=赢了(分最低), false=输了

    // 游戏结束
    gameOver: false,
    winner: null,
    winnerMinScore: null,

    // 特殊事件提示
    specialEvents: [],
  },

  onShow() {
    const { players, currentRound, gameStarted } = app.globalData;
    if (!gameStarted || players.length === 0) {
      this.setData({
        gameStarted: false,
        players: [],
        currentRound: 1,
        gameOver: false,
      });
      return;
    }

    this.setData({
      players,
      currentRound,
      gameStarted,
    });
    this.initRoundScores();
  },

  // 初始化本轮输入
  initRoundScores() {
    const roundScores = this.data.players.map(p => ({
      playerId: p.id,
      playerName: p.name,
      score: '',
      isCaboCaller: false,
    }));
    this.setData({
      roundScores,
      caboCallerId: null,
      caboCallerName: '',
      caboWon: null,
      specialEvents: [],
    });
  },

  // 输入分数
  onScoreInput(e) {
    const { index } = e.currentTarget.dataset;
    const value = e.detail.value;
    const num = value.replace(/[^0-9]/g, '');
    const key = `roundScores[${index}].score`;
    this.setData({ [key]: num });
  },

  // 选择/取消选择Cabo喊话者
  selectCaboCaller(e) {
    const { playerid, playername } = e.currentTarget.dataset;

    if (this.data.caboCallerId === playerid) {
      // 取消选择：更新所有行的isCaboCaller状态
      const roundScores = this.data.roundScores.map(rs => ({
        ...rs,
        isCaboCaller: false,
      }));
      this.setData({ caboCallerId: null, caboCallerName: '', caboWon: null, roundScores });
    } else {
      const roundScores = this.data.roundScores.map(rs => ({
        ...rs,
        isCaboCaller: rs.playerId === playerid,
      }));
      this.setData({
        caboCallerId: playerid,
        caboCallerName: playername,
        caboWon: null,
        roundScores,
      });
    }
  },

  // 设置Cabo结果
  setCaboResult(e) {
    const { result } = e.currentTarget.dataset;
    this.setData({ caboWon: result === 'win' });
  },

  // 提交本轮分数
  submitRound() {
    const { roundScores, caboCallerId, caboWon, players } = this.data;

    // 校验所有分数已填写
    for (let i = 0; i < roundScores.length; i++) {
      if (roundScores[i].score === '' || roundScores[i].score === null || roundScores[i].score === undefined) {
        wx.showToast({ title: `请填写 ${roundScores[i].playerName} 的分数`, icon: 'none' });
        return;
      }
    }

    // 校验Cabo结果
    if (caboCallerId !== null && caboWon === null) {
      wx.showToast({ title: '请选择CABO喊话者的结果（赢/输）', icon: 'none' });
      return;
    }

    // 计算本轮后的新分数
    const specialEvents = [];
    const updatedPlayers = players.map((player, index) => {
      let addScore = parseInt(roundScores[index].score, 10) || 0;
      const isCaboCaller = player.id === caboCallerId;
      const noteList = [];

      // Cabo规则
      if (isCaboCaller) {
        if (caboWon) {
          addScore = 0;
          noteList.push('喊CABO赢！本轮+0');
          specialEvents.push(`🏆 ${player.name} 喊CABO赢了，本轮得0分！`);
        } else {
          const originalScore = parseInt(roundScores[index].score, 10) || 0;
          addScore = originalScore + 10;
          noteList.push(`喊CABO输！${originalScore}+10=${addScore}`);
          specialEvents.push(`😢 ${player.name} 喊CABO输了，本轮得 ${addScore} 分！`);
        }
      }

      let newTotal = player.totalScore + addScore;
      let hasUsed50Rule = player.hasUsed50Rule;

      // 100分变50分规则（每位玩家只能触发一次）
      if (newTotal === 100 && !player.hasUsed50Rule) {
        newTotal = 50;
        hasUsed50Rule = true;
        noteList.push('恰好100分→50分！');
        specialEvents.push(`✨ ${player.name} 恰好100分，变为50分！`);
      }

      return {
        ...player,
        totalScore: newTotal,
        hasUsed50Rule,
        _roundAddScore: addScore,
        _roundNote: noteList.join(' | '),
      };
    });

    // 检查游戏是否结束（有玩家超过100分）
    const someOver100 = updatedPlayers.some(p => p.totalScore > 100);
    let gameOver = someOver100;
    let winner = null;

    let winnerMinScore = null;
    if (gameOver) {
      const minScore = Math.min(...updatedPlayers.map(p => p.totalScore));
      winner = updatedPlayers.filter(p => p.totalScore === minScore);
      winnerMinScore = minScore;
      specialEvents.push(`🎉 游戏结束！${winner.map(w => w.name).join('、')} 获胜！`);
    }

    // 记录本轮历史
    const roundRecord = {
      round: this.data.currentRound,
      scores: roundScores.map((rs, i) => ({
        playerId: rs.playerId,
        playerName: rs.playerName,
        addScore: updatedPlayers[i]._roundAddScore,
        totalScore: updatedPlayers[i].totalScore,
        note: updatedPlayers[i]._roundNote || '',
      })),
      caboCallerId,
      caboCallerName: this.data.caboCallerName,
      caboWon,
    };

    // 清理临时字段
    let cleanPlayers = updatedPlayers.map(p => {
      const { _roundAddScore, _roundNote, ...rest } = p;
      return rest;
    });

    // 游戏结束时，按分数从低到高排序（用于最终排名展示）
    if (gameOver) {
      cleanPlayers = cleanPlayers.sort((a, b) => a.totalScore - b.totalScore);
    }

    // 更新全局状态
    app.globalData.players = cleanPlayers;
    app.globalData.rounds = [...app.globalData.rounds, roundRecord];
    app.globalData.currentRound = this.data.currentRound + 1;
    app.globalData.gameStarted = !gameOver;
    app.saveGame();

    this.setData({
      players: cleanPlayers,
      currentRound: this.data.currentRound + 1,
      specialEvents,
      gameOver,
      winner,
      winnerMinScore,
      gameStarted: !gameOver,
    });

    if (!gameOver) {
      // 延迟一下再重置，让玩家看到特殊提示
      setTimeout(() => {
        this.initRoundScores();
      }, specialEvents.length > 0 ? 2000 : 0);
    }
  },

  // 跳转历史
  goHistory() {
    wx.switchTab({ url: '/pages/history/history' });
  },

  // 结束游戏后重新开始
  newGame() {
    wx.showModal({
      title: '新游戏',
      content: '是否保留玩家名单，重置分数开始新游戏？',
      success: (res) => {
        if (res.confirm) {
          const players = app.globalData.players.map(p => ({
            ...p,
            totalScore: 0,
            hasUsed50Rule: false,
          }));
          app.globalData.players = players;
          app.globalData.rounds = [];
          app.globalData.currentRound = 1;
          app.globalData.gameStarted = true;
          app.saveGame();

          this.setData({
            players,
            currentRound: 1,
            gameOver: false,
            winner: null,
            winnerMinScore: null,
            specialEvents: [],
            gameStarted: true,
          });
          this.initRoundScores();
        }
      },
    });
  },
});
