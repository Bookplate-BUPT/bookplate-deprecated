// pages/seekBook/seekBook.js
import __user from "../../utils/user"

Page({
  data: {
    // 书本信息相关
    author: '',
    introduction: '',   // 书本内容的介绍
    isbn: '',
    name: '',
    publisher: '',
    publishDate: '',
    imageList: [],      // 将要上传至数据库的图片列表，类型为字符串数组
    needs: '',          // 用户对二手书的个人需求

    showList: [],       // 展示在页面上的图片列表，类型为对象数组

  },

  // 扫描ISBN
  scanISBN() {

  },

  // 清楚所有信息
  clearBookDetail() {
    this.setData({
      author: '',
      introduction: '',
      isbn: '',
      name: '',
      publisher: '',
      publishDate: '',
      imageList: [],
      showList: [],
      needs: '',
    })
  },

  // 点击相机图标添加图片
  addImage(event) {
    let tempImageList = this.data.showList
    tempImageList.push({
      url: event.detail.file.url,
      isImage: true,
    })

    this.setData({
      showList: tempImageList
    })
  },

  // 删除展示列表里的某一张图片
  deleteImage(event) {
    let tempImageList = this.data.showList
    tempImageList.splice(event.detail.index, 1)

    this.setData({
      showList: tempImageList
    })
  },

  // 上传全部数据
  uploadBookInfo() {
    // 检查登录状态
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '尚未登录',
        icon: 'error',
      })
      return
    }

    // 对象数组映射成字符串数组
    let tempImageList = this.data.showList.map(i => i.url)
    this.setData({
      imageList: tempImageList,
    })

    // 检查信息是否填写完整
    if (!this.data.name) {
      wx.showToast({
        title: '信息不完整',
        icon: 'error',
      })
    }

    // 上传数据库
    wx.cloud.database().collection('seek')
      .add({
        data: {

        }
      })
  }
})