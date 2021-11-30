// pages/scanISBN/scanISBN.js

Page({
  data: {
    author: '',
    introduction: '',
    showList: [],   // 展示在页面上的图片列表，类型为对象数组
    isbn: '',
    name: '',
    price: '',
    publisher: '',
    publishingTime: '',
    imageList: [],  // 将要上传至数据库的图片列表，类型为字符串数组
  },

  // 扫描ISBN
  scanISBN() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        wx.showToast({
          icon: 'loading',
          title: '正在识别...',
        })

        wx.cloud.callFunction({
          name: 'getBookInfo',
          data: {
            isbn: res.result
          },
          success: res => {
            console.log(JSON.parse(res.result))
            this.setBookDetail(JSON.parse(res.result).data[0])
            wx.showToast({
              icon: 'success',
              title: '识别成功',
            })

            // 滚动页面
            wx.pageScrollTo({
              scrollTop: 999,
              duration: 200,
            })
          },
          fail: err => {
            wx.showToast({
              icon: 'error',
              title: '识别失败',
            })
          }
        })
      },
      fail: err => {
        wx.showToast({
          icon: 'error',
          title: '识别失败',
        })
      }
    })


  },

  // 设置书籍信息
  setBookDetail(res) {
    let tempImageList = this.data.showList
    tempImageList.push({
      url: 'data:image/png;base64,' + res.image,
      isImage: true,
    })

    this.setData({
      author: res.author,
      introduction: res.introduction,
      showList: tempImageList,
      isbn: res.isbn,
      name: res.name,
      price: res.price,
      publisher: res.publisher,
      publishingTime: res.publishingTime,
    })
  },

  // 清楚所有信息
  clearBookDetail() {
    this.setData({
      author: '',
      introduction: '',
      showList: [],
      isbn: '',
      name: '',
      price: '',
      publisher: '',
      publishingTime: '',
      imageList: [],
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

  // 删除其中某一张图片
  deleteImage(event) {
    let tempImageList = this.data.showList
    tempImageList.splice(event.detail.index, 1)

    this.setData({
      showList: tempImageList
    })
  },

  // 将用于展示的图片数组转成可上传至数据库的数组之后，上传全部数据
  uploadBookInfo() {

  }


})