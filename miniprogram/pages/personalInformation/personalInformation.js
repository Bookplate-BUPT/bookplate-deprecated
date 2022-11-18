// pages/personalInformation/personalInformation.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    avatarUrl: [defaultAvatarUrl],    // 保存为仅含一个元素的数组方便之后换取永久路径
    nickname: '',
    userOpenid: '',
  },

  onLoad: function (option) {
    const eventChannel = this.getOpenerEventChannel()
    var that = this                                  // 获取页面实例
    eventChannel.on('getOpenid', function (res) {    // 获取“我的”页面传递而来的userOpenid信息
      that.setData({
        userOpenid: res.userOpenid                   // 保存userOpenid为本地变量
      })
    })
  },

  // 获取头像
  chooseAvatar(e) {
    console.log(e)
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl: [avatarUrl]
    })
  },

  // 将图片上传至云存储
  uploadFilePromise(_openid, format, filePath) {
    return wx.cloud.uploadFile({
      cloudPath: 'avatar/' + _openid + format,
      filePath: filePath
    })
  },

  // 上传头像和昵称
  uploadInformation(e) {
    const nickname = e.detail.value.input
    this.setData({
      nickname,
    })
    if (!this.data.nickname) wx.showToast({                       // 昵称为空
      title: '昵称不能为空',
      icon: 'none'
    })
    else {                                                        // 昵称不空
      const avatarTasks = this.data.avatarUrl.map(i => {          // 将临时路径换为永久路径
        if (i.slice(0, 11) === 'http://tmp/' || i.slice(0, 12) === 'wxfile://tmp') {
          return this.uploadFilePromise(this.data.userOpenid, i.slice(i.lastIndexOf(".") - i.length), i)            // 返回云存储的路径
        } else {
          return i        // 返回原本路径
        }
      });
      Promise.all(avatarTasks)
        .then(res => {
          const eventChannel = this.getOpenerEventChannel()   // 获取页面间事件通信通道
          eventChannel.emit('getAvatarAndNickname', {         // 向“我的”页面返回头像与昵称信息
            userInfo: {
              avatarUrl: res[0].fileID,
              nickName: this.data.nickname
            }
          })
          wx.navigateBack()     // 返回上一页面
        })
        .catch(err => console.error(err))
    }
  },
})