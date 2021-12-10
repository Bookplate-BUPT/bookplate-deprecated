// pages/bookDetail/bookDetail.js
Page({
  data: {
    goodsID: '',
    bookDetail: '',
  },

  onLoad(options) {
    this.setData({
      goodsID: options.id
    })
    this.getBookDetail()
  },

  getBookDetail() {
    wx.cloud.database().collection('goods')
      .doc(this.data.goodsID)
      .get()
      .then(res => {
        this.setData({
          bookDetail: res.data
        })
      })
  },
})