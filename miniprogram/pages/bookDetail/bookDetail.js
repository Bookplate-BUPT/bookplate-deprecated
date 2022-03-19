// pages/bookDetail/bookDetail.js
Page({
  data: {
    goodsID: '',
    bookDetail: '',
    sellerDetail: '',

    numOfUserCartGoods: 0,
  },

  onLoad(options) {
    this.setData({
      goodsID: options.id
    })

    this.getBookDetail()


  },

  // 获取书籍详细信息
  getBookDetail() {
    wx.cloud.database().collection('goods')
      .doc(this.data.goodsID)
      .get()
      .then(res => {
        this.setData({
          bookDetail: res.data
        })
        // console.log(this.data.bookDetail)

        // 获取卖家详细信息
        // 之后需要修改成为利用云函数去获取
        wx.cloud.database().collection('users')
          .where({
            _openid: res.data._openid
          })
          .get()
          .then(resInner => {
            this.setData({
              sellerDetail: resInner.data[0]
            })
          })

      })
  },

  // 获取用户购物车内商品总数
  // getNumOfUserCartGoods() {


  //   wx.cloud.database().collection('goods')
  //     .where({

  //     })
  //     .get()
  // },

  // 前往购物车页面 
  gotoCart() {
    wx.switchTab({
      url: '../cart/cart',
    })
  },


})