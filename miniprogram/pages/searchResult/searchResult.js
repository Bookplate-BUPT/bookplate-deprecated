// pages/searchResult/searchResult.js

import __user from "../../utils/user"

const app = getApp()

Page({

  data: {
    keyword: '',    // 搜索关键字
    goodsList: '',  // 商品列表
    goodsSum: '',   // 商品总数量
  },

  onLoad(options) {
    this.setData({
      keyword: options.keyword
    })
    this.getGoodsList()
    this.getGoodsSum()
  },


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
            // 书籍介绍自定义格式化，最长长度为24
            introduction: this.introductionFormat(i.introduction, 24),
          }))

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
            // 书籍介绍自定义格式化，最长长度为24
            introduction: this.introductionFormat(i.introduction, 24),
          }))

          this.setData({
            goodsList: tempGoodsList
          })
        })
    }
  },

  onReachBottom() {
    if (this.data.goodsList.length < this.data.goodsSum) {
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
              // 书籍介绍自定义格式化，最长长度为24
              introduction: this.introductionFormat(i.introduction, 24),
            }))

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
              // 书籍介绍自定义格式化，最长长度为24
              introduction: this.introductionFormat(i.introduction, 24),
            }))

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList
            })
          })
      }
    }else
    console.log('this is else')
  },

  // 书籍介绍内容格式化
  introductionFormat(str, length) {
    // 过长则需要省略
    if (str.length > length) {
      return str.substr(0, length) + '……'
    }
    // 不用格式化
    else return str
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

  // 获取商品总数量
  getGoodsSum() {
    if (!isNaN(Number(this.data.keyword))) {
      wx.cloud.database().collection('goods')
        .where({
          isbn: this.data.keyword
        })
        .count()
        .then(res => {
          this.setData({
            goodsSum: res.total
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
        .count()
        .then(res => {
          this.setData({
            goodsSum: res.total
          })
        })
    }
  }
})