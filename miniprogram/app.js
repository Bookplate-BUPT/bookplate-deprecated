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

    // 检测更新
    const updateManager = wx.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
      console.log(res.hasUpdate)
    })
    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新的版本下载已经完成，是否立即更新至最新版本？',
        success: function (res) {
          if (res.confirm) {
            updateManager.applyUpdate()
          } else {
            wx.showModal({
              title: '取消提醒',
              content: '我们建议您进行更新，以便获得更好的体验哦~'
            }).then(resner => {
              if (resner.confirm) {
                updateManager.applyUpdate()
              }
            })
          }
        }
      })
    })
  },

  globalData: {
    userInfo: '',
    userOpenid: '',
  }
})
