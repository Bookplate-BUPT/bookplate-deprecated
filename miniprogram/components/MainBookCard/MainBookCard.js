// components/mainBook/mainBook.js

import __util from "../../utils/util"

Component({

  // 组件的设置选项
  options: {
    multipleSlots: true,
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

    disabled: {
      type: Boolean,
      value: false,
    },

    left: {
      type: Number,
      value: 0
    },
    right: {
      type: Number,
      value: 0
    },

    // 刷新页面的相关属性
    isMainPage: {
      type: Boolean,
      value: false
    },
    deleteBookIndex: '',

    bookDetail: Object,
  },

  data: {

  },

  methods: {
    // 进入商品详情页
    goToBookDetail(event) {
      if (!this.properties.disabled)
        wx.navigateTo({
          url: `../bookDetail/bookDetail?id=${event.currentTarget.dataset.id}&isMainPage=${this.properties.isMainPage}&deleteBookIndex=${this.properties.deleteBookIndex}`,
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
  },

  lifetimes: {
    // 生命周期函数：在组件实例进入页面节点树时执行
    attached() {
      // console.log(this.data.bookDetail)

      this.setData({

        introduction: __util.format(this.properties.introduction, 110, 14, 2)
      })
    }
  }
})