
import __user from "../../utils/user"

Page({

  data: {
    tradeGoodsList: [],
    pendingTrade: [],
    confirmedTrade: [],
    rejectedTrade: [],
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
      seller_openid: __user.getUserOpenid(),
    }).get().then(res => {
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

  //打开弹出层
  ShowPopup(e) {
    this.setData({
      popup: e.currentTarget.dataset.item,
      show: true
    })
  },

  //确认交易
  commitForm(event) {
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
        })
      })
    })
  },

  //拒绝交易
  rejectForm(event) {
    console.log(event)
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 3,
      }
    }).then(res => {
      wx.showToast({
        title: '已拒绝',
        icon: 'success'
      }).then(res => {
        this.setData({
          show: false
        })


        // 找到需要确认元素的索引
        var tempPendingTrade = this.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id })

        // 在已拒绝中添加元素
        var tempRejectedTrade = this.data.rejectedTrade
        tempRejectedTrade.push(tempPendingTrade[idx])
        // 已拒绝按时间逆序
        tempRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在未处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        this.setData({
          pendingTrade: tempPendingTrade,
          rejectedTrade: tempRejectedTrade,
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

  onLoad: function (options) {
    this.getMyTrade()
  },
})