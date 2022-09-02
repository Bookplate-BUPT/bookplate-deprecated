// pages/cart/cart.js
import __user from "../../utils/user"
import __util from "../../utils/util"

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    cartList: '',
    isReachBottom: false,       // 是否到达底部
  },

  onLoad() {
    // this.getCartList()
  },

  onShow() {
    this.setData({
      userInfo: __user.getUserInfo(),
      userOpenid: __user.getUserOpenid(),
    })

    if (!__user.checkLoginStatus())   // 如果没有登录
      this.setData({ showNoLoginPopup: true })
    else
      this.getCartList()
  },

  onHide() {
    this.closeNoLoginPopup()
    this.setData({
      cartList: '',
      isReachBottom: false,
    })
  },

  // 上拉触底监听
  onReachBottom() {
    if (this.data.isReachBottom) {
      return
    } else {
      // 防抖
      this.setData({
        isReachBottom: true
      })
      // 获取数据
      wx.cloud.callFunction({
        name: 'getCartList',
        data: {
          skipNum: this.data.cartList.length
        }
      })
        .then(res => {
          var tempCartList = res.result.list
          if (tempCartList.length == 20)
            this.setData({
              isReachBottom: false
            })

          // 向原数组中添加新值
          this.data.cartList = [...this.data.cartList, ...tempCartList]

          // 更新页面
          this.setData({
            cartList: this.data.cartList
          })
        })
        .catch(err => console.error(err))
    }
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
    wx.switchTab({
      url: '../mine/mine',
    })

    // 获取用户昵称、头像
    // wx.getUserProfile({
    //   desc: '获取你的昵称、头像',
    //   success: res => {
    //     wx.showToast({
    //       title: '登录成功',
    //       icon: 'success',
    //     })

    //     app.globalData.userInfo = res.userInfo
    //     this.setData({
    //       userInfo: app.globalData.userInfo,
    //     })

    //     // 获取用户openid
    //     wx.cloud.callFunction({
    //       name: 'getOpenid',
    //       success: resInner => {
    //         app.globalData.userOpenid = resInner.result.openid
    //         this.setData({
    //           userOpenid: app.globalData.userOpenid,
    //         })

    //         // 本地缓存
    //         wx.setStorageSync('user', {
    //           userInfo: app.globalData.userInfo,
    //           userOpenid: app.globalData.userOpenid
    //         })
    //       }
    //     })
    //   },
    //   fail: res => {
    //     wx.showToast({
    //       title: '获取失败',
    //       icon: 'error',
    //     })
    //   }
    // })
  },

  // 获取购物车内的所有商品
  getCartList() {
    // 获取购物车列表
    wx.cloud.callFunction({
      name: 'getCartList',
      data: {
        skipNum: 0
      }
    })
      .then(res => {
        var tempCartList = res.result.list
        if (tempCartList.length < 20)
          this.setData({
            isReachBottom: true
          })

        this.setData({
          cartList: tempCartList
        })
      })
      .catch(err => console.error(err))
  },

  // 将商品移除购物车
  deleteGoods(event) {
    const index = this.data.cartList.findIndex(i => i._id === event.detail._id)

    this.data.cartList.splice(index, 1)

    this.setData({
      cartList: this.data.cartList,
    })
    // if (this.data.cartSum) {
    //   wx.setTabBarBadge({
    //     index: 3,
    //     text: this.data.cartSum.toString()
    //   })
    // }else{
    //   wx.removeTabBarBadge({
    //     index: 3,
    //   })
    // }
  }
})