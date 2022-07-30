// pages/viewOrder/viewOrder.js

import __user from "../../utils/user"
import __util from "../../utils/util"

Page({
  data: {
    active: 0,
    tradeGoodsList: [],   // 全部买书
    pendingTrade: [],     // 未处理的买书
    confirmedTrade: [],   // 待收货的买书
    rejectedTrade: [],    // 已拒绝的买书
    tradeGoodsListSum: '',
    pendingTradeSum: '',
    confirmedTradeSum: '',
    rejectedTradeSum: '',
    nowTradeGoodsList: [],
    nowPendingTrade: [],
    nowConfirmedTrade: [],
    nowRejectedTrade: [],
  },

  onLoad(options) {
    this.getMyTrade()
    this.setData({
      active: parseInt(options.active),
    })
    this.getTradeGoodsListSum()
    this.getPendingTradeSum()
    this.getConfirmedTradeSum()
    this.getRejectedTradeSum()
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
          nowTradeGoodsList: tradeGoodsList.slice(0, 10),
          nowPendingTrade: pendingTrade.slice(0, 10),
          nowConfirmedTrade: confirmedTrade.slice(0, 10),
          nowRejectedTrade: rejectedTrade.slice(0, 10),
        })
      })
  },

  //取消交易
  rejectForm(event) {
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 3,
      }
    }).then(res => {
      wx.showToast({
        title: '已取消',
        icon: 'success'
      }).then(res => {

        // 找到需要确认元素的索引
        var tempPendingTrade = this.data.pendingTrade
        var tempNowPendingTrade = this.data.nowPendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 在已取消中添加元素
        var tempRejectedTrade = this.data.rejectedTrade
        var tempNowRejectedTrade = this.data.nowRejectedTrade
        tempRejectedTrade.push(tempPendingTrade[idx])
        tempNowRejectedTrade.push(tempPendingTrade[idx])
        // 已取消按时间逆序
        tempRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })
        tempNowRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在未处理中删除元素
        tempPendingTrade.splice(idx, 1)
        tempNowPendingTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          pendingTrade: tempPendingTrade,
          nowPendingTrade: tempNowPendingTrade,
          rejectedTrade: tempRejectedTrade,
          nowRejectedTrade: tempNowRejectedTrade,
        })

        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'updateState',
            goodsID: event.currentTarget.dataset.goodsid,
            state: 0,
          }
        })
      })
    })
  },

  // 确认收货
  confirmReceipt(event) {
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 2,
      }
    }).then(res => {
      wx.showToast({
        title: '收货成功',
        icon: 'success'
      }).then(res => {
        // 找到需要确认元素的索引
        var tempconfirmedTrade = this.data.confirmedTrade
        var tempNowconfirmedTrade = this.data.nowConfirmedTrade
        var idx = tempconfirmedTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 在待收货中删除元素
        tempconfirmedTrade.splice(idx, 1)
        tempNowconfirmedTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          confirmedTrade: tempconfirmedTrade,
          nowConfirmedTrade: tempNowconfirmedTrade,
        })

        // 在goods集合中删除书籍
        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'removeGoods',
            goodsID: event.currentTarget.dataset.goodsid
          }
        })
      })
    })
  },

  // 获取全部订单总数量
  getTradeGoodsListSum() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
    }).count().then(res => {
      this.setData({
        tradeGoodsListSum: res.total
      })
    })
  },

  // 获取卖家未处理订单总数量
  getPendingTradeSum() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
      state: 0
    }).count().then(res => {
      this.setData({
        pendingTradeSum: res.total
      })
    })
  },

  // 获取待收货订单总数量
  getConfirmedTradeSum() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
      state: 1
    }).count().then(res => {
      this.setData({
        confirmedTradeSum: res.total
      })
    })
  },

  // 获取已取消订单总数量
  getRejectedTradeSum() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
      state: 3
    }).count().then(res => {
      this.setData({
        rejectedTradeSum: res.total
      })
    })
  },

  // 上拉触底监听
  onReachBottom() {
    switch (this.data.active) {
      case 0:
        var res = __util.reachBottom('trade', this.data.tradeGoodsListSum, this.data.tradeGoodsList, this.data.nowTradeGoodsList, 'seller')
        if (res == undefined) return
        this.setData({
          tradeGoodsList: res.list,
          nowTradeGoodsList: res.nowList,
        })
        return
      case 1:
        var res = __util.reachBottom('trade', this.data.pendingTradeSum, this.data.pendingTrade, this.data.nowPendingTrade, 'seller', 0)
        if (res == undefined) return
        this.setData({
          pendingTrade: res.list,
          nowPendingTrade: res.nowList,
        })
        return
      case 2:
        var res = __util.reachBottom('trade', this.data.confirmedTradeSum, this.data.confirmedTrade, this.data.nowConfirmedTrade, 'seller', 1)
        if (res == undefined) return
        this.setData({
          confirmedTrade: res.list,
          nowConfirmedTrade: res.nowList,
        })
        return
      case 3:
        var res = __util.reachBottom('trade', this.data.rejectedTradeSum, this.data.rejectedTrade, this.data.nowRejectedTrade, 'seller', 3)
        if (res == undefined) return
        this.setData({
          rejectedTrade: res.list,
          nowRejectedTrade: res.nowList,
        })
        return
    }
  },

  changeActive(e) {
    this.data.active = e.detail.index
  },
})