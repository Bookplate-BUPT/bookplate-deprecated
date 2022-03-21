// pages/main/main.js
import __user from "../../utils/user"

Page({

  data: {
    bookTypeOption: [
      {
        text: '全部书籍',
        value: '',
      },
      {
        text: '本科生',
        value: '本科生',
      },
      {
        text: '研究生',
        value: '研究生',
      },
    ],
    sortTypeOption: [
      {
        text: '默认排序',
        value: '',
      },
      {
        text: '最新上架',
        value: 'post_date',
      },
      {
        text: '最多浏览',
        value: 'views',
      },
      {
        text: '最多收藏',
        value: 'favorites',
      },
    ],
    bookType: '',
    sortType: '',

    goodsList: '',
  },

  onLoad() {

  },

  onShow() {
    this.getGoodsList()
  },

  // 下拉刷新监听
  onPullDownRefresh() {
    wx.showToast({
      title: '正在刷新...',
      icon: 'loading',
    })
    this.getGoodsList()
  },

  // 关键字搜索
  keySearch(event) {
    if (event.detail.length > 0) {
      wx.navigateTo({
        url: '../searchResult/searchResult?keyword=' + event.detail,
      })
    } else {
      wx.showToast({
        title: '内容不能为空',
        icon: 'error'
      })
    }
  },

  // 扫描ISBN搜索
  scanSearch() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        wx.navigateTo({
          url: '../searchResult/searchResult?keyword=' + res.result,
        })
      },
      fail: res => {
        wx.showToast({
          icon: 'error',
          title: '识别失败',
        })
      }
    })
  },

  // 获取商品列表
  getGoodsList() {
    // 无排序要求
    if (!this.data.bookType && !this.data.sortType) {
      wx.cloud.database().collection('goods')
        .get()
        .then(res => {
          let tempGoodsList = res.data.map((i, idx) => ({
            ...i,
            // 5天内将书籍设置为最新
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000
          }))

          this.setData({
            goodsList: tempGoodsList
          })
        })
    }
    // 书籍信息排序（时间、浏览、收藏等）
    else if (!this.data.bookType && this.data.sortType) {
      wx.cloud.database().collection('goods')
        .orderBy(this.data.sortType, 'desc')
        .get()
        .then(res => {
          let tempGoodsList = res.data.map((i, idx) => ({
            ...i,
            // 5天内将书籍设置为最新
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000
          }))

          this.setData({
            goodsList: tempGoodsList
          })
        })
    }
    // 书籍类型排序（本科生、研究生）
    else if (this.data.bookType && !this.data.sortType) {
      wx.cloud.database().collection('goods')
        .where({
          grade: this.data.bookType
        })
        .get()
        .then(res => {
          let tempGoodsList = res.data.map((i, idx) => ({
            ...i,
            // 5天内将书籍设置为最新
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000
          }))

          this.setData({
            goodsList: tempGoodsList
          })
        })
    }
    // 都存在
    else if (this.data.bookType && this.data.sortType) {
      wx.cloud.database().collection('goods')
        .where({
          grade: this.data.bookType
        })
        .orderBy(this.data.sortType, 'asc')
        .get()
        .then(res => {
          let tempGoodsList = res.data.map((i, idx) => ({
            ...i,
            // 5天内将书籍设置为最新
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000
          }))

          this.setData({
            goodsList: tempGoodsList
          })
        })
    }
  },

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
              .then(res => {
                wx.showToast({
                  title: '收藏成功',
                  icon: 'success',
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

  // 筛选书籍类型改变时调用
  bookTypeChange(event) {
    this.setData({
      bookType: event.detail
    })
    this.getGoodsList()
  },

  // 排序类型改变时调用
  sortTypeChange(event) {
    this.setData({
      sortType: event.detail
    })
    this.getGoodsList()
  },

  // 进入商品详情页
  goToBookDetail(event) {
    wx.navigateTo({
      url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
    })
  },
})