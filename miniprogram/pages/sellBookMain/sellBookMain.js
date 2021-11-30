// pages/sellBook/sellBook.js
const app = getApp();

Page({

  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })

    if (!this.data.userInfo || !this.data.userOpenid)
      this.setData({ showNoLoginPopup: true })
  },

  onHide() {
    this.closeNoLoginPopup()
  },

  // 了解更多买卖二手书流程
  toSellDetail() {
    wx.navigateTo({
      url: '../sellBookDetail/sellBookDetail',
    })
  },

  // 发布卖书信息
  toSellBook() {
    wx.navigateTo({
      url: '../sellBook/sellBook',
    })
  },

  toRequestBook() {

  },

  // 打开提示弹出层
  showNoLoginPopup() {
    this.setData({ showNoLoginPopup: true });
  },

  // 关闭提示弹出层
  closeNoLoginPopup() {
    this.setData({ showNoLoginPopup: false });
  },

  // 用户登录，认证用户信息
  userLogin() {
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

            // 本地缓存
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
  }
})