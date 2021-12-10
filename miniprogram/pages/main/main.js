// pages/main/main.js
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
  addGoodsToCart() {
    console.log('添加购物车')
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