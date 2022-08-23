// pages/chatroom/chatroom.js
import __user from "../../utils/user"

const app = getApp()

Page({
  data: {
    textInputValue: '', // 待发送的消息
    temptextInput: '',  // 消息发送防抖所用的临时变量

    chatMessage: [],  // 聊天记录对象数组

    openid: '',       // 用户自己的openid
    otherid: '',      // 当前对话对方的openid

    avatarLeft: '',   // 对方用户的头像url
    avatarRight: '',  // 自己的头像url

    relationshipID: '',   // 记录关系在数据库中的 docID
  },

  onLoad(options) {
    this.setData({
      openid: app.globalData.userOpenid,
      otherid: options.otherid,

      avatarLeft: options.avatarLeft,
      avatarRight: app.globalData.userInfo.avatarUrl,

      relationshipID: options.relationshipID,
    })

    this.checkRelationship()
    this.checkUserInfo()

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
        if (docChange.doc.sender === this.data.openid && docChange.doc.recipient === this.data.otherid
          || docChange.doc.sender === this.data.otherid && docChange.doc.recipient === this.data.openid) {

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
      }

      this.setData({
        chatMessage: chatMessage.sort((x, y) => x.sendTime - y.sendTime)
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
      sender: this.data.openid,
      recipient: this.data.otherid,
    }

    // 消息发送防抖
    this.setData({
      temptextInput: this.data.textInputValue,
      textInputValue: '',
    })

    wx.cloud.database().collection('chatroom')
      .add({
        data: doc,
      })
      .then(res => {
        // 消息发送成功后，需要更新一下双方的关系
        wx.cloud.database().collection('relationship')
          .doc(this.data.relationshipID)
          .update({
            data: {
              last_content: doc.content,
              last_conversation_time: doc.sendTime,
            }
          })
      })
      .catch(res => {
        // 发送失败的话需要把数据恢复一下
        this.setData({
          textInputValue: this.data.temptextInput,
          temptextInput: '',
        })
      })
  },

  // 使页面滚动到底部
  pageScrollToBottom() {
    wx.createSelectorQuery().select('#chatroom').boundingClientRect((rect) => {
      wx.pageScrollTo({
        scrollTop: rect.bottom,
        duration: 200,
      })
    }).exec()
  },

  // 检查 relationship 数据库里是否已经建立了与该用户的关系
  checkRelationship() {
    // 如果页面传参不带关系ID
    if (!this.data.relationshipID) {
      wx.cloud.database().collection('relationship')
        .where(
          wx.cloud.database().command.or([
            {
              user1: app.globalData.userOpenid,
              user2: this.data.otherid,
            },
            {
              user1: this.data.otherid,
              user2: app.globalData.userOpenid,
            }
          ])
        )
        .get()
        .then(res => {
          // 如果先前没有记录双方的关系，则需创建
          if (res.data.length === 0) {
            wx.cloud.database().collection('relationship')
              .add({
                data: {
                  last_content: '',
                  last_conversation_time: new Date(),
                  user1: app.globalData.userOpenid,
                  user2: this.data.otherid,
                }
              })
              .then(resInner => {
                this.setData({
                  relationshipID: resInner._id
                })
              })
          } else { // 如果关系已存在
            this.setData({
              relationshipID: res.data[0]._id
            })
          }
        })
    }
  },

  // 检查用户数据是否完整（头像）
  checkUserInfo() {
    // 如果页面跳转不带完整用户信息
    if (!this.data.avatarLeft) {
      wx.cloud.callFunction({
        name: 'getUserPublicInfo',
        data: {
          openid: this.data.otherid
        }
      }).then(res => {
        this.setData({
          avatarLeft: res.result.avatarUrl
        })
      })
    }
  }
})