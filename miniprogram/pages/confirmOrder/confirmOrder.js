
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
    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 1,
      }
    }).then(res => {
      wx.showToast({
        title: '已确认',
        icon: 'success'
      }).then(res => {
        // 找到需要确认元素的索引
        var tempPendingTrade = this.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 更改确认元素的state为1
        tempPendingTrade[idx].state = 1
        this.data.tradeGoodsList[this.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 1

        // 在已确认中添加元素
        var tempConfirmedTrade = this.data.confirmedTrade
        tempConfirmedTrade.push(tempPendingTrade[idx])
        // 已确认按时间逆序
        tempConfirmedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在未处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          pendingTrade: tempPendingTrade,
          confirmedTrade: tempConfirmedTrade,
          tradeGoodsList: this.data.tradeGoodsList,
          pendingTradeSum: this.data.pendingTradeSum - 1,
          confirmedTradeSum: this.data.confirmedTradeSum + 1,
        })
      })
    })
  },

  //取消交易
  rejectForm(event) {
    // 更新交易记录的state
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
        // 找到需要取消的元素的索引
        var tempPendingTrade = this.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 将取消的元素state改为3
        tempPendingTrade[idx].state = 3
        this.data.tradeGoodsList[this.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 3

        // 在已取消中添加元素
        var tempRejectedTrade = this.data.rejectedTrade
        tempRejectedTrade.push(tempPendingTrade[idx])

        // 已取消按时间逆序
        tempRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在待处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          pendingTrade: tempPendingTrade,
          rejectedTrade: tempRejectedTrade,
          tradeGoodsList: this.data.tradeGoodsList,
          pendingTradeSum: this.data.pendingTradeSum - 1,
          rejectedTradeSum: this.data.rejectedTradeSum + 1,
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
    * @returns 无返回值
    */
  getConfirmedTrade() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 1
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        res.data.forEach((i, idx) => {
          // 更新页面
          this.setData({
            confirmedTrade: res.data
          })
        })
      })
      .catch()
  },

  /**
    * 查找已取消数据
    * @returns 无返回值
    */
  getRejectedTrade() {
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
      })
      .catch()
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

  // 获取全部订单总数量
  getTradeGoodsListSum() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
    }).count().then(res => {
      this.setData({
        tradeGoodsListSum: res.total
      })
    })
  },

  // 获取未处理订单总数量
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

  // 获取已确认订单总数量
  getConfirmedTradeSum() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
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
      seller_openid: __user.getUserOpenid(),
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
})