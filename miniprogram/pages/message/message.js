// pages/message/message.js
import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    active: 0,
    openid: '',

    sellerList: [],   // 卖家列表
    buyerList: [],    // 买家列表
  },

  onLoad() {
    this.setData({
      openid: app.globalData.userOpenid,
    })

    this.getSellerList()
  },

  // 获取卖家列表
  async getSellerList() {
    // 以买家为自己获取关系列表
    const sellerList = await wx.cloud.database().collection('relationship')
      .where({
        buyer: this.data.openid
      })
      .get()

    // 根据卖家的openid查询卖家用户的详细信息
    const promiseArray = await sellerList.data.map((i) => (
      wx.cloud.database().collection('users')
        .where({
          _openid: i.seller
        })
        .orderBy('last_conversation_time', 'desc')
        .get()
    ))

    // 等到所有的查询线程结束后再继续进行
    const sellerDetailList = await Promise.all(promiseArray)

    // 将卖家的头像和昵称信息放入列表
    const tempSellerList = sellerList.data.map((i, idx) => ({
      ...i,
      avatar: sellerDetailList[idx].data[0].avatarUrl,
      nickName: sellerDetailList[idx].data[0].nickName,
    }))

    this.setData({
      sellerList: tempSellerList
    })

    console.log(this.data.sellerList)
  },

  // 获取买家列表
  getBuyerList() {

  },

  // 前往聊天室
  gotoChatroom(event) {

  },
})