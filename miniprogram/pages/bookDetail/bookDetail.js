// pages/bookDetail/bookDetail.js
import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    goodsID: '',
    bookDetail: '',
    sellerDetail: '',
    isExisted: false,
    numOfUserCartGoods: '',
    eventID: '',
    show: false,
    value: '',
  },

  onClose() {
    this.setData({
      show: false
    })
  },

  onShowPop() {
    this.setData({
      show: true
    })
  },

  onChange(e) {
    this.setData({
      value: e.detail
    })
  },

  onLoad(options) {
    this.setData({
      goodsID: options.id,
    })

    // 商品被浏览量加1
    wx.cloud.database().collection('goods')
      .doc(options.id)
      .update({
        data: {
          views: wx.cloud.database().command.inc(1)
        }
      })
  },

  onShow() {
    this.getBookDetail()
    this.getNumOfUserCartGoods()
  },

  // 获取书籍详细信息
  getBookDetail() {
    wx.cloud.database().collection('goods')
      .doc(this.data.goodsID)
      .get()
      .then(res => {
        this.setData({
          bookDetail: res.data,
          value: res.data.price
        })
        // console.log(this.data.bookDetail)

        // 获取卖家详细信息
        // 之后需要修改成为利用云函数去获取
        wx.cloud.database().collection('users')
          .where({
            _openid: res.data._openid
          })
          .get()
          .then(resInner => {
            this.setData({
              sellerDetail: resInner.data[0]
            })
          })
      })
  },

  // 获取用户购物车内商品总数
  getNumOfUserCartGoods() {
    // 如果没登录则直接返回
    if (!__user.checkLoginStatus()) return

    wx.cloud.database().collection('cart')
      .where({
        _openid: app.globalData.userOpenid
      })
      .get()
      .then(res => {
        this.setData({
          numOfUserCartGoods: res.data.length
        })
      })
  },

  // 前往购物车页面 
  gotoCart() {
    wx.switchTab({
      url: '../cart/cart',
    })
  },

  // 添加商品到购物车
  addGoodsToCart() {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else {
      // 不允许添加自己的商品进购物车
      if (this.data.sellerDetail._openid === app.globalData.userOpenid) {
        wx.showToast({
          title: '不能添加自己的商品进购物车',
          icon: 'none',
        })
      } else {
        // 查询用户购物车里是否已有此商品
        wx.cloud.database().collection('cart')
          .where({
            _openid: app.globalData.userOpenid,
            goods_id: this.data.goodsID,
          })
          .get()
          .then(res => {

            // 已经在购物车内
            if (res.data.length) {
              wx.showToast({
                title: '已在购物车中',
                icon: 'error',
              })
            } else {
              // 不在购物车内
              wx.cloud.database().collection('cart')
                .add({
                  data: {
                    goods_id: this.data.goodsID,
                    add_time: new Date(),
                  }
                })
                .then(res => {
                  wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                  })

                  this.getNumOfUserCartGoods()
                })
            }
          })
      }
    }
  },

  // 联系卖家
  contactSeller() {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else if (this.data.sellerDetail._openid === app.globalData.userOpenid) {
      wx.showToast({
        title: '无法联系自己',
        icon: 'error',
      })
    } else {
      wx.navigateTo({
        url: '../chatroom/chatroom?openid=' + this.data.sellerDetail._openid,
      })
    }
  },
})