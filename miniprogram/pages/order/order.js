// pages/order/order.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trade: {},
    page: '',         // 0表示卖家，1表示买家

    trade_price: '',   // 单独抽出，防止图片下的价格实时变化
  },

  // 修改现价内容
  inputTradePrice(e) {
    this.setData({
      'trade_price': e.detail
    })
  },

  // 循环解析url
  getUrl(url) {
    if (url.indexOf('%') < 0) {
      return url
    } else {
      const newUrl = decodeURIComponent(url)
      return this.getUrl(newUrl)
    }
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    console.log(options)
    var trade = JSON.parse(options.trade)
    // 跳转后先进行解码
    trade.bookDetail.image_list.forEach((i, idx) => {
      trade.bookDetail.image_list[idx] = this.getUrl(i)
    })
    this.setData({
      trade: trade,
      page: options.page,
      trade_price: trade.trade_price,
    })
  },

  // 同意请求
  confirmForm(event) {
    wx.showLoading({
      title: '同意中……',
      mask: true,
    })

    // 将暂时的变量赋值给trade
    this.data.trade.trade_price = this.data.trade_price

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
        trade_price: this.data.trade.trade_price,
      }
    })
      .then(res => {
        // 更改全部中将要同意的元素的state为1
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == this.data.trade._id)].state = 1
        // 更新全部中将要同意的元素的trade_price
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == this.data.trade._id)].trade_price = this.data.trade.trade_price

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

  // 拒绝请求
  rejectForm(event) {
    wx.showLoading({
      title: '拒绝中……',
      mask: true,
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

  // 确认收货
  receiveGoods(event) {
    wx.showLoading({
      title: '收货中……',
      mask: true,
    })

    //获取当前页面栈
    const pages = getCurrentPages();
    //获取上一页面对象
    let prePage = pages[pages.length - 2];

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
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 2

        // 在待收货中删除元素
        prePage.data.confirmedTrade.splice(prePage.data.confirmedTrade.findIndex(i => i._id == event.currentTarget.dataset._id), 1)

        // 更新页面
        prePage.setData({
          confirmedTrade: prePage.data.confirmedTrade,
          tradeGoodsList: prePage.data.tradeGoodsList,
          confirmedTradeSum: prePage.data.confirmedTradeSum - 1,
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
      .then(res => prePage.getSuccessfulTrade())
      .then(res => prePage.getSuccessfulTradeSum())
      .then(res => wx.showToast({
        title: '收货成功',
      }))
      .then(res => wx.navigateBack())
      .catch(err => console.error(err))
  },

  // 取消请求
  cancelTrade(event) {
    wx.showLoading({
      title: '取消中……',
      mask: true,
    })

    //获取当前页面栈
    const pages = getCurrentPages();
    //获取上一页面对象
    let prePage = pages[pages.length - 2];

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
        prePage.data.tradeGoodsList[prePage.data.tradeGoodsList.findIndex(i => i._id == event.currentTarget.dataset._id)].state = 3

        // 在待处理中删除元素
        prePage.data.pendingTrade.splice(prePage.data.pendingTrade.findIndex(i => { return i._id == event.currentTarget.dataset._id }), 1)

        // 更新页面
        prePage.setData({
          pendingTrade: prePage.data.pendingTrade,
          tradeGoodsList: prePage.data.tradeGoodsList,
          pendingTradeSum: prePage.data.pendingTradeSum - 1,
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
      .then(res => prePage.getRejectedTrade())
      .then(res => prePage.getRejectedTradeSum())
      .then(res => wx.showToast({
        title: '取消成功',
      }))
      .then(res => wx.navigateBack())
      .catch(err => console.error(err))
  },

  // 预览图片
  preview(e) {
    var image_list = this.data.trade.bookDetail.image_list
    wx.previewImage({
      urls: image_list,
      showmenu: true,
      current: image_list[e.currentTarget.dataset.index],
    })
  },
})