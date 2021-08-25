// pages/scanISBN/scanISBN.js
Page({

  scanISBN() {

    // wx.scanCode({
    //   onlyFromCamera: false,
    //   scanType: ['barCode'],
    //   success: res => {
    //     console.log('扫描ISBN码成功', res)
    //     wx.cloud.callFunction({
    //       name: 'getBookInfo',
    //       data: {
    //         isbn: res.result
    //       },
    //       success: res => {
    //         console.log('调用云函数getBookInfo成功', res)
    //       },
    //       fail: err => {
    //         console.log('调用云函数getBookInfo失败', err)
    //       }
    //     })
    //   },
    //   fail: err => {
    //     console.log(err)
    //   }
    // })

    wx.cloud.callFunction({
      name: 'getBookInfo',
      data: {
        isbn: '9787510842344'
      },
      success: res => {
        console.log('调用云函数getBookInfo成功', res)
      },
      fail: err => {
        console.log('调用云函数getBookInfo失败', err)
      }
    })
  }


})