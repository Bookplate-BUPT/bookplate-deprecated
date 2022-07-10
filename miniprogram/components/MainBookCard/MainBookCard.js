// components/mainBook/mainBook.js

import __user from "../../utils/user"
var util = require('../../utils/util.js');

const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    _id: String,
    _openid: String,
    price: String,
    image_list: Array,
    original_price: String,
    name: String,
    grade: String,
    introduction: String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 收藏商品
    favoriteGoods(event) {
      if (!__user.checkLoginStatus()) {
        wx.showToast({
          title: '请先登录',
          icon: 'error',
        })
      } else {
        // 查询用户收藏里是否已有此商品
        wx.cloud.database().collection('favorite')
          .where({
            _openid: __user.getUserOpenid(),
            goods_id: event.currentTarget.dataset.id,
          })
          .get()
          .then(res => {
            // 已经在收藏内
            if (res.data.length) {
              wx.showToast({
                title: '已在收藏中',
                icon: 'error',
              })
            } else {
              // 不在收藏内
              wx.cloud.database().collection('favorite')
                .add({
                  data: {
                    goods_id: event.currentTarget.dataset.id,
                    add_time: new Date(),
                  }
                })
                .then(resInner => {
                  wx.showToast({
                    title: '收藏成功',
                    icon: 'success',
                  })

                  // 该商品的被收藏数需要加1
                  wx.cloud.database().collection('goods')
                    .doc(event.currentTarget.dataset.id)
                    .update({
                      data: {
                        favorites: wx.cloud.database().command.inc(1)
                      }
                    })
                })
            }
          })
      }
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
            // 不允许添加自己的商品进购物车
            if (event.currentTarget.dataset.openid === app.globalData.userOpenid) {
              wx.showToast({
                title: '不能添加自己的商品进购物车',
                icon: 'none',
              })
            } else {
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
            }
          })
      }
    },

    // 进入商品详情页
    goToBookDetail(event) {
      wx.navigateTo({
        url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
      }).then(res => {
        wx.cloud.database().collection('history').where({
          goods_id: event.currentTarget.dataset.id
        }).update({
          data: {
            view_time: util.formatTime(new Date())
          }
        }).then(res => {
          if (!res.stats.updated) {
            wx.cloud.database().collection('history').add({
              data: {
                goods_id: event.currentTarget.dataset.id,
                view_time: util.formatTime(new Date())
              }
            })
          }
        })
      })
    },
  }
})