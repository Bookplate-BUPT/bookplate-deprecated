//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env: 'qqk-4gjankm535f1a524',
        env: 'test-4g1hlst9c8bcc18f',
        traceUser: true,
      })
    }

    // 取本地缓存的用户信息
    this.globalData.userInfo = wx.getStorageSync('user').userInfo
    this.globalData.userOpenid = wx.getStorageSync('user').userOpenid
  },

  globalData: {
    userInfo: '',
    userOpenid: '',
  }
})
