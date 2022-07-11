// components/mainBook/mainBook.js
var util = require('../../utils/util.js');

Component({
  /**
   * 组件的设置选项
   */
  options: {
    multipleSlots: true
  },

  /**
   * 组件的属性列表
   */
  properties: {
    _id: String,
    _openid: String,
    price: String,
    image_list: Array,
    original_price: String,
    name: String,
    grade: String,
    introduction: String,
    left: {
      type: Boolean,
      value: false
    },
    right: {
      type: Boolean,
      value: false
    }
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
      wx.navigateTo({
        url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
      }).then(res => {
        wx.cloud.database().collection('history').where({
          goods_id: event.currentTarget.dataset.id
        }).update({
          data: {
            view_time: util.formatTime(new Date())
          }
        }).then(res => {
          if (!res.stats.updated) {
            wx.cloud.database().collection('history').add({
              data: {
                goods_id: event.currentTarget.dataset.id,
                view_time: util.formatTime(new Date())
              }
            })
          }
        })
      })
    },
  }
})