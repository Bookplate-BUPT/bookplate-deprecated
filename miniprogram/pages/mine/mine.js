// pages/mine/mine.js
Page({
  data: {
    userInfo: '',
  },

  userLogin() {
    wx.getUserProfile({
      desc: '获取你的昵称、头像',

      success: res => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
        })
      },
      fail: res => {

      }
    })

  },

  userLogout() {

  },

})