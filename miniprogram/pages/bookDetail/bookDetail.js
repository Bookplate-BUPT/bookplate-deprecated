// pages/bookDetail/bookDetail.js
import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    goodsID: '',
    bookDetail: '',
    sellerDetail: '',

    numOfUserCartGoods: '',
    userInfo: '',
    userOpenid: '',
  },

  onLoad(options) {
    this.setData({
      goodsID: options.id
    })
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })

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
          bookDetail: res.data
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
    wx.cloud.database().collection('cart')
      .where({
        _openid: this.data.userOpenid
      })
      .get()
      .then(res => {
        // console.log(res.data.length)
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
  addGoodsToCart(event) {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else {
      // 查询用户购物车里是否已有此商品
      wx.cloud.database().collection('cart')
        .where({
          _openid: __user.getUserOpenid(),
          goods_id: event.currentTarget.dataset.id,
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
                  goods_id: event.currentTarget.dataset.id,
                  add_time: new Date(),
                }
              })
              .then(res => {
                wx.showToast({
                  title: '添加成功',
                  icon: 'success',
                })
              })
          }
        })
    }
  },
})