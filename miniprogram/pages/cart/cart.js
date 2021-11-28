// pages/cart/cart.js
const app = getApp();

Page({
  data: {
    userOpenid: '',
  },

  onLoad(options) {
    this.setData({
      userOpenid: app.globalData.userOpenid,
    })
  },


})