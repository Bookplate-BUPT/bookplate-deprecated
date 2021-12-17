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
    wx.cloud.database().collection('goods')
      .get()
      .then(res => {
        this.setData({
          goodsList: res.data
        })
      })
  },

  // 收藏商品
  favoriteGoods() {
    console.log('收藏')
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
  },

  // 排序类型改变时调用
  sortTypeChange(event) {
    this.setData({
      sortType: event.detail
    })
  },

  // 进入商品详情页
  goToBookDetail(event) {
    wx.navigateTo({
      url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
    })
  },
})