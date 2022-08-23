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

  //同意请求
  confirmForm(event) {
    wx.showLoading({
      title: '同意中……',
    })

    // 获取当前页面栈
    const pages = getCurrentPages();
    // 获取上一页面对象
    let prePage = pages[pages.length - 2];

    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        type: 1,
        _id: this.data.trade._id,
        state: 1,
      }
    })
      .then(res => {
        // 更改全部中将要同意的元素的state为1
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == this.data.trade._id)].state = 1

        // 在未处理中删除元素
        prePage.data.pendingTrade.splice(prePage.data.pendingTrade.findIndex(i => i._id == this.data.trade._id), 1)

        // 更新页面
        prePage.setData({
          pendingTrade: prePage.data.pendingTrade,
          tradeGoodsList: prePage.data.tradeGoodsList,
          pendingTradeSum: prePage.data.pendingTradeSum - 1,
        })

        return
      })
      .then(res => {
        // 更新已同意的tab栏
        return prePage.getConfirmedTrade()
      })
      .then(res => {
        return prePage.getConfirmedTradeSum()
      })
      .then(res => wx.showToast({
        title: '同意成功',
      }))
      .then(res => wx.navigateBack())
      .catch(err => console.error(err))
  },

  //拒绝请求
  rejectForm(event) {
    wx.showLoading({
      title: '拒绝中……',
    })

    //获取当前页面栈
    const pages = getCurrentPages();
    //获取上一页面对象
    let prePage = pages[pages.length - 2];

    // 更新交易记录的state
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        type: 3,
        _id: this.data.trade._id,
        state: 3,
      }
    })
      .then(res => {
        // 将全部中要拒绝的元素的state改为3
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == this.data.trade._id)].state = 3

        // 在待处理中删除元素
        prePage.data.pendingTrade.splice(prePage.data.pendingTrade.findIndex(i => i._id == this.data.trade._id), 1)

        // 更新页面
        prePage.setData({
          pendingTrade: prePage.data.pendingTrade,
          tradeGoodsList: prePage.data.tradeGoodsList,
          pendingTradeSum: prePage.data.pendingTradeSum - 1,
        })
        return
      })
      .then(res => {
        return wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'updateState',
            goodsID: this.data.trade.bookDetail._id,
            state: 0,
          }
        })
      })
      .then(res => {
        // 更新已拒绝的tab栏
        return prePage.getRejectedTrade()
      })
      .then(res => {
        return prePage.getRejectedTradeSum()
      })
      .then(res => wx.showToast({
        title: '拒绝成功',
      }))
      .then(res => wx.navigateBack())
      .catch(err => console.error(err))
  },
})