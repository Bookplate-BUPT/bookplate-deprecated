
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
    popup: {},
    show: false,
  },

  onClose(e) {
    this.setData({
      show: false
    })
  },

  //查找trade表里面的数据
  getMyTrade() {
    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid()
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        res.data.forEach((i, idx) => {
          if (i.image_list.length == 0) {
            i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
          }
        })

        // 更新页面
        this.setData({
          tradeGoodsList: res.data
        })
      })
      .catch()

    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 0
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        res.data.forEach((i, idx) => {
          if (i.image_list.length == 0) {
            i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
          }
        })

        // 更新页面
        this.setData({
          pendingTrade: res.data
        })
      })
      .catch()

    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 1
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        res.data.forEach((i, idx) => {
          if (i.image_list.length == 0) {
            i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
          }
        })

        // 更新页面
        this.setData({
          confirmedTrade: res.data
        })
      })
      .catch()

    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 3
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        res.data.forEach((i, idx) => {
          if (i.image_list.length == 0) {
            i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
          }
        })

        // 更新页面
        this.setData({
          rejectedTrade: res.data
        })
      })
      .catch()

    wx.cloud.database().collection('trade').where({
      seller_openid: __user.getUserOpenid(),
      state: 2
    })
      .orderBy('trade_time', 'desc')
      .get()
      .then(res => {
        res.data.forEach((i, idx) => {
          if (i.image_list.length == 0) {
            i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
          }
        })

        // 更新页面
        this.setData({
          successfulTrade: res.data
        })
      })
      .catch()
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
              res.data.forEach((i, idx) => {
                if (i.image_list.length == 0) {
                  i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
                }
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
            seller_openid: __user.getUserOpenid(),
            state: 0
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.pendingTrade.length)
            .get()
            .then(res => {
              res.data.forEach((i, idx) => {
                if (i.image_list.length == 0) {
                  i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
                }
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
            seller_openid: __user.getUserOpenid(),
            state: 1
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.confirmedTrade.length)
            .get()
            .then(res => {
              res.data.forEach((i, idx) => {
                if (i.image_list.length == 0) {
                  i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
                }
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
            seller_openid: __user.getUserOpenid(),
            state: 3
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.rejectedTrade.length)
            .get()
            .then(res => {
              res.data.forEach((i, idx) => {
                if (i.image_list.length == 0) {
                  i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
                }
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
            seller_openid: __user.getUserOpenid(),
            state: 2
          })
            .orderBy('trade_time', 'desc')
            .skip(this.data.successfulTrade.length)
            .get()
            .then(res => {
              res.data.forEach((i, idx) => {
                if (i.image_list.length == 0) {
                  i.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
                }
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

  //打开弹出层
  ShowPopup(e) {
    this.setData({
      popup: e.currentTarget.dataset.item,
      show: true
    })
  },

  //确认交易
  commitForm(event) {
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
        this.setData({
          show: false
        })

        // 找到需要确认元素的索引
        var tempPendingTrade = this.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

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
        this.setData({
          show: false
        })

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
          rejectedTrade: tempRejectedTrade,
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
    this.getTradeGoodsListSum()
    this.getPendingTradeSum()
    this.getConfirmedTradeSum()
    this.getRejectedTradeSum()
    this.getSuccessfulTradeSum()
  },
})