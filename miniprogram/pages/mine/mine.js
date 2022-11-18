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
    StateSum: 0,                //tabbar展示的数字

    activeNames: [],            // 折叠面板展示的内容项
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
    }
  },

  // 用户登录
  userLoginInMine() {
    if (!__user.checkLoginStatus()) {
      // 获取用户openid 
      wx.cloud.callFunction({
        name: 'getOpenid',
        success: resInner => {
          var that = this       // 将this存入本地变量

          // 获取头像
          wx.navigateTo({
            url: '../personalInformation/personalInformation',
            // 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
            events: {
              getAvatarAndNickname: function (res) {
                console.log(res)
                if (res.userInfo) {     // 用户在个人信息页面成功点击登录
                  app.globalData.userOpenid = resInner.result.openid  // 将openid存入全局变量
                  app.globalData.userInfo = res.userInfo                  // 将userInfo存入全局变量

                  that.setData({                            // 更新当前页面信息
                    userOpenid: resInner.result.openid,
                    userInfo: res.userInfo,
                  })
                  wx.setStorageSync('user', {               // 将头像和昵称存入本地缓存
                    userInfo: app.globalData.userInfo,
                    userOpenid: app.globalData.userOpenid
                  })
                  wx.showToast({                            // 显示登录成功
                    title: '登录成功',
                    icon: 'success',
                  })

                  wx.cloud.database().collection('users')   // 将头像和昵称存入数据库
                    .where({
                      _openid: resInner.result.openid
                    })
                    .update({
                      data: {
                        avatarUrl: res.userInfo.avatarUrl,
                        nickName: res.userInfo.nickName
                      }
                    })

                  that.countViews()
                  that.countTrade()
                  that.countConfirmedTrade()
                  that.countUnreceived()

                  that.countNumOfStateSum()

                  // 检查用户是否是第一次使用 
                  that.userRegister()

                  that.getUserDetail()
                }
                else wx.showToast({
                  title: '登录失败',
                  icon: 'error'
                })
              },
            },
            success: function (res) {
              // 通过 eventChannel 向被打开页面传送数据
              res.eventChannel.emit('getOpenid', { userOpenid: resInner.result.openid })
              console.log(res)
            }
          })
        },
        fail: err => {
          console.error(err)
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
      numOfMysellbook: 0,
      numOfMybuybook: 0,
    })
    wx.removeTabBarBadge({
      index: 4,
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
                major: '通信工程（大类招生）',
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
    if (__user.checkLoginStatus())
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
            })
        })
  },

  changeCollapse(event) {
    this.setData({
      activeNames: event.detail,
    });
  },

  // 预览图片
  previewPicture() {
    wx.previewImage({
      urls: ['cloud://test-4g1hlst9c8bcc18f.7465-test-4g1hlst9c8bcc18f-1306811448/QRCodeDetail.jpg'],
      showmenu: true,
    })
  },
})