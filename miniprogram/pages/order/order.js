// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trade: {}
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.setData({
      trade: JSON.parse(options.trade),
    })
  },

  //确认交易
  confirmForm(event) {
    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: this.data.trade._id,
        state: 1,
      }
    }).then(res => {
      wx.showToast({
        title: '已确认',
        icon: 'success'
      }).then(res => {
        //获取当前页面栈
        const pages = getCurrentPages();
        //获取上一页面对象
        let prePage = pages[pages.length - 2];

        // 找到需要确认元素的索引
        var tempPendingTrade = prePage.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == this.data.trade._id })

        // 更改确认元素的state为1
        tempPendingTrade[idx].state = 1
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == this.data.trade._id)].state = 1

        // 在已确认中添加元素
        var tempConfirmedTrade = prePage.data.confirmedTrade
        tempConfirmedTrade.push(tempPendingTrade[idx])
        // 已确认按时间逆序
        tempConfirmedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在未处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        prePage.setData({
          pendingTrade: tempPendingTrade,
          confirmedTrade: tempConfirmedTrade,
          tradeGoodsList: prePage.data.tradeGoodsList,
          pendingTradeSum: prePage.data.pendingTradeSum - 1,
          confirmedTradeSum: prePage.data.confirmedTradeSum + 1,
        })

        wx.navigateBack({
          delta: 1,
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
        _id: this.data.trade._id,
        state: 3,
      }
    }).then(res => {
      wx.showToast({
        title: '已取消',
        icon: 'success'
      }).then(res => {
        //获取当前页面栈
        const pages = getCurrentPages();
        //获取上一页面对象
        let prePage = pages[pages.length - 2];

        // 找到需要取消的元素的索引
        var tempPendingTrade = prePage.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == this.data.trade._id })

        // 将取消的元素state改为3
        tempPendingTrade[idx].state = 3
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == this.data.trade._id)].state = 3

        // 在已取消中添加元素
        var tempRejectedTrade = prePage.data.rejectedTrade
        tempRejectedTrade.push(tempPendingTrade[idx])

        // 已取消按时间逆序
        tempRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在待处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        prePage.setData({
          pendingTrade: tempPendingTrade,
          rejectedTrade: tempRejectedTrade,
          tradeGoodsList: prePage.data.tradeGoodsList,
          pendingTradeSum: prePage.data.pendingTradeSum - 1,
          rejectedTradeSum: prePage.data.rejectedTradeSum + 1,
        })
        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'updateState',
            goodsID: this.data.trade.bookDetail._id,
            state: 0,
          }
        })
          .then(res => {
            wx.navigateBack({
              delta: 1,
            })
          })
          .catch(err => {
            console.error(err)
          })
      })
    })
  },
})