// pages/mine/mine.js
const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
  },

  onLoad() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })
  },

  userLogin() {
    if (this.data.userInfo || this.data.userOpenid)
      return

    // 获取用户昵称、头像
    wx.getUserProfile({
      desc: '获取你的昵称、头像',
      success: res => {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        })

        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: app.globalData.userInfo,
        })

        // 获取用户openid
        wx.cloud.callFunction({
          name: 'getOpenid',
          success: resInner => {
            app.globalData.userOpenid = resInner.result.openid
            this.setData({
              userOpenid: app.globalData.userOpenid,
            })

            wx.setStorageSync('user', {
              userInfo: app.globalData.userInfo,
              userOpenid: app.globalData.userOpenid
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
    this.setData({
      userInfo: '',
      userOpenid: '',
    })
    app.globalData.userInfo = ''
    app.globalData.userOpenid = ''

    wx.showToast({
      title: '退出成功',
      icon: 'success'
    })
  },

})