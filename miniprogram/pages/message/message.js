// pages/message/message.js
import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp();

Page({
  data: {
    relationshipList: [],   // 用户列表

    watcher: '',          // 页面关系表监听器
    watcherIsSet: false,  // 监听器是否已经建立
  },

  onLoad() {
    wx.showLoading({
      title: '加载中',
    })
  },

  onShow() {
    // wx.showLoading({
    //   title: '加载中',
    // })
    // if (__user.checkLoginStatus()) {
    //   this.getUserList()
    // }

    if (__user.checkLoginStatus() && !this.data.watcherIsSet) {
      const watcher = wx.cloud.database().collection('relationship')
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
        .watch({
          onChange: this.getRelationshipList.bind(this),
          onError(err) {
            console.log(err)
          }
        })

      this.setData({
        watcher: watcher,
        watcherIsSet: true,
      })
    }
  },

  // async onHide() {
  //   await this.data.watcher.close()
  // },

  // 获取用户关系列表
  getRelationshipList(snapshot) {
    // console.log(snapshot)

    wx.cloud.callFunction({
      name: 'getRelationshipList',
      data: {
        openid: __user.getUserOpenid()
      }
    }).then(res => {
      // console.log(res.result)

      if (res.result.length) {
        // 增加一个自定义的格式化时间
        const tempList = res.result.map((i) => ({
          ...i,
          formatTime: __util.newFormatTime(new Date(i.last_conversation_time))
        }))

        this.setData({
          relationshipList: tempList.sort((x, y) => new Date(y.last_conversation_time) - new Date(x.last_conversation_time))
        })
      }

      wx.hideLoading()
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