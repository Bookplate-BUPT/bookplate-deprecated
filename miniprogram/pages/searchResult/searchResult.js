// pages/searchResult/searchResult.js
Page({

  data: {
    keyword: ''
  },

  onLoad(options) {
    this.setData({
      keyword: options.keyword
    })
  },

})