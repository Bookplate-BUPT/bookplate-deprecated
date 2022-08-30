// pages/viewOrder/viewOrder.js

import __user from "../../utils/user"
import __util from "../../utils/util"

Page({
  data: {
    active: 0,

    tradeGoodsList: [],   // 全部的书籍
    pendingTrade: [],     // 待处理的书籍
    confirmedTrade: [],   // 待收货的书籍
    rejectedTrade: [],    // 已拒绝的书籍
    successfulTrade: [],  // 已成交的书籍

    tradeGoodsListSum: '',  // 全部的书籍数量
    pendingTradeSum: '',    // 待处理的书籍数量
    confirmedTradeSum: '',  // 待收货的书籍数量
    rejectedTradeSum: '',   // 已拒绝的书籍数量
    successfulTradeSum: '', // 已成交的书籍数量
  },

  onLoad(options) {
    this.getMyTrade()
    this.getAllSum()
  },

  // 上拉触底监听
  onReachBottom() {
    switch (this.data.active) {
      case 0:
        if (this.data.tradeGoodsList.length < this.data.tradeGoodsListSum)
          wx.cloud.database().collection('trade').where({
            _openid: __user.getUserOpenid()
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.tradeGoodsList.length)
            .get()
            .then(res => {
              // 格式化时间
              res.data.forEach((i, idx) => {
                res.data[idx].trade_time = this.formatTime(i.trade_time)
              })
              this.data.tradeGoodsList = [...this.data.tradeGoodsList, ...res.data]
              // 更新页面
              this.setData({
                tradeGoodsList: this.data.tradeGoodsList
              })
            })
            .catch()
        else
          console.log('this is else')
        return
      case 1:
        if (this.data.pendingTrade.length < this.data.pendingTradeSum)
          wx.cloud.database().collection('trade').where({
            _openid: __user.getUserOpenid(),
            state: 0
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.pendingTrade.length)
            .get()
            .then(res => {
              // 格式化时间
              res.data.forEach((i, idx) => {
                res.data[idx].trade_time = this.formatTime(i.trade_time)
              })
              this.data.pendingTrade = [...this.data.pendingTrade, ...res.data]
              // 更新页面
              this.setData({
                pendingTrade: this.data.pendingTrade
              })
            })
            .catch()
        else
          console.log('this is else')
        return
      case 2:
        if (this.data.confirmedTrade.length < this.data.confirmedTradeSum)
          wx.cloud.database().collection('trade').where({
            _openid: __user.getUserOpenid(),
            state: 1
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.confirmedTrade.length)
            .get()
            .then(res => {
              // 格式化时间
              res.data.forEach((i, idx) => {
                res.data[idx].trade_time = this.formatTime(i.trade_time)
              })
              this.data.confirmedTrade = [...this.data.confirmedTrade, ...res.data]
              // 更新页面
              this.setData({
                confirmedTrade: this.data.confirmedTrade
              })
            })
            .catch()
        else
          console.log('this is else')
        return
      case 3:
        if (this.data.rejectedTrade.length < this.data.rejectedTradeSum)
          wx.cloud.database().collection('trade').where({
            _openid: __user.getUserOpenid(),
            state: 3
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.rejectedTrade.length)
            .get()
            .then(res => {
              // 格式化时间
              res.data.forEach((i, idx) => {
                res.data[idx].trade_time = this.formatTime(i.trade_time)
              })
              this.data.rejectedTrade = [...this.data.rejectedTrade, ...res.data]
              // 更新页面
              this.setData({
                rejectedTrade: this.data.rejectedTrade
              })
            })
            .catch()
        else
          console.log('this is else')
        return
      case 4:
        if (this.data.successfulTrade.length < this.data.successfulTradeSum)
          wx.cloud.database().collection('trade').where({
            _openid: __user.getUserOpenid(),
            state: 2
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.successfulTrade.length)
            .get()
            .then(res => {
              // 格式化时间
              res.data.forEach((i, idx) => {
                res.data[idx].trade_time = this.formatTime(i.trade_time)
              })
              this.data.successfulTrade = [...this.data.successfulTrade, ...res.data]
              // 更新页面
              this.setData({
                successfulTrade: this.data.successfulTrade
              })
            })
            .catch()
        else
          console.log('this is else')
        return
    }
  },

  //拒绝请求
  rejectForm(event) {
    wx.showLoading({
      title: '取消中……',
    })

    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        type: 3,
        _id: event.currentTarget.dataset._id,
        state: 3,
      }
    })
      .then(res => {
        // 将全部中需要拒绝的元素的state改为3
        this.data.tradeGoodsList[this.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 3

        // 在待处理中删除元素
        this.data.pendingTrade.splice(this.data.pendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id }), 1)

        // 更新页面
        this.setData({
          pendingTrade: this.data.pendingTrade,
          tradeGoodsList: this.data.tradeGoodsList,
          pendingTradeSum: this.data.pendingTradeSum - 1,
        })
        return
      })
      .then(res => wx.cloud.callFunction({
        name: 'updateGoods',
        data: {
          type: 'updateState',
          goodsID: event.currentTarget.dataset.goodsid,
          state: 0,
        }
      }))
      .then(res => this.getRejectedTrade())
      .then(res => this.getRejectedTradeSum())
      .then(res => wx.showToast({
        title: '取消成功',
      }))
      .catch(err => console.error(err))
  },

  // 确认收货
  confirmReceipt(event) {
    wx.showLoading({
      title: '收货中……',
    })

    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        type: 2,
        _id: event.currentTarget.dataset._id,
        state: 2,
      }
    })
      .then(res => {
        // 将全部中将要变成完成的元素state改为2
        this.data.tradeGoodsList[this.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 2

        // 在待收货中删除元素
        this.data.confirmedTrade.splice(this.data.confirmedTrade.findIndex(i => i._id == event.currentTarget.dataset._id), 1)

        // 更新页面
        this.setData({
          confirmedTrade: this.data.confirmedTrade,
          tradeGoodsList: this.data.tradeGoodsList,
          confirmedTradeSum: this.data.confirmedTradeSum - 1,
        })

        return
      })
      .then(res =>
        // 在goods集合中删除书籍
        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'removeGoods',
            goodsID: event.currentTarget.dataset.goodsid
          }
        }))
      .then(res => this.getSuccessfulTrade())
      .then(res => this.getSuccessfulTradeSum())
      .then(res => wx.showToast({
        title: '收货成功',
      }))
      .catch(err => console.error(err))
  },

  /**
   * 获取我的全部买书交易记录
   * @returns 无返回值
   */
  getMyTrade() {
    this.getTradeGoodsList()
    this.getPendingTrade()
    this.getConfirmedTrade()
    this.getRejectedTrade()
    this.getSuccessfulTrade()
  },

  /**
   * 查找全部数据
   * @returns 无返回值
   */
  getTradeGoodsList() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid()
    })
      .orderBy('trade_time', 'desc')
      .limit(20)
      .get()
      .then(res => {
        // 格式化时间
        res.data.forEach((i, idx) => {
          res.data[idx].trade_time = this.formatTime(i.trade_time)
        })
        // 更新页面
        this.setData({
          tradeGoodsList: res.data
        })
      })
      .catch()
  },

  /**
    * 查找待处理数据
    * @returns 无返回值
    */
  getPendingTrade() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
      state: 0
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        // 格式化时间
        res.data.forEach((i, idx) => {
          res.data[idx].trade_time = this.formatTime(i.trade_time)
        })
        // 更新页面
        this.setData({
          pendingTrade: res.data
        })
      })
      .catch()
  },

  /**
    * 查找待收货数据
   * @returns 无返回值
    */
  getConfirmedTrade() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
      state: 1
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        // 格式化时间
        res.data.forEach((i, idx) => {
          res.data[idx].trade_time = this.formatTime(i.trade_time)
        })
        // 更新页面
        this.setData({
          confirmedTrade: res.data
        })

      })
      .catch()
  },

  /**
    * 查找已拒绝数据
    * @returns 返回 Promise 类型
    */
  getRejectedTrade() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        _openid: __user.getUserOpenid(),
        state: 3
      })
        .orderBy('trade_time', 'desc')
        .get()
        .then(res => {
          // 格式化时间
          res.data.forEach((i, idx) => {
            res.data[idx].trade_time = this.formatTime(i.trade_time)
          })
          // 更新页面
          this.setData({
            rejectedTrade: res.data
          })
          resolve(res)
        })
        .catch()
    })
    return promise
  },

  /**
    * 查找已成交数据
    * @returns 返回 Promise 类型
    */
  getSuccessfulTrade() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        _openid: __user.getUserOpenid(),
        state: 2
      })
        .orderBy('trade_time', 'desc')
        .get()
        .then(res => {
          // 格式化时间
          res.data.forEach((i, idx) => {
            res.data[idx].trade_time = this.formatTime(i.trade_time)
          })
          // 更新页面
          this.setData({
            successfulTrade: res.data
          })
          resolve(res)
        })
        .catch()
    })
    return promise
  },

  /**
   * 获取本页面所有的总数量
   * @returns 无返回值
   */
  getAllSum() {
    this.getTradeGoodsListSum()
    this.getPendingTradeSum()
    this.getConfirmedTradeSum()
    this.getRejectedTradeSum()
    this.getSuccessfulTradeSum()
  },

  /**
   * 获取全部订单总数量
   */
  getTradeGoodsListSum() {
    wx.cloud.database().collection('trade').where({
      _openid: __user.getUserOpenid(),
    }).count().then(res => {
      this.setData({
        tradeGoodsListSum: res.total
      })
    })
  },

  /**
   * 获取待处理订单总数量
   */
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

  /**
   * 获取待收货订单总数量
   */
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

  /**
   * 获取已拒绝订单总数量
   * @returns 返回 Promise 类型
   */
  getRejectedTradeSum() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        _openid: __user.getUserOpenid(),
        state: 3
      }).count().then(res => {
        this.setData({
          rejectedTradeSum: res.total
        })
        resolve(res)
      })
    })
    return promise
  },

  /**
   * 获取已成交的书籍总数量
   * @returns 返回 Promise 类型
   */
  getSuccessfulTradeSum() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        _openid: __user.getUserOpenid(),
        state: 2
      }).count().then(res => {
        this.setData({
          successfulTradeSum: res.total
        })
        resolve(res)
      })
    })
    return promise
  },

  changeActive(e) {
    this.data.active = e.detail.index
  },

  /**
   * 格式化时间
   * @param {Date} date 格式化的时间
   */
  formatTime(date) {
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()
    var hours = date.getHours() < 10 ? '0' + date.getHours() : date.getHours()
    var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()
    return `${year}年${month}月${day} ${hours}:${minutes}`
  },
})