// pages/message/message.js
import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp();

Page({
  data: {
    relationshipList: [],   // 用户列表
  },

  onLoad() {
    this.getRelationshipList()
  },

  onShow() {
    // wx.showLoading({
    //   title: '加载中',
    // })
    // if (__user.checkLoginStatus()) {
    //   this.getUserList()
    // }
  },

  // 获取用户关系列表
  async getRelationshipList() {
    console.log(__user.getUserOpenid())

    wx.cloud.callFunction({
      name: 'getRelationshipList'
    }).then(res => {
      // 增加一个自定义的格式化时间
      const tempList = res.result.map((i) => ({
        ...i,
        formatTime: __util.newFormatTime(new Date(i.last_conversation_time))
      }))

      this.setData({
        relationshipList: tempList
      })
    })
  },

  // 前往聊天室
  gotoChatroom(event) {
    // 该用户不存在
    if (!event.currentTarget.dataset.avatar) {
      wx.showToast({
        title: '该用户不存在',
        icon: 'error',
      })
      return
    }

    wx.navigateTo({
      url: '../chatroom/chatroom?otherid=' + event.currentTarget.dataset.otherid
        + '&avatarLeft=' + event.currentTarget.dataset.avatar
        + '&relationshipID=' + event.currentTarget.dataset.relationshipid,
    })
  },
})