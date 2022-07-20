// pages/viewOrder/viewOrder.js

import __user from "../../utils/user"

Page({
  data: {
    active: 0,
    tradeGoodsList: [],   // 全部买书
    pendingTrade: [],     // 未处理的买书
    confirmedTrade: [],   // 待收货的买书
    rejectedTrade: [],    // 已拒绝的买书
  },

  onLoad(options) {
    this.getMyTrade()

    this.setData({
      active: parseInt(options.active),
    })
  },

  onShow() {

  },

  // 获取我的买书数据
  getMyTrade() {
    wx.cloud.database().collection('trade')
      .where({
        _openid: __user.getUserOpenid(),
      })
      .get().then(res => {
        var tradeGoodsList = res.data
        var pendingTrade = []
        var confirmedTrade = []
        var rejectedTrade = []
        tradeGoodsList.forEach(i => {
          switch (i.state) {
            case 0:
              pendingTrade.push(i)
              break
            case 1:
              confirmedTrade.push(i)
              break
            case 3:
              rejectedTrade.push(i)
          }
        })

        // 按时间逆序
        tradeGoodsList.sort((a, b) => { return b.trade_time - a.trade_time })
        pendingTrade.sort((a, b) => { return b.trade_time - a.trade_time })
        confirmedTrade.sort((a, b) => { return b.trade_time - a.trade_time })
        rejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        this.setData({
          tradeGoodsList: tradeGoodsList,
          pendingTrade: pendingTrade,
          confirmedTrade: confirmedTrade,
          rejectedTrade: rejectedTrade,
        })
      })
  },
})