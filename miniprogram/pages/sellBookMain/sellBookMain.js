// pages/sellBook/sellBook.js
import __user from "../../utils/user"

// 对象解构
const { userLogin } = __user

Page({
  // 对象字面量的属性值简写
  userLogin,

  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
  },

  onShow() {
    this.setData({
      userInfo: __user.getUserInfo(),
      userOpenid: __user.getUserOpenid(),
    })

    if (!__user.checkLoginStatus())
      this.setData({ showNoLoginPopup: true })
  },

  onHide() {
    this.setData({
      showNoLoginPopup: false,
    })
  },

  // 了解更多买卖二手书流程
  toSellDetail() {
    wx.navigateTo({
      url: '../sellDetail/sellDetail',
    })
  },

  // 发布卖书信息
  toSellBook(e) {
    wx.navigateTo({
      url: `../sellBook/sellBook?identification=${e.currentTarget.dataset.identification}&scan_isbn=${e.currentTarget.dataset.scan_isbn}`
    })
  },

  // 发布求书信息
  toSeekBook() {
    wx.showToast({
      title: '此功能暂未开发',
      icon: 'error'
    })
    // wx.navigateTo({
    //   url: '../seekBook/seekBook',
    // })
  },

  // 打开提示弹出层
  showNoLoginPopup() {
    this.setData({ showNoLoginPopup: true });
  },

  // 关闭提示弹出层
  closeNoLoginPopup() {
    if (__user.checkLoginStatus())
      this.setData({ showNoLoginPopup: false });
  },



})