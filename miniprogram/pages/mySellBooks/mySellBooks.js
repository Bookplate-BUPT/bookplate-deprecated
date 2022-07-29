
import __user from "../../utils/user"

Page({

  data: {
    MySellBooksList: [],    //我的卖书列表
    changeSellBooksList: []     //存储没有经过格式化的回调卖书列表
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
      this.setData({
        MySellBooksList: tempGoodsList
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