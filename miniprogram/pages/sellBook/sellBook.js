// pages/scanISBN/scanISBN.js
// import Notify from '../../../node_modules/@vant/weapp/dist/notify/notify';

Page({

  data: {
    bookDetail: {
      author: '',
      introduction: '',
      image: '',
      isbn: '',
      name: '',
      price: '',
      publisher: '',
    },
    fileList: [],
  },

  scanISBN() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        // console.log('扫描ISBN码成功', res)
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
            console.log('调用云函数getBookInfo成功', JSON.parse(res.result))
            this.setBookDetail(JSON.parse(res.result).data[0])
            wx.showToast({
              icon: 'success',
              title: '识别成功',
            })
          },
          fail: err => {
            // console.log('调用云函数getBookInfo失败', err)
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

  afterRead(event) {

  },


  setBookDetail(res) {
    var tempBookDetail = {
      author: res.author,
      introduction: res.introduction,
      image: res.image,
      isbn: res.isbn,
      name: res.name,
      price: res.price,
      publisher: res.publisher,
    }
    this.setData({
      bookDetail: tempBookDetail
    })
  },
})