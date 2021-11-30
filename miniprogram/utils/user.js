// 有关于用户数据的全局函数

const app = getApp();

/**
 * 返回用户当前的登录状态
 * @returns true 用户已经登录
 * @returns false 用户尚未登录
 */
function checkLoginStatus() {
  const userInfo = app.globalData.userInfo
  const userOpenid = app.globalData.userOpenid

  if (!userInfo && !userOpenid)
    return false
  else
    return true
}

/**
 * 返回用户的昵称、头像等信息
 * @returns Object 用户信息
 */
function getUserInfo() {
  return app.globalData.userInfo
}

/**
 * 返回用户的设备唯一标识符
 * @returns string 用户openid
 */
function getUserOpenid() {
  return app.globalData.userOpenid
}

/**
 * 用户登录
 * 
 * 注意，不能在本函数执行后对本地变量赋值
 * 
 * 赋值语句会在执行回调函数前执行
 */
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

/**
 * 用户登出
 * 
 * 清除本地缓存以及全局变量
 * 
 * 注意，需要额外手动清除本地变量
 */
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