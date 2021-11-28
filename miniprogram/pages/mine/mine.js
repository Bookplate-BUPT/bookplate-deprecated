// pages/mine/mine.js
const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
  },

  userLogin() {
    wx.getUserProfile({
      desc: '获取你的昵称、头像',
      success: res => {
        wx.showToast({
          title: '获取成功',
          icon: 'success',
        })
        this.setData({
          userInfo: res.userInfo,
        })

        wx.cloud.callFunction({
          name: 'getOpenid',
          success: res => {
            app.globalData.userOpenid = res.result.openid;
            this.setData({
              userOpenid: app.globalData.userOpenid,
            })
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '获取失败',
          icon: 'error',
        })
      }
    })
  },

  userLogout() {

  },

})