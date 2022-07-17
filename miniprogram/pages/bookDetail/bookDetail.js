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
    trade_price: '', // 交易确认的价格
    trade_time: '', // 交易确认的时间
    trade_spot: '', // 交易确认的地点
  },

  onClose() {
    this.setData({
      show: false
    })
  },

  onShowPop() {
    if (this.data.bookDetail.state==1) {
      wx.showToast({
        title: '该书已被预订',
        icon: 'error'
      })
    } else {
      this.setData({
        show: true,
        trade_time: new Date().toLocaleTimeString(),
      })
    }
  },

  onChangeTradePrice(e) {
    this.setData({
      trade_price: e.detail
    })
  },
  onChangeTradeTime(e) {
    this.setData({
      trade_time: e.detail
    })
  },
  onChangeTradeSpot(e) {
    this.setData({
      trade_spot: e.detail
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
          trade_price: res.data.price
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

  // 确认提交交易信息
  commitForm(event) {
    if (!this.data.trade_price) {
      wx.showToast({
        title: '现价不能为空',
        icon: 'error'
      })
    }
    else {
      wx.cloud.database().collection('trade').where({
        goods_id: event.currentTarget.dataset.goods_id,
      }).get().then(res => {
        if (res.data.length) {
          wx.showToast({
            title: '该书已被预订',
            icon: 'error'
          }).then(res => {
            this.setData({
              'bookDetail.state': 1
            })
          })
        } else {
          wx.cloud.database().collection('trade').add({
            data: {
              goods_id: event.currentTarget.dataset.goods_id,
              trade_time: new Date(),
              state: 0,
              trade_price: event.currentTarget.dataset.trade_price,
              trade_time: event.currentTarget.dataset.trade_time,
              trade_spot: event.currentTarget.dataset.trade_spot,
            }
          }).then(res => {
            wx.showToast({
              title: '交易请求已发送',
              icon: 'success'
            }).then(res => {
              wx.cloud.database().collection('goods').doc(this.data.goodsID).update({
                data: {
                  state: 1
                }
              }).then(res => {
                console.log(res)
                this.setData({
                  show: false,
                  'bookDetail.state': 1
                })
              })
            })
          })
        }
      })
    }
  },
})