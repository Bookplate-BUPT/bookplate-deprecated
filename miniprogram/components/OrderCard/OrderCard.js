// components/OrderCard/OrderCard.js
Component({
  // 组件的设置属性
  options: {
    multipleSlots: true
  },

  // 组件的属性列表
  properties: {
    trade: {},

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

  },

  // 组件的方法列表
  methods: {
    // 跳转到新页面
    gotoNewPage() {
      if (this.properties.link)
        wx.navigateTo({
          url: `../../pages/order/order?trade=${JSON.stringify(this.properties.trade)}`,
        })
    },

    // 购买商品，联系卖家
    contactSeller() {
      if (this.properties.trade.bookDetail._openid == undefined) {
        wx.showToast({
          title: '该书已下架',
          icon: 'error'
        })
      } else
        wx.navigateTo({
          url: '../../pages/chatroom/chatroom?otherid=' + this.properties.trade.bookDetail._openid,
        })
    },
  }
})