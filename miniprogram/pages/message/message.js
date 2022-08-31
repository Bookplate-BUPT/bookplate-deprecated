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

  async onShow() {
    this.setData({
      openid: __user.getUserOpenid()
    })

    // 如果当前登录了，且监听器还未设置才开始
    if (__user.checkLoginStatus() && !this.data.watcherIsSet) {
      const watcher = await wx.cloud.database().collection('relationship')
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
          onChange: await this.onChange.bind(this),
          onError(err) {
            console.log(err)
          }
        })

      this.setData({
        watcher: watcher,
        watcherIsSet: true,
      })
    }

    this.countRedDot()
  },

  // 获取用户关系列表
  getRelationshipList() {
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

  // 关系列表发生改变时调用
  onChange(snapshot) {
    // 初次加载
    if (snapshot.type === 'init') {
      this.getRelationshipList()
    } else { // 后续有关系更新
      // console.log(snapshot)

      let tempList = [...this.data.relationshipList]
      for (const docChange of snapshot.docChanges) {
        switch (docChange.queueType) {
          // 有关系更新，则直接覆盖对应的本地关系即可
          case 'update':
            for (let i = 0; i < tempList.length; i++) {
              if (tempList[i]._id === docChange.docId) {
                // 只将关系中修改的字段重新赋值
                Object.keys(docChange.updatedFields).forEach((key) => {
                  tempList[i][key] = docChange.doc[key]
                })
                break
              }
            }
            break

          // 有关系新加入
          case 'enqueue':
            // 新加入的关系和从云函数表连接那边获得的不一样
            // 缺少了用户信息，故需要手动获取一下
            wx.cloud.callFunction({
              name: 'getUserPublicInfo',
              data: {
                openid: docChange.doc.user1 !== app.globalData.userOpenid ? docChange.doc.user1 : docChange.doc.user2
              }
            }).then(res => {
              let newRelationship = {
                ...docChange.doc,
                formatTime: __util.newFormatTime(new Date(docChange.doc.last_conversation_time)),
                userInfo: [res.result]
              }
              tempList.push(newRelationship)
            })
            break
        }
      }

      this.setData({
        relationshipList: tempList.sort((x, y) => new Date(y.last_conversation_time) - new Date(x.last_conversation_time))
      })
    }

    this.countRedDot()
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

    let tempList = [...this.data.relationshipList]
    for (let i = 0; i < tempList.length; i++) {
      // 进入页面之前就消除红点
      if (tempList[i]._id === event.currentTarget.dataset.relationshipid
        && tempList[i].last_sender !== app.globalData.userOpenid
        && !tempList[i].is_readed) {
        wx.cloud.database().collection('relationship')
          .doc(tempList[i]._id)
          .update({
            data: {
              is_readed: true,
              last_send_number: 0,
            }
          })
        break
      }
    }

    wx.navigateTo({
      url: '../chatroom/chatroom?otherid=' + event.currentTarget.dataset.otherid
        + '&avatarLeft=' + event.currentTarget.dataset.avatar
        + '&relationshipID=' + event.currentTarget.dataset.relationshipid,
    })
  },

  // 计算消息页面显示红点数
  countRedDot() {
    // 计算红点数量
    let redDotSum = 0
    this.data.relationshipList.forEach(i => {
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
  },

  // 页面隐藏
  onHide() {
    // 页面销毁时监听器失效，置为false
    wx.onAppHide((res) => {
      this.setData({
        watcherIsSet: false,
      })
    })
  },
})