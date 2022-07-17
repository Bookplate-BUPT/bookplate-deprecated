// components/mainBook/mainBook.js

Component({

  // 组件的设置选项
  options: {
    multipleSlots: true
  },

  // 组件的属性列表
  properties: {
    _id: String,
    _openid: String,
    price: String,
    image_list: Array,
    original_price: String,
    name: String,
    grade: String,
    introduction: String,
    isNew: Boolean,

    left: {
      type: Number,
      value: 0
    },
    right: {
      type: Number,
      value: 0
    }
  },

  data: {

  },

  methods: {
    // 进入商品详情页
    goToBookDetail(event) {
      wx.navigateTo({
        url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
      }).then(res => {
        wx.cloud.database().collection('history').where({
          goods_id: event.currentTarget.dataset.id
        }).update({
          data: {
            view_time: new Date()
          }
        }).then(res => {
          if (!res.stats.updated) {
            wx.cloud.database().collection('history').add({
              data: {
                goods_id: event.currentTarget.dataset.id,
                view_time: new Date()
              }
            })
          }
        })
      })
    },
    // 书籍介绍内容格式化
    introductionFormat(str, length) {
      // 过长则需要省略
      if (str.length > length) {
        return str.substr(0, length) + '……'
      }
      // 不用格式化
      else return str
    }
  },
  lifetimes: {
    /**
     * 生命周期函数：在组件实例进入页面节点树时执行
     */
    attached() {
      this.setData({
        introduction: this.introductionFormat(this.properties.introduction, 24)
      })
    }
  }
})