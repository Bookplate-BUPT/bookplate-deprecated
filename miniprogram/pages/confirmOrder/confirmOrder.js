
import __user from "../../utils/user"
import __util from "../../utils/util"

Page({

  data: {
    active: 0,
    tradeGoodsList: [],
    pendingTrade: [],
    confirmedTrade: [],
    rejectedTrade: [],
    successfulTrade: [],      // 成功交易的书籍
    tradeGoodsListSum: '',
    pendingTradeSum: '',
    confirmedTradeSum: '',
    rejectedTradeSum: '',
    successfulTradeSum: '',
    isRefresh: false,         // 是否刷新页面
  },

  // 上拉触底监听
  onReachBottom() {
    switch (this.data.active) {
      case 0:
        if (this.data.tradeGoodsList.length < this.data.tradeGoodsListSum)
          wx.cloud.database().collection('trade').where({
            seller_openid: __user.getUserOpenid()
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.tradeGoodsList.length)
            .get()
            .then(res => {
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
            seller_openid: __user.getUserOpenid(),
            state: 0
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.pendingTrade.length)
            .get()
            .then(res => {
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
            seller_openid: __user.getUserOpenid(),
            state: 1
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.confirmedTrade.length)
            .get()
            .then(res => {
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
            seller_openid: __user.getUserOpenid(),
            state: 3
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.rejectedTrade.length)
            .get()
            .then(res => {
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
            seller_openid: __user.getUserOpenid(),
            state: 2
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.successfulTrade.length)
            .get()
            .then(res => {
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

  //确认交易
  confirmForm(event) {
    wx.showLoading({
      title: '确认中……',
    })

    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 1,
      }
    })
      .then(res => {
        // 在全部标签中将要确认元素的state改为1
        this.data.tradeGoodsList[this.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 1

        // 在未处理中删除元素
        this.data.pendingTrade.splice(this.data.pendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id }), 1)

        // 更新页面
        this.setData({
          pendingTrade: this.data.pendingTrade,
          tradeGoodsList: this.data.tradeGoodsList,
          pendingTradeSum: this.data.pendingTradeSum - 1,
        })
        return
      })
      .then(res => this.getConfirmedTrade())
      .then(res => this.getConfirmedTradeSum())
      .then(res => wx.showToast({
        title: '确认成功',
      }))
      .catch(err => console.error(err))
  },

  //拒绝请求
  rejectForm(event) {
    wx.showLoading({
      title: '拒绝中……',
    })

    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 3,
      }
    })
      .then(res => {
        // 在待处理中删除元素
        this.data.pendingTrade.splice(this.data.pendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id }), 1)

        // 将全部中要拒绝的元素的state改为3
        this.data.tradeGoodsList[this.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 3

        // 更新页面
        this.setData({
          pendingTrade: this.data.pendingTrade,
          tradeGoodsList: this.data.tradeGoodsList,
          pendingTradeSum: this.data.pendingTradeSum - 1,
        })
        return
      })
      .then(res => {
        return wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'updateState',
            goodsID: event.currentTarget.dataset.goodsid,
            state: 0,
          }
        })
      })
      .then(res => this.getRejectedTrade())
      .then(res => this.getRejectedTradeSum())
      .then(res => wx.showToast({
        title: '拒绝成功',
      }))
      .catch(err => console.error(err))
  },

  changeActive(e) {
    this.data.active = e.detail.index
  },

  // 页面初始化数据
  onLoad: function (options) {
    this.getMyTrade()
    this.getAllSum()
  },

  //查找trade表里面的数据
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
      seller_openid: __user.getUserOpenid()
    })
      .orderBy('trade_time', 'desc')
      .limit(20)
      .get()
      .then(res => {
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
      seller_openid: __user.getUserOpenid(),
      state: 0
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        // 更新页面
        this.setData({
          pendingTrade: res.data
        })
      })
      .catch()
  },

  /**
    * 查找已确认数据
    * @returns 返回 Promise 类型
    */
  getConfirmedTrade() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        seller_openid: __user.getUserOpenid(),
        state: 1
      })
        .orderBy('trade_time', 'desc')
        .get()
        .then(res => {
          // 更新页面
          this.setData({
            confirmedTrade: res.data
          })
          resolve(res)
        })
        .catch()
    })
    return promise
  },

  /**
    * 查找已拒绝数据
    * @returns 返回 Promise 类型
    */
  getRejectedTrade() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        seller_openid: __user.getUserOpenid(),
        state: 3
      })
        .orderBy('trade_time', 'desc')
        .get()
        .then(res => {
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
    * @returns 无返回值
    */
  getSuccessfulTrade() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 2
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        // 更新页面
        this.setData({
          successfulTrade: res.data
        })
      })
      .catch()
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
      seller_openid: __user.getUserOpenid(),
    }).count().then(res => {
      this.setData({
        tradeGoodsListSum: res.total
      })
    })
  },

  /**
   * 获取未处理订单总数量
   */
  getPendingTradeSum() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 0
    }).count().then(res => {
      this.setData({
        pendingTradeSum: res.total
      })
    })
  },

  /**
   * 获取已确认订单总数量
   */
  getConfirmedTradeSum() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        seller_openid: __user.getUserOpenid(),
        state: 1
      }).count().then(res => {
        this.setData({
          confirmedTradeSum: res.total
        })
        resolve(res)
      })
    })
    return promise
  },

  /**
   * 获取已拒绝订单总数量
   * @returns 返回 Promise 
   */
  getRejectedTradeSum() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade').where({
        seller_openid: __user.getUserOpenid(),
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
   * 获取交易成功的书籍总数量
   */
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
})