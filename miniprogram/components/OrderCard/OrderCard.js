// components/OrderCard/OrderCard.js
Component({
  // 组件的设置属性
  options: {
    multipleSlots: true
  },

  // 组件的属性列表
  properties: {
    trade_price: '',
    trade_time: '',
    trade_spot: '',
    _id: '',
    state: '',
    bookDetail: {
      type: Object,
      value: {}
    },

    link: {
      type: Boolean,
      value: false
    },

    left: {
      type: Number,
      value: 0
    },
    right: {
      type: Number,
      value: 0
    }
  },

  // 组件的初始数据
  data: {
    showPopup: false
  },

  // 组件的方法列表
  methods: {
    // 跳转到新页面
    gotoNewPage() {
      if (this.properties.link)
        wx.navigateTo({
          url: `../../pages/order/order?bookDetail=${JSON.stringify(this.properties.bookDetail)}&trade_price=${this.properties.trade_price}&trade_time=${this.properties.trade_time}&trade_spot=${this.properties.trade_spot}&_id=${this.properties._id}`,
        })
    },

    // 购买商品，联系卖家
    contactSeller() {
      if (this.properties.bookDetail._openid == undefined) {
        wx.showToast({
          title: '该书已下架',
          icon: 'error'
        })
      } else
        wx.navigateTo({
          url: '../../pages/chatroom/chatroom?otherid=' + this.properties.bookDetail._openid,
        })
    },
  }
})