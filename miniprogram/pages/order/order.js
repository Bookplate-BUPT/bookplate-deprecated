// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trade_price: '',
    trade_time: '',
    trade_spot: '',
    _id: '',
    bookDetail: {},
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.setData({
      trade_price: options.trade_price,
      trade_time: options.trade_time,
      trade_spot: options.trade_spot,
      _id: options._id,
      bookDetail: JSON.parse(options.bookDetail),
    })
  },

  //确认交易
  confirmForm(event) {
    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: this.data._id,
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
        var idx = tempPendingTrade.findIndex(i => { return i._id == this.data._id })

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
        _id: this.data._id,
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

        // 找到需要确认元素的索引
        var tempPendingTrade = prePage.data.pendingTrade
        var idx = tempPendingTrade.findIndex(i => { return i._id == this.data._id })

        // 在已取消中添加元素
        var tempRejectedTrade = prePage.data.rejectedTrade
        tempRejectedTrade.push(tempPendingTrade[idx])
        // 已取消按时间逆序
        tempRejectedTrade.sort((a, b) => { return b.trade_time - a.trade_time })

        // 在未处理中删除元素
        tempPendingTrade.splice(idx, 1)

        // 更新页面
        prePage.setData({
          pendingTrade: tempPendingTrade,
          rejectedTrade: tempRejectedTrade,
          pendingTradeSum: prePage.data.pendingTradeSum - 1,
          rejectedTradeSum: prePage.data.rejectedTradeSum + 1
        })
        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'updateState',
            goodsID: this.data.bookDetail._id,
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