// pages/searchResult/searchResult.js

import __user from "../../utils/user"

Page({

  data: {
    keyword: '',         // 搜索关键字
    goodsList: '',       // 商品列表
    isReachBottom: false,// 页面是否到达底部
  },

  onLoad(options) {
    this.setData({
      keyword: options.keyword
    })
    this.getGoodsList()
  },

  // 获取商品列表
  getGoodsList() {
    if (!isNaN(Number(this.data.keyword))) {
      wx.cloud.database().collection('goods')
        .where({
          isbn: this.data.keyword
        })
        .get()
        .then(res => {
          let tempGoodsList = res.data.map((i, idx) => ({
            ...i,
            // 5天内将书籍设置为最新
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
          }))
          if (tempGoodsList.length < 20)
            this.setData({
              isReachBottom: true
            })

          this.setData({
            goodsList: tempGoodsList
          })
        })
    } else {
      wx.cloud.database().collection('goods')
        .where({
          name: wx.cloud.database().RegExp({
            regexp: this.data.keyword,
            options: 'i',
          })
        })
        .get()
        .then(res => {
          let tempGoodsList = res.data.map((i, idx) => ({
            ...i,
            // 5天内将书籍设置为最新
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
          }))
          if (tempGoodsList.length < 20)
            this.setData({
              isReachBottom: true
            })

          this.setData({
            goodsList: tempGoodsList
          })
        })
    }
  },

  // 上拉触底监听事件
  onReachBottom() {
    if (this.data.isReachBottom) {
      return
    } else {
      // 防抖
      this.setData({
        isReachBottom: true
      })
      // 获取数据
      if (!isNaN(Number(this.data.keyword))) {
        wx.cloud.database().collection('goods')
          .where({
            isbn: this.data.keyword
          })
          .skip(this.data.goodsList.length)
          .get()
          .then(res => {
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))
            if (tempGoodsList.length == 20)
              this.setData({
                isReachBottom: false
              })

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList
            })
          })
      } else {
        wx.cloud.database().collection('goods')
          .where({
            name: wx.cloud.database().RegExp({
              regexp: this.data.keyword,
              options: 'i',
            })
          })
          .skip(this.data.goodsList.length)
          .get()
          .then(res => {
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))
            if (tempGoodsList.length == 20)
              this.setData({
                isReachBottom: false
              })

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList
            })
          })
      }
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
          if (event.currentTarget.dataset.openid === __user.getUserOpenid()) {
            wx.showToast({
              title: '不能收藏自己的商品',
              icon: 'none',
            })
          } else {
            // 已经在购物车内
            if (res.data.length) {
              wx.showToast({
                title: '已收藏',
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
})