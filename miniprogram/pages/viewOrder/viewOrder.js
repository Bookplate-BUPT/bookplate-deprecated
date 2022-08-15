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
    successfulTrade: [],  // 成功交易的书籍
    tradeGoodsListSum: '',
    pendingTradeSum: '',
    confirmedTradeSum: '',
    rejectedTradeSum: '',
    successfulTradeSum: '',
  },

  onLoad(options) {
    this.countUnreceived()
    this.getMyTrade()
    this.getTradeGoodsListSum()
    this.getPendingTradeSum()
    this.getConfirmedTradeSum()
    this.getRejectedTradeSum()
    this.getSuccessfulTradeSum()
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
        var successfulTrade = []
        tradeGoodsList.forEach(i => {
          switch (i.state) {
            case 0:
              pendingTrade.push(i)
              break
            case 1:
              confirmedTrade.push(i)
              break
            case 2:
              successfulTrade.push(i)
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
        successfulTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        this.setData({
          tradeGoodsList: tradeGoodsList,
          pendingTrade: pendingTrade,
          confirmedTrade: confirmedTrade,
          rejectedTrade: rejectedTrade,
          successfulTrade: successfulTrade,
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
        var idx = tempPendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 在已取消中添加元素
        var tempRejectedTrade = this.data.rejectedTrade
        tempRejectedTrade.push(tempPendingTrade[idx])
        // 已取消按时间逆序
        tempRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在未处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          pendingTrade: tempPendingTrade,
          rejectedTrade: tempRejectedTrade
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
        var idx = tempconfirmedTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 在待收货中删除元素
        tempconfirmedTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          confirmedTrade: tempconfirmedTrade
        })
        if (!tempconfirmedTrade.length) {
          this.setData({
            unreceived: false
          })
        }

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

  // 获取交易成功的书籍总数量
  getSuccessfulTradeSum() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 2
    }).count().then(res => {
      this.setData({
        successfulTradeSum: res.total
      })
    })
  },

  // 上拉触底监听
  onReachBottom() {
    switch (this.data.active) {
      case 0:
        if (this.data.tradeGoodsList.length < this.data.tradeGoodsListSum)
          wx.cloud.database().collection('trade').skip(this.data.tradeGoodsList.length).get()
            .then(res => {
              this.data.tradeGoodsList = [...this.data.tradeGoodsList, ...res.data]
              // 更新页面
              this.setData({
                tradeGoodsList: this.data.tradeGoodsList
              })
            })
        return
      case 1:
        if (this.data.pendingTrade.length < this.data.pendingTradeSum)
          wx.cloud.database().collection('trade').skip(this.data.pendingTrade.length).get()
            .then(res => {
              this.data.pendingTrade = [...this.data.pendingTrade, ...res.data]
              // 更新页面
              this.setData({
                pendingTrade: this.data.pendingTrade
              })
            })
        return
      case 2:
        if (this.data.confirmedTrade.length < this.data.confirmedTradeSum)
          wx.cloud.database().collection('trade').skip(this.data.confirmedTrade.length).get()
            .then(res => {
              this.data.confirmedTrade = [...this.data.confirmedTrade, ...res.data]
              // 更新页面
              this.setData({
                confirmedTrade: this.data.confirmedTrade
              })
            })
        return
      case 3:
        if (this.data.rejectedTrade.length < this.data.rejectedTradeSum)
          wx.cloud.database().collection('trade').skip(this.data.rejectedTrade.length).get()
            .then(res => {
              this.data.rejectedTrade = [...this.data.rejectedTrade, ...res.data]
              // 更新页面
              this.setData({
                rejectedTrade: this.data.rejectedTrade
              })
            })
        return
      case 4:
        if (this.data.successfulTrade.length < this.data.successfulTradeSum)
          wx.cloud.database().collection('trade').skip(this.data.successfulTrade.length).get()
            .then(res => {
              this.data.successfulTrade = [...this.data.successfulTrade, ...res.data]
              // 更新页面
              this.setData({
                successfulTrade: this.data.successfulTrade
              })
            })
        return
    }
  },

  changeActive(e) {
    this.data.active = e.detail.index
  },

  // 计算暂未收货的交易量
  countUnreceived() {
    wx.cloud.database().collection('trade')
      .where({
        _openid: __user.getUserOpenid(),
        state: 1
      })
      .get()
      .then(res => {
        if (res.data.length)
          this.setData({
            unreceived: true
          })
        else
          this.setData({
            unreceived: false
          })
      })
  }
})