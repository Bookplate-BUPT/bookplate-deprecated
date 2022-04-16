// pages/mine/mine.js
import __user from "../../utils/user"

const app = getApp()

Page({

  data: {
    // 用户个人信息
    userInfo: '',
    userOpenid: '',
    userGrade: '',
    userSchool: '',

    viewsSum: '-',    // 书籍总浏览量
    favoriteSum: '-', // 书籍总收藏量
  },

  onLoad() {

  },

  onShow() {
    if (__user.checkLoginStatus()) {
      this.getUserDetail()
      this.countViewsAndFavorite()
    }
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

              // 检查用户是否是第一次使用
              this.userRegister()
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

  // 检测用户是否为第一次进入小程序
  userRegister() {
    wx.cloud.database().collection('users')
      .where({
        _openid: __user.getUserOpenid()
      })
      .get()
      .then(res => {
        // 如果没有该用户，则需要注册
        if (!res.data.length) {
          wx.cloud.database().collection('users')
            .add({
              data: {
                avatarUrl: __user.getUserInfo().avatarUrl,
                nickName: __user.getUserInfo().nickName,
                grade: '大一',
                school: '信息与通信工程学院',
              }
            })

          wx.navigateTo({
            url: '../editUserInfo/editUserInfo',
          })
        }
      })
  },

  // 取得用户的各种信息
  getUserDetail() {
    wx.cloud.database().collection('users')
      .where({
        _openid: __user.getUserOpenid()
      })
      .get()
      .then(res => {
        this.setData({
          userInfo: __user.getUserInfo(),
          userOpenid: __user.getUserOpenid(),
          userGrade: res.data[0].grade,
          userSchool: res.data[0].school,
        })
      })
  },

  // 前往收藏页面
  gotoFavorite() {
    wx.navigateTo({
      url: '../favorite/favorite',
    })
  },

  // 前往交易查询页面
  gotoTrade() {
    wx.showToast({
      title: '功能未开发',
      icon: 'error',
    })
  },

  // 前往浏览历史页面
  gotoHistory() {
    wx.showToast({
      title: '功能未开发',
      icon: 'error',
    })
  },

  // 计算书籍总浏览量和总收藏量
  countViewsAndFavorite() {
    if (!__user.checkLoginStatus()) {
      this.setData({
        viewsSum: '-',
        favoriteSum: '-',
      })
    } else {
      wx.cloud.database().collection('goods')
        .where({
          _openid: app.globalData.userOpenid
        })
        .get()
        .then(res => {
          let tempViewsSum = 0
          let tempFavoriteSum = 0

          res.data.forEach(i => {
            tempViewsSum += i.views
            tempFavoriteSum += i.favorites
          })

          this.setData({
            viewsSum: tempViewsSum,
            favoriteSum: tempFavoriteSum,
          })
        })
    }
  },


})