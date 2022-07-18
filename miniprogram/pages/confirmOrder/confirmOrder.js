
import __user from "../../utils/user"

Page({

  data: {
    tradeGoodsList: [],
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
      this.setData({
        tradeGoodsList: res.data
      })
    })
  },
  //打开弹出层
  ShowPopup(e) {
    this.setData({
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
        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'removeGoods',
            goodsID: event.currentTarget.dataset.goodsid,
          }
        })
      })
    })
  },
  //拒绝交易
  rejectForm(event){
    console.log(event)
    wx.cloud.callFunction({
      name: 'updateTradeState',
      data: {
        _id: event.currentTarget.dataset._id,
        state: 2,
      }
    }).then(res => {
      wx.showToast({
        title: '已拒绝',
        icon: 'success'
      }).then(res => {
        this.setData({
          show: false
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