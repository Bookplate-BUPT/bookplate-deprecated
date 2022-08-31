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

    nickName: '',     // 对方用户的昵称
    avatarLeft: '',   // 对方用户的头像url
    avatarRight: '',  // 自己的头像url

    relationshipID: '',       // 记录关系在数据库中的 docID

    chatWatcher: {},          // 与当前用户聊天内容监听器
    chatWatcherIsSet: false,  // 内容监听器是否已经建立
  },

  async onLoad(options) {
    this.setData({
      openid: app.globalData.userOpenid,
      otherid: options.otherid,

      nickName: options.nickName,
      avatarLeft: options.avatarLeft,
      avatarRight: app.globalData.userInfo.avatarUrl,

      relationshipID: options.relationshipID,
    })

    await this.checkRelationship()
    await this.checkUserInfo()

    wx.setNavigationBarTitle({
      title: this.data.nickName,
    })
  },

  async onShow() {
    if (__user.checkLoginStatus() && !this.data.chatWatcherIsSet) {
      // 监听chatroom数据库里符合两人对话的消息
      // 当这一些消息发生变更（即某人可能发送了消息）时
      // 调用onChange()函数
      const chatWatcher = await wx.cloud.database().collection('chatroom')
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
          onError: this.onError.bind(this),
        })

      this.setData({
        chatWatcher: chatWatcher,
        chatWatcherIsSet: true,
      })
    }
  },

  // 从其他页面进入聊天页面再返回
  // 页面栈调用的是 onUnload() 而不是 onHide()
  // 两个页面设置的监听器都要卸载掉，避免重复监听
  onUnload() {
    this.data.chatWatcher.close()

    this.setData({
      chatWatcherIsSet: false,
    })

    // 退出页面时更新一下关系，消掉红点
    wx.cloud.database().collection('relationship')
      .doc(this.data.relationshipID)
      .get()
      .then(res => {
        // console.log(res.data)

        // 如果最后的消息不是自己发送的，则已读
        if (res.data.last_sender !== this.data.openid && !res.data.is_readed) {
          wx.cloud.database().collection('relationship')
            .doc(this.data.relationshipID)
            .update({
              data: {
                is_readed: true,
                last_send_number: 0,
              }
            })
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

  // 监听器发生错误时调用
  onError(snapshot) {
    console.log(snapshot)

    this.setData({
      chatWatcherIsSet: false,
      // 发生错误时会让监听器重新建立
      // 消息记录会全部重新获取，故而此处需要清空
      chatMessage: [],
    })

    this.onShow()
  },

  // 输入框内容发生改变时调用
  onTextInput(event) {
    this.setData({
      textInputValue: event.detail,
    })
  },

  // 发送消息
  onSend() {
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
      type: 0,  // TODO: 目前只能发送文字消息，以后改吧
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
          .get()
          .then(resInner => {
            // 但需要先检查一下上一次发送者是谁
            wx.cloud.database().collection('relationship')
              .doc(this.data.relationshipID)
              .update({
                data: {
                  last_content: doc.content,
                  last_conversation_time: doc.sendTime,

                  last_content_type: doc.type,
                  last_sender: doc.sender,
                  is_readed: false,

                  // 如果上一次的最后一条消息仍是自己发的，则未读数量自增，否则设1
                  last_send_number: resInner.data.last_sender !== this.data.otherid ? wx.cloud.database().command.inc(1) : 1,
                }
              })
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
        scrollTop: rect.height,
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

                  last_content_type: 0,
                  last_sender: app.globalData.userOpenid,
                  is_readed: false,
                  last_send_number: 0,
                }
              })
              .then(resInner => {
                this.setData({
                  relationshipID: resInner._id
                })
              })
          } else { // 如果关系已存在，则获取关系id
            this.setData({
              relationshipID: res.data[0]._id
            })
          }
        })
    }
  },

  // 检查用户数据是否完整（头像、昵称）
  async checkUserInfo() {
    // 如果页面跳转不带完整用户信息
    if (!this.data.avatarLeft || !this.data.nickName) {
      await wx.cloud.callFunction({
        name: 'getUserPublicInfo',
        data: {
          openid: this.data.otherid
        }
      }).then(res => {
        this.setData({
          avatarLeft: res.result.avatarUrl,
          nickName: res.result.nickName,
        })
      })
    }
  },
})