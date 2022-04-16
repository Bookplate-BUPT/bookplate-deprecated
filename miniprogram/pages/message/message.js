// pages/message/message.js
import user from "../../utils/user";
import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    userList: [],   // 用户列表
  },

  onLoad() {
    this.getUserList()
  },

  // 获取用户列表
  async getUserList() {
    // 获取关系列表
    const relationshipList = await wx.cloud.database().collection('relationship')
      .where(
        wx.cloud.database().command.or([
          {
            user1: app.globalData.userOpenid,
          },
          {
            user2: app.globalData.userOpenid,
          }
        ])
      )
      .get()

    // 找出对方的openid，命名为otherid，并用于查找用户的详细资料
    const userOpenidList = relationshipList.data.map((i) => ({
      ...i,
      otherid: i.user1 === app.globalData.userOpenid ? i.user2 : i.user1
    }))

    // console.log(userOpenidList)

    // 根据otherid查询对方用户的详细信息
    const promiseArray = await userOpenidList.map((i) => (
      wx.cloud.database().collection('users')
        .where({
          _openid: i.otherid
        })
        .get()
    ))

    // 等到所有的查询线程结束后再继续进行
    const userDetailList = await Promise.all(promiseArray)

    // 将用户的头像和昵称信息放入列表
    const tempUserList = userDetailList.map((i, idx) => ({
      avatar: userDetailList[idx].data[0].avatarUrl,
      nickName: userDetailList[idx].data[0].nickName,
      otherid: userDetailList[idx].data[0]._openid,
      last_content: userOpenidList[idx].last_content,
      last_conversation_time: userOpenidList[idx].last_conversation_time,
    }))

    // 按时间戳进行排序后再赋值
    this.setData({
      userList: tempUserList.sort((x, y) => y.last_conversation_time - x.last_conversation_time)
    })

    console.log(this.data.userList)
  },

  // 前往聊天室
  gotoChatroom(event) {
    wx.navigateTo({
      url: '../chatroom/chatroom?openid=' + event.currentTarget.dataset.id,
    })
  },
})