// pages/main/main.js
Page({

  data: {
    bookTypeOption: [
      {
        text: '全部书籍',
        value: 0,
      },
      {
        text: '大一',
        value: 1,
      },
      {
        text: '大二',
        value: 2,
      },
    ],
    sortTypeOption: [
      {
        text: '默认排序',
        value: 0,
      },
      {
        text: '最新上架',
        value: 1,
      },
      {
        text: '最多浏览',
        value: 2,
      },
      {
        text: '最多收藏',
        value: 3,
      },
    ],
    bookList: [],
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


})