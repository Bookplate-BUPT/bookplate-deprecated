// pages/personalInformation/personalInformation.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatarUrl: defaultAvatarUrl,
    nickname: '',
  },

  onLoad: function (option) {
    const eventChannel = this.getOpenerEventChannel()
    // 监听 getOpenid 事件，获取上一页面通过 eventChannel 传送到当前页面的数据
    eventChannel.on('getOpenid', function (userOpenid) {    // 获取“我的”页面传递而来的userOpenid信息
      console.log(userOpenid)
    })
  },

  // 获取头像
  chooseAvatar(e) {
    console.log(e)
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },

  // 上传头像和昵称
  uploadInformation(e) {
    const nickname = e.detail.value.input
    this.setData({
      nickname,
    })
    if (!this.data.nickname) wx.showToast({
      title: '昵称不能为空',
      icon: 'none'
    })
    else {
      const eventChannel = this.getOpenerEventChannel()   // 获取页面间事件通信通道
      eventChannel.emit('getAvatarAndNickname', {   // 向“我的”页面返回头像与昵称信息
        userInfo: {
          avatarUrl: this.data.avatarUrl,
          nickName: this.data.nickname
        }
      })
      wx.navigateBack() // 返回上一页面
    }
  },
})