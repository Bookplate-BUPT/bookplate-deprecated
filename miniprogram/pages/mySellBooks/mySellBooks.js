
import __user from "../../utils/user"
import __util from "../../utils/util"

Page({

  data: {
    goodsList: [],                // 我的卖书列表
    today: '',                    // 今天日期
    postDate: '',                 // 上传日期
    imageTempList: [],

    isReachBottom: false,         // 是否到达底部
  },

  onLoad(options) {
    this.getMySellBooksList()
  },

  onShow() {
    // this.getMySellBooksList()
  },

  // 携带参数将对应的数组信息传递到修改信息页面
  goToUpDateMyBookDetail(e) {
    var index = e.currentTarget.dataset.index

    // 跳转前对图片中的url进行编码
    var goodsList = this.data.goodsList
    goodsList[index].image_list.forEach((i, idx) => {
      goodsList[index].image_list[idx] = encodeURIComponent(i)
    })

    wx.navigateTo({
      url: '../sellBook/sellBook?message=' + JSON.stringify(goodsList[index]) + "&index=" + index,
    })
  },

  // 按照要求找到我发布的卖书信息
  getMySellBooksList() {
    wx.cloud.database().collection('goods').where({
      _openid: __user.getUserOpenid(),
    })
      .orderBy('post_date', 'desc')
      .get()
      .then(res => {

        // 判断是否到达底部
        if (res.data.length < 20)
          this.setData({
            isReachBottom: true
          })

        // 为每一个列表对象增加相同的辨识标志
        res.data.forEach((item, index) => {
          Object.assign(item, { identification: 'mySellBooks' })
        })

        var postDate = res.data.map(i => {
          return i.post_date.toISOString().slice(0, 10)
        })

        this.setData({
          goodsList: res.data,
          today: new Date().toISOString().slice(0, 10),
          postDate: postDate
        })

        this.data.goodsList.forEach((i, idx) => {
          this.data.imageTempList[idx] = i.image_list
        })
      })
  },

  // 删除商品
  deleteMyGoods(e) {
    wx.showLoading({
      title: '下架中'
    })
    var index = e.currentTarget.dataset.index
    this.data.imageTempList[index].forEach((i, idx) => {
      if (i.slice(0, 8) === 'cloud://')
        wx.cloud.deleteFile({
          fileList: [i]
        })
    })
    this.deletePriceRange(this.data.goodsList[index].price)
      .then(res => {
        wx.cloud.database().collection("goods").doc(e.currentTarget.dataset._id)
          .remove()
          .then(res => {
            // 删除并更新数组
            this.data.goodsList.splice(index, 1)
            this.data.postDate.splice(index, 1)
            // 更新页面
            this.setData({
              goodsList: this.data.goodsList,
              postDate: this.data.postDate,
            })
            // 提示
            wx.hideLoading()
            wx.showToast({
              title: '下架成功',
              icon: 'success',
            })
          })
      })
  },

  deletePriceRange(e) {
    wx.cloud.callFunction({
      name: 'operatePriceNum',
      data: {
        price: e,
        num: -1,
      }
    })
  },

  // 上拉触底监听
  onReachBottom() {
    if (this.data.isReachBottom) {
      return
    } else {
      // 防抖
      this.setData({
        isReachBottom: true
      })

      wx.cloud.database().collection('goods').where({
        _openid: __user.getUserOpenid(),
      })
        .orderBy('post_date', 'desc')
        .skip(this.data.goodsList.length)
        .get()
        .then(res => {

          // 判断是否到达底部
          if (res.data.length == 20)
            this.setData({
              isReachBottom: false
            })

          // 为每一个列表对象增加相同的辨识标志
          res.data.forEach((item, index) => {
            Object.assign(item, { identification: 'mySellBooks' })
          })

          var postDate = res.data.map(i => {
            return i.post_date.toISOString().slice(0, 10)
          })

          // 将新数据添加至原始数据
          this.data.goodsList = [...this.data.goodsList, ...res.data]
          this.data.postDate = [...this.data.postDate, ...postDate]

          // 更新页面
          this.setData({
            goodsList: this.data.goodsList,
            today: new Date().toISOString().slice(0, 10),
            postDate: this.data.postDate
          })

          this.data.goodsList.forEach((i, idx) => {
            this.data.imageTempList[idx] = i.image_list
          })
        })
    }
  },

})