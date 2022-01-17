// pages/searchResult/searchResult.js
Page({

  data: {
    keyword: '',    // 搜索关键字
    goodsList: '',  // 商品列表
  },

  onLoad(options) {
    this.setData({
      keyword: options.keyword
    })
    this.getGoodsList()
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
            isNew: (new Date).getTime() - i.post_date.getTime() < 432000000
          }))

          this.setData({
            goodsList: tempGoodsList
          })
        })
    } else {
      wx.cloud.database().collection('goods')
        .where({
          name: this.data.keyword
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
  }
})