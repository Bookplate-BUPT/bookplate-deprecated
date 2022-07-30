
import __user from "../../utils/user"

Page({

  data: {
    MySellBooksList: [],    //我的卖书列表
    changeSellBooksList: [],     //存储没有经过格式化的回调卖书列表
    today: '', // 今天日期
    postDate: '', // 上传日期
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
        return b.post_date.toLocaleString() - a.post_date.toLocaleString()
      })
      
      var postDate = tempGoodsList.map(i => {
        return i.post_date.toLocaleDateString()
      })
      this.setData({
        MySellBooksList: tempGoodsList,
        today: new Date().toLocaleDateString(),
        postDate: postDate
      })
    })
  },

  deleteMyGoods(e) {
    wx.showLoading({
      title: '删除中'
    })
    wx.cloud.database().collection("goods").doc(e.currentTarget.dataset._id).remove()
      .then(res => {
        // 删除并更新数组
        var that = this
        that.data.MySellBooksList.splice(e.currentTarget.dataset.index, 1)
        that.data.changeSellBooksList.splice(e.currentTarget.dataset.index, 1)
        this.setData({
          MySellBooksList: that.data.MySellBooksList,
          changeSellBooksList: that.data.changeSellBooksList,
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
})