// components/OrderCard/OrderCard.js
Component({
  // 组件的设置属性
  options: {
    multipleSlots: true
  },

  // 组件的属性列表
  properties: {
    trade: {},
    page: {
      type: Number,
      value: 0
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
    titleWidth: ''
  },

  // 组件的方法列表
  methods: {
    // 跳转到新页面
    gotoNewPage() {
      if (this.properties.link) {
        // 跳转前对url进行编码
        this.properties.trade.bookDetail.image_list.forEach((i, idx) => {
          this.properties.trade.bookDetail.image_list[idx] = encodeURIComponent(i)
        })
        wx.navigateTo({
          url: `../../pages/order/order?trade=${JSON.stringify(this.properties.trade)}`,
        })
      }
    },

    // 购买商品，联系卖家
    contactSeller() {
      if (this.properties.page) {
        // 我是买家，需要联系卖家
        if (this.properties.trade.bookDetail._openid == undefined) {
          wx.showToast({
            title: '该用户不存在',
            icon: 'error'
          })
        } else
          wx.navigateTo({
            url: '../../pages/chatroom/chatroom?otherid=' + this.properties.trade.bookDetail._openid,
          })
      } else {
        // 我是卖家，需要联系买家
        if (this.properties.trade._openid == undefined) {
          wx.showToast({
            title: '该用户不存在',
            icon: 'error'
          })
        } else
          wx.navigateTo({
            url: '../../pages/chatroom/chatroom?otherid=' + this.properties.trade._openid,
          })
      }
    },
    // 获取标题的长度
    getTitleWidth() {
      var res = wx.getWindowInfo()
      var width = res.screenWidth
      var titleWidth = width - 205      // - 32 - 32 - 88 - 8 + 16 - 58 - 3
      this.setData({
        titleWidth: titleWidth
      })
    },
    formatImage() {
      this.properties.trade.bookDetail.image_list.forEach((i, idx) => {
        if (i.slice(0, 8) === 'cloud://')
          wx.cloud.getTempFileURL({
            fileList: [i],
            success: res => {
              if (res.fileList[0].status) {
                this.properties.trade.bookDetail.image_list[idx] = 'cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/imageDownloadFail.png'
                this.setData({
                  trade: this.properties.trade
                })
              }
            },
          })
      })
    },
  },
  lifetimes: {
    attached() {
      this.getTitleWidth()
      this.formatImage()
    },
  },
})