// components/CartBookCard/CartBookCard.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    bookDetail: Object,
    _id: String,
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 进入商品详情页
    goToBookDetail(event) {
      if (event.currentTarget.dataset.id == undefined) {
        wx.showToast({
          title: '该书已下架',
          icon: 'error'
        })
      } else
        wx.navigateTo({
          url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
        })
    },

    // 将商品移除购物车
    deleteGoods(event) {
      wx.cloud.database().collection('cart')
        .doc(event.currentTarget.dataset.id)
        .remove()
        .then(res => {
          wx.showToast({
            title: '删除成功',
            icon: 'success',
          })

          this.triggerEvent('delete', { _id: this.properties._id })
        })
        .catch(res => {
          wx.showToast({
            title: '删除失败',
            icon: 'error',
          })
        })
    },

    // 购买商品，联系卖家
    buyGoods(event) {
      if (event.currentTarget.dataset.openid == undefined) {
        wx.showToast({
          title: '该书已下架',
          icon: 'error'
        })
      } else
        wx.navigateTo({
          url: '../chatroom/chatroom?openid=' + event.currentTarget.dataset.openid,
        })
    },
  }
})
