// 有关于用户数据的全局函数

const app = getApp();

function checkLoginStatus() {
  const userInfo = app.globalData.userInfo
  const userOpenid = app.globalData.userOpenid

  if (!userInfo && !userOpenid)
    return false
  else
    return true
}

function getUserInfo() {
  return app.globalData.userInfo
}

function getUserOpenid() {
  return app.globalData.userOpenid
}

// 用户登录，认证用户信息
function userLogin() {
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

function userLogout() {
  app.globalData.userInfo = ''
  app.globalData.userOpenid = ''

  wx.setStorageSync('user', {
    userInfo: '',
    userOpenid: '',
    success: res => {
      wx.showToast({
        title: '退出成功',
        icon: 'success'
      })
    },
    fail: res => {
      wx.showToast({
        title: '退出失败',
        icon: 'error'
      })
    }
  })
}

export default {
  checkLoginStatus,
  getUserInfo,
  getUserOpenid,
  userLogin,
  userLogout
}