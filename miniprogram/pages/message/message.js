// pages/message/message.js
import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp();

Page({
  data: {
    relationshipList: [],   // 用户列表
    openid: '',             // 用户自己的 openid

    watcher: {},          // 页面关系表监听器
    watcherIsSet: false,  // 监听器是否已经建立
  },

  onLoad() {
    if (__user.checkLoginStatus()) {
      wx.showLoading({
        title: '加载中',
      })
    }
  },

  onShow() {
    this.setData({
      openid: __user.getUserOpenid()
    })

    // 如果当前登录了，且监听器还未设置才开始
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

  // 获取用户关系列表
  getRelationshipList(snapshot) {
    // console.log(snapshot)

    wx.cloud.callFunction({
      name: 'getRelationshipList',
      data: {
        openid: __user.getUserOpenid()
      },
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

      // 计算红点数量
      let redDotSum = 0
      res.result.forEach(i => {
        if (i.last_sender !== app.globalData.userOpenid && !i.is_readed) {
          redDotSum += i.last_send_number
        }
      })

      // 设置红点
      if (redDotSum) {
        wx.setTabBarBadge({
          index: 1,
          text: redDotSum.toString()
        }).catch(res => { })
      } else {
        wx.removeTabBarBadge({
          index: 1,
        }).catch(res => { })
      }

      wx.hideLoading()
    }).catch(res => {
      console.log(res)

      wx.hideLoading()
        .then(resInner => {
          wx.showToast({
            title: '加载错误',
            icon: 'error',
          })
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

    let tempList = this.data.relationshipList
    for (let i = 0; i < tempList.length; i++) {
      // 进入页面之前就消除红点
      if (i._id === event.currentTarget.dataset.relationshipid
        && i.last_sender !== app.globalData.userOpenid
        && !i.is_readed) {
        wx.cloud.database().collection('relationship')
          .doc(i._id)
          .update({
            data: {
              is_readed: true,
              last_send_number: 0,
            }
          })
      }
    }

    wx.navigateTo({
      url: '../chatroom/chatroom?otherid=' + event.currentTarget.dataset.otherid
        + '&avatarLeft=' + event.currentTarget.dataset.avatar
        + '&relationshipID=' + event.currentTarget.dataset.relationshipid,
    })
  },
})