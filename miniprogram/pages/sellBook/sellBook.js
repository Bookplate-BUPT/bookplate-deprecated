// pages/scanISBN/scanISBN.js

Page({
  data: {
    author: '',
    introduction: '',
    showList: [],
    isbn: '',
    name: '',
    price: '',
    publisher: '',
  },

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
            // console.log(JSON.parse(res.result))
            this.setBookDetail(JSON.parse(res.result).data[0])
            wx.showToast({
              icon: 'success',
              title: '识别成功',
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
        console.log(err)
      }
    })
  },

  setBookDetail(res) {
    let tempImageList = this.data.showList
    tempImageList.push({
      url: 'data:image/png;base64,' + res.image,
      isImage: true,
      deletable: true,
    })

    this.setData({
      author: res.author,
      introduction: res.introduction,
      showList: tempImageList,
      isbn: res.isbn,
      name: res.name,
      price: res.price,
      publisher: res.publisher,
    })
  },

  addImage(event) {
    let tempImageList = this.data.showList
    tempImageList.push({
      url: event.detail.file.url,
      isImage: true,
      deletable: true,
    })

    this.setData({
      showList: tempImageList
    })
  },

  infoUpload() {

  }


})