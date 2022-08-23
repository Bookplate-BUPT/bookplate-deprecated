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

    viewsSum: '-',              // 书籍总浏览量
    tradeSum: '-',              // 总交易成功量
    unconfirmedTrade: false,    // 未处理的交易
    unreceived: false,          // 暂未收货

    numOfMysellbook: 0,         // 我卖出的数量
    numOfMybuybook: 0,          // 我买到的数量
    showState: '',
    StateSum: 0,                //tabbar展示的数字
  },

  onLoad() {

  },

  onShow() {
    if (__user.checkLoginStatus()) {
      this.getUserDetail()
      this.countViews()
      this.countConfirmedTrade()
      this.countUnreceived()
      this.countNumOfStateSum()
      this.countSum()
      this.setData({
        showState: '级'
      })
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
              this.countTrade()
              this.countConfirmedTrade()
              this.countUnreceived()

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
      tradeSum: '-',
      unconfirmedTrade: false,
      unreceived: false,
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
                grade: '2022',
                college: '信息与通信工程学院',
                major: '（通信工程）大类招生',
                registration_time: new Date()
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
            userSchool: res.data[0].college,
          })
        }
      })
  },

  // 前往我是卖家页面
  gotoConfirmOrder() {
    if (!__user.checkLoginStatus()) {
      this.userLoginInMine()
    } else
      wx.navigateTo({
        url: '../confirmOrder/confirmOrder',
      })
  },

  // 前往编辑个人信息页面
  gotoeditUserInfo() {
    if (!__user.checkLoginStatus()) {
      this.userLoginInMine()
    } else
      wx.navigateTo({
        url: '../editUserInfo/editUserInfo',
      })
  },

  // 前往我是买家页面
  gotoViewOrder(event) {
    if (!__user.checkLoginStatus()) {
      this.userLoginInMine()
    } else
      wx.navigateTo({
        url: '../viewOrder/viewOrder',
      })
  },

  // 前往我发布的页面
  gotoMySellBooks() {
    if (!__user.checkLoginStatus()) {
      this.userLoginInMine()
    } else
      wx.navigateTo({
        url: '../mySellBooks/mySellBooks',
      })
  },

  gotoMySeekBooks() {
    wx.showToast({
      title: '此功能暂未开发',
      icon: 'error'
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
    if (!__user.checkLoginStatus()) {
      this.userLoginInMine()
    } else
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

  // 计算一系列的数量（不包括红点显示与书籍被浏览量）
  countSum() {
    this.countNumOfMysellbook()
      .then(res => {
        this.countNumOfMybuybook()
          .then(resInner => {
            this.countTrade()
          })
          .catch(errInner => {
            console.error(errInner)
          })
      })
      .catch(err => {
        console.error(err)
      })
  },

  // 计算交易总成功量
  countTrade() {
    this.setData({
      tradeSum: this.data.numOfMysellbook + this.data.numOfMybuybook
    })
  },

  // 计算未处理的交易量
  countConfirmedTrade() {
    wx.cloud.database().collection('trade')
      .where({
        seller_openid: __user.getUserOpenid(),
        state: 0
      })
      .get()
      .then(res => {
        if (res.data.length) {
          this.setData({
            unconfirmedTrade: true
          })
        } else {
          this.setData({
            unconfirmedTrade: false
          })
        }
      })
  },

  // 计算暂未收货的交易量
  countUnreceived() {
    wx.cloud.database().collection('trade')
      .where({
        _openid: __user.getUserOpenid(),
        state: 1
      })
      .get()
      .then(res => {
        if (res.data.length)
          this.setData({
            unreceived: true
          })
        else
          this.setData({
            unreceived: false
          })
      })
  },

  // 计算我卖出的数量
  countNumOfMysellbook() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade')
        .where({
          seller_openid: __user.getUserOpenid(),
          state: 2
        })
        .get()
        .then(res => {
          this.setData({
            numOfMysellbook: res.data.length
          })
          resolve(res)
        })
    })
    return promise
  },

  // 计算我买到的数量
  countNumOfMybuybook() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade')
        .where({
          _openid: __user.getUserOpenid(),
          state: 2
        })
        .get()
        .then(res => {
          this.setData({
            numOfMybuybook: res.data.length
          })
          resolve(res)
        })
    })
    return promise
  },

  // 计算tabbar展示的商品数量
  countNumOfStateSum() {
    var promise = new Promise((resolve, reject) => {
      wx.cloud.database().collection('trade')
        .where({
          _openid: __user.getUserOpenid(),
          state: 1
        })
        .count()
        .then(res => {
          this.setData({
            StateSum: res.total
          })
          wx.cloud.database().collection('trade')
            .where({
              seller_openid: __user.getUserOpenid(),
              state: 0
            })
            .count()
            .then(resner => {
              var tempnum = this.data.StateSum + resner.total
              if (tempnum) {
                wx.setTabBarBadge({
                  index: 4,
                  text: tempnum.toString()
                })
              } else {
                wx.removeTabBarBadge({
                  index: 4,
                })
              }
              resolve(res)
            })
        })
    })
    return promise
  }
})