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
    tradeSum: '-',    // 总交易成功量
    unconfirmedTrade: false // 未处理的交易
  },

  onLoad() {

  },

  onShow() {
    if (__user.checkLoginStatus()) {
      this.getUserDetail()
      this.countViews()
      this.countTrade()
      this.countConfirmedTrade()
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

              wx.cloud.database().collection('users')
                .where({
                  _openid: resInner.result.openid
                })
                .update({
                  data: {
                    avatarUrl: res.userInfo.avatarUrl,
                    nickName: res.userInfo.nickName
                  }
                })

              this.countViews()

              // 检查用户是否是第一次使用
              this.userRegister()

              this.getUserDetail()
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
      viewsSum: '-',
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
        if (res.data.length !== 0) {
          this.setData({
            userInfo: __user.getUserInfo(),
            userOpenid: __user.getUserOpenid(),
            userGrade: res.data[0].grade,
            userSchool: res.data[0].school,
          })
        }
      })
  },

  // 前往我的卖书页面
  gotoConfirmOrder() {
    wx.navigateTo({
      url: '../confirmOrder/confirmOrder',
    })
  },

  // 前往买家相关页面
  gotoViewOrder(event) {
    wx.navigateTo({
      url: `../viewOrder/viewOrder?active=${event.currentTarget.dataset.active}`,
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
    wx.navigateTo({
      url: '../history/history',
    })
  },

  // 计算书籍总浏览量
  countViews() {
    if (!__user.checkLoginStatus()) {
      this.setData({
        viewsSum: '-',
      })
    } else {
      wx.cloud.database().collection('goods')
        .where({
          _openid: app.globalData.userOpenid
        })
        .get()
        .then(res => {
          let tempViewsSum = 0

          res.data.forEach(i => {
            tempViewsSum += i.views
          })

          this.setData({
            viewsSum: tempViewsSum,
          })
        })
    }
  },

  // 计算交易总成功量
  countTrade() {
    if (!__user.checkLoginStatus()) {
      this.setData({
        tradeSum: '-',
      })
    } else {
      let tempTradeSum = 0
      wx.cloud.database().collection('trade')
        .where({
          seller_openid: app.globalData.userOpenid,
          state: 2
        })
        .get()
        .then(res => {
          console.log('res1', res)
          tempTradeSum += res.data.length,
            wx.cloud.database().collection('trade')
              .where({
                _openid: app.globalData.userOpenid,
                state: 2
              })
              .get()
              .then(res => {
                console.log('res2', res)
                tempTradeSum += res.data.length
                this.setData({
                  tradeSum: tempTradeSum
                })
              })
        })
    }
  },

  // 计算未处理的交易量
  countConfirmedTrade() {
    if (!__user.checkLoginStatus()) {

    } else {
      wx.cloud.database().collection('trade')
        .where({
          seller_openid: app.globalData.userOpenid,
          state: 0
        })
        .get()
        .then(res => {
          if(!res.data.length) return
          this.setData({
            unconfirmedTrade: true
          })
        })
    }
  },
})