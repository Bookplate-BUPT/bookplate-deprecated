// pages/bookDetail/bookDetail.js
import __user from "../../utils/user"
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

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
    if (this.data.bookDetail.state == 1) {
      wx.showToast({
        title: '该书已被预订',
        icon: 'error'
      })
    } else if (this.data.bookDetail._openid == __user.getUserOpenid()) {
      wx.showToast({
        title: '不能购买自己的商品',
        icon: 'none'
      })
    } else {
      this.setData({
        show: true,
        trade_time: new Date().toLocaleDateString(),
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

    this.getBookDetail()
    this.getNumOfUserCartGoods()
  },

  onShow() {

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

        // TODO: 应该卖家在上传商品的时候就把部分用于显示
        // 的个人信息塞入其中

        // 获取卖家详细信息
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
  addGoodsToCart(event) {
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
        if (event.currentTarget.dataset.state == 1) {
          this.lockedGoodsConfirm()
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
    }
  },

  // 商品被锁定时加入购物车的确认
  lockedGoodsConfirm() {
    Dialog.confirm({
      title: '确定加入购物车吗？',
      message: '该书籍目前已被预定，被购买后将下架',
      closeOnClickOverlay: true,
    })
      .then(() => {
        this.addGoodsToCart()
      })
      .catch(() => {

      });
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
          if (res.data.some(i => { return i.state == 0 })) {
            wx.showToast({
              title: '该书已被预订',
              icon: 'error'
            }).then(res => {
              this.setData({
                'bookDetail.state': 1
              })
            })
          } else {
            this.addTradeRecord(event.currentTarget.dataset)
          }
        } else {
          this.addTradeRecord(event.currentTarget.dataset)
        }
      })
    }
  },

  // 向trade集合中添加记录
  addTradeRecord(i) {
    wx.cloud.database().collection('trade').add({
      data: {
        goods_id: i.goods_id,
        state: 0,
        trade_price: i.trade_price,
        trade_time: i.trade_time,
        trade_spot: i.trade_spot,
        original_price: this.data.bookDetail.original_price,
        seller_openid: this.data.bookDetail._openid,
        grade: this.data.bookDetail.grade,
        name: this.data.bookDetail.name,
        isbn: this.data.bookDetail.isbn,
        image_list: this.data.bookDetail.image_list,
      }
    }).then(res => {
      wx.showToast({
        title: '交易请求已发送',
        icon: 'success'
      }).then(res => {
        // 调用云函数修改数据库
        wx.cloud.callFunction({
          name: 'updateGoods',
          data: {
            type: 'updateState',
            goodsID: this.data.goodsID,
            state: 1,
          }
        }).then(res => {
          this.setData({
            show: false,
            'bookDetail.state': 1
          })
        })
      })
    })
  },
})