// pages/chatroom/chatroom.js
import __user from "../../utils/user"

const app = getApp()

Page({
  data: {
    textInputValue: '',
    chatMessage: [],
    openid: '',
  },

  onLoad() {
    this.setData({
      openid: app.globalData.userOpenid
    })
  },

  onShow() {

  },

  // 生命周期函数--监听页面初次渲染完成
  onReady() {
    wx.cloud.database().collection('chatroom').watch({
      onChange: this.onChange.bind(this),
      onError(err) {
        console.log(err)
      }
    })
  },

  // 当数据库中的消息发生变更（即某人发送了消息后）
  onChange(snapshot) {
    // console.log(snapshot)

    // 初次进入页面时snapshot的类型为init
    if (snapshot.type === 'init') {
      this.setData({
        chatMessage: [
          // 历史消息对象放入数组
          ...this.data.chatMessage,
          // 新的消息排序后也放入数组
          ...[...snapshot.docs].sort((x, y) => x.sendTimeTS - y.sendTimeTS)
        ]
      })
    } else {
      const chatMessage = [...this.data.chatMessage]

      for (const docChange of snapshot.docChanges) {

        // queueType表示列表更新的类型，更新事件对监听列表的影响
        switch (docChange.queueType) {
          // init     初始化列表
          // update   列表中的记录内容有更新，但列表包含的记录不变
          // enqueue  记录进入列表
          // dequeue  记录离开列表
          case 'enqueue': // 有新消息进入
            chatMessage.push(docChange.doc)
            break
        }
      }

      this.setData({
        chatMessage: chatMessage.sort((x, y) => x.sendTimeTS - y.sendTimeTS)
      })
    }

    this.pageScrollToBottom()
  },

  // 输入框内容发生改变时调用
  onTextInput(event) {
    this.setData({
      textInputValue: event.detail,
    })
  },

  // 发送消息
  onSend() {
    this.pageScrollToBottom()

    // 消息为空
    if (!this.data.textInputValue) {
      wx.showToast({
        title: '消息不能为空',
        icon: 'error',
      })
      return
    }

    const doc = {
      avatar: app.globalData.userInfo.avatarUrl,
      nickName: app.globalData.userInfo.nickName,
      textContent: this.data.textInputValue,
      sendTime: new Date(),
      sendTimeTS: Date.now(),
    }

    wx.cloud.database().collection('chatroom').add({
      data: doc,
    }).then(res => {
      this.setData({
        textInputValue: '',
      })
    })
  },

  // 使页面滚动到底部
  pageScrollToBottom() {
    wx.createSelectorQuery().select('#chatroom').boundingClientRect(function (rect) {
      wx.pageScrollTo({
        scrollTop: rect.bottom
      })
    }).exec()
  },
})