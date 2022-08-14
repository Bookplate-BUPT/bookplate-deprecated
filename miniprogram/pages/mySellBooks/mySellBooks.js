
import __user from "../../utils/user"
import __util from "../../utils/util"

Page({

  data: {
    goodsList: [],    //我的卖书列表
    nowGoodsList: [],    //当前我的卖书列表
    changeSellBooksList: [],     //存储没有经过格式化的回调卖书列表
    today: '', // 今天日期
    postDate: '', // 上传日期
    imageTempList: []
  },

  onShow(options) {
    this.getMySellBooksList()
  },

  //携带参数将对应的数组信息传递到修改信息页面
  goToUpDateMyBookDetail(e) {
    var index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../sellBook/sellBook?message=' + JSON.stringify(this.data.changeSellBooksList[index]),
    })
  },

  //按照要求找到我发布的卖书信息
  getMySellBooksList() {
    wx.cloud.database().collection('goods').where({
      _openid: __user.getUserOpenid(),
    }).get().then(res => {
      res.data.forEach((item, index) => {       //为每一个列表对象增加相同的辨识标志
        Object.assign(item, { identification: 'mySellBooks' })
      })
      this.data.changeSellBooksList = res.data       //存储为格式化的卖书列表
      let tempGoodsList = res.data.map((i, idx) => ({
        ...i,
        // 书籍介绍自定义格式化，最长长度为24
        introduction: this.introductionFormat(i.introduction, 24),
      }))

      // 按时间逆序
      tempGoodsList.sort((a, b) => {
        return b.post_date.getTime() - a.post_date.getTime()
      })

      this.data.changeSellBooksList.sort((a, b) => {
        return b.post_date.getTime() - a.post_date.getTime()
      })

      var postDate = tempGoodsList.map(i => {
        return i.post_date.toISOString().slice(0, 10)
      })
      this.setData({
        goodsList: tempGoodsList,
        nowGoodsList: tempGoodsList.slice(0, 10),
        today: new Date().toISOString().slice(0, 10),
        postDate: postDate
      })
      this.data.nowGoodsList.map((i , idx)=>{
        this.data.imageTempList[idx] = i.image_list
      })
    })
  },

  deleteMyGoods(e) {
    wx.showLoading({
      title: '删除中'
    })
    var index = e.currentTarget.dataset.index
    var length = this.data.imageTempList[index].length
    for(var i = 0;i<length;i++){
      if(this.data.imageTempList[index][i].slice(0, 8) === 'cloud://' || this.data.imageTempList[index][i].slice(0, 9) === 'wxfile://')
      wx.cloud.deleteFile({
        fileList: [this.data.imageTempList[index][i]]
      })
    }
    wx.cloud.database().collection("goods").doc(e.currentTarget.dataset._id).remove()
      .then(res => {
        // 删除并更新数组
        var that = this
        var index = e.currentTarget.dataset.index
        that.data.goodsList.splice(index, 1)
        that.data.changeSellBooksList.splice(index, 1)
        that.data.nowGoodsList.splice(index, 1)
        that.data.postDate.splice(index, 1)
        this.setData({
          goodsList: that.data.goodsList,
          changeSellBooksList: that.data.changeSellBooksList,
          nowGoodsList: that.data.nowGoodsList,
          postDate: that.data.postDate
        })
        // 提示
        wx.hideLoading()
        wx.showToast({
          title: '删除成功',
          icon: 'success',
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
  },

  // 上拉触底监听
  onReachBottom() {
    var res = __util.reachBottom('goods', this.data.goodsSum, this.data.goodsList, this.data.nowGoodsList, 'own')
    if (res == undefined) return
    this.setData({
      goodsList: res.list,
      nowGoodsList: res.nowList,
    })
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