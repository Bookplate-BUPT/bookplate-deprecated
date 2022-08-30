
import __user from "../../utils/user"
import __util from "../../utils/util"

Page({

  data: {
    goodsList: [],                // 我的卖书列表
    // unChangedGoodList: [],     // 存储没有经过格式化的回调卖书列表
    goodsSum: '',                 // 所有的书籍数量
    today: '',                    // 今天日期
    postDate: '',                 // 上传日期
    imageTempList: [],
    formatLength: [],             // 介绍内容格式化的长度
  },

  onLoad(options) {
    // this.getMySellBooksList()
    // this.getIntroductionFormatLength()
    this.getGoodsSum()
  },

  onShow(){
    this.getMySellBooksList()
  },

  // 携带参数将对应的数组信息传递到修改信息页面
  goToUpDateMyBookDetail(e) {
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../sellBook/sellBook?message=' + JSON.stringify(this.data.goodsList[index]),
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
      title: '删除中'
    })
    var index = e.currentTarget.dataset.index
    this.data.imageTempList[index].forEach((i, idx) => {
      if (i.slice(0, 8) === 'cloud://')
        wx.cloud.deleteFile({
          fileList: [i]
        })
    })
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
          goodsSum: this.data.goodsSum - 1,
        })
        // 提示
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
          icon: 'success',
        })
      })
  },

  // 获取书籍内容格式化后的字数
  // getIntroductionFormatLength() {
  //   var res = wx.getWindowInfo()
  //   this.setData({
  //     formatLength: parseInt((res.screenWidth - 168) / 14 * 2 - 3)
  //   })
  // },

  // 书籍介绍内容格式化
  // introductionFormat(str, length) {
  //   // 过长则需要省略
  //   if (str.length > length) {
  //     return str.substr(0, length) + '……'
  //   }
  //   // 不用格式化
  //   else return str
  // },

  // 上拉触底监听
  onReachBottom() {
    if (this.data.goodsList.length < this.data.goodsSum) {
      wx.cloud.database().collection('goods').where({
        _openid: __user.getUserOpenid(),
      })
        .orderBy('post_date', 'desc')
        .skip(this.data.goodsList.length)
        .get()
        .then(res => {
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

  // 获取商品总数量
  getGoodsSum() {
    wx.cloud.database().collection('goods').where({
      _openid: __user.getUserOpenid()
    }).count().then(res => {
      this.setData({
        goodsSum: res.total
      })
    })
  },
})