// pages/mine/mine.js
import __user from "../../utils/user"

const app = getApp()

Page({

  data: {
    userInfo: '',
    userOpenid: '',
  },

  onLoad() {

  },

  onShow() {
    this.setData({
      userInfo: __user.getUserInfo(),
      userOpenid: __user.getUserOpenid(),
    })
  },

  // 用户登录
  userLoginInMine() {
    if (!__user.checkLoginStatus()) {
      // 获取用户昵称、头像
      wx.getUserProfile({
        desc: '获取你的昵称、头像',
        success: res => {
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

              wx.showToast({
                title: '登录成功',
                icon: 'success',
              })
            },
            fail: resInner => {
              console.log(resInner)
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
  },

  // 用户退出登录
  userLogout() {
    this.setData({
      userInfo: '',
      userOpenid: '',
    })
    __user.userLogout()
  },
})