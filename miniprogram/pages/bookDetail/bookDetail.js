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
  },

  // 跳转至发起交易页面
  gotoLaunchTrade() {
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
      // 跳转至新页面
      wx.navigateTo({
        url: `../launchTrade/launchTrade?bookDetail=${JSON.stringify(this.data.bookDetail)}`,
      })
    }
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
        if (res.data.image_list.length === 0) {
          res.data.image_list = ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg']
        }
        this.setData({
          bookDetail: res.data,
          trade_price: res.data.price
        })

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
      if (this.data.sellerDetail._openid === __user.getUserOpenid()) {
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
    // 不允许添加自己的商品进购物车
    if (this.data.sellerDetail._openid === __user.getUserOpenid()) {
      wx.showToast({
        title: '不能添加自己的商品进购物车',
        icon: 'none',
      })
    } else {
      Dialog.confirm({
        title: '确定加入购物车吗？',
        message: '该书籍目前已被预定，被购买后将下架',
        closeOnClickOverlay: true,
      })
        .then(res => {
          wx.cloud.database().collection('cart')
            .where({
              _openid: __user.getUserOpenid(),
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
        })
        .catch(err => {

        })
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

  // 点击轮播图片可以进行预览
  preview(e) {
    let that = this
    wx.previewImage({
      urls: [that.data.bookDetail.image_list[e.currentTarget.dataset.id]]
    })
  },
})