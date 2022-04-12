// pages/chatroom/chatroom.js
import __user from "../../utils/user"

const app = getApp()

Page({
  data: {
    textInputValue: '',
    chatMessage: [],  // 聊天记录对象数组

    openid: '',       // 用户自己的openid
    otherid: '',      // 当前对话对方的openid
    avatarLeft: '',   // 对方用户的头像url
    avatarRight: '',  // 自己的头像url
  },

  onLoad(options) {
    this.setData({
      openid: app.globalData.userOpenid,
      otherid: options.openid,
    })

    this.getBothAvatar()

    // console.log(this.data.avatarRight)
  },

  onShow() {

  },

  // 生命周期函数--监听页面初次渲染完成
  onReady() {
    // 监听chatroom数据库里符合两人对话的消息
    // 当这一些消息发生变更（即某人可能发送了消息）时
    // 调用onChange()函数
    wx.cloud.database().collection('chatroom')
      .where(
        wx.cloud.database().command.or([
          {
            sender: this.data.openid,
            recipient: this.data.otherid,
          },
          {
            sender: this.data.otherid,
            recipient: this.data.openid,
          }
        ])
      )
      .watch({
        onChange: this.onChange.bind(this),
        onError(err) {
          console.log(err)
        }
      })
  },

  // 当数据库中的消息发生变更（即某人发送了消息后）调用的函数
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
      content: this.data.textInputValue,
      sendTime: new Date(),
      sendTimeTS: Date.now(),
      sender: this.data.openid,
      recipient: this.data.otherid,
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

  // 获取双方的头像
  getBothAvatar() {
    // 获取对方的头像
    wx.cloud.database().collection('users')
      .where({
        _openid: this.data.otherid
      })
      .get()
      .then(res => {
        if (res.data.length == 0) {
          wx.showToast({
            title: '用户不存在',
            icon: 'error',
          })
        } else {
          this.setData({
            avatarLeft: res.data[0].avatarUrl
          })
        }
      })

    // 获取自己的头像
    wx.cloud.database().collection('users')
      .where({
        _openid: this.data.openid
      })
      .get()
      .then(res => {
        this.setData({
          avatarRight: res.data[0].avatarUrl
        })
      })
  }
})