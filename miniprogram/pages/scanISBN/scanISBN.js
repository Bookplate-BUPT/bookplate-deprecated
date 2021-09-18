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
    fileList: [
      {
        url: 'https://img.yzcdn.cn/vant/leaf.jpg',
      },
      {
        url: 'https://img.yzcdn.cn/vant/tree.jpg',
      },
    ],
  },

  /**
   * 调用 getBookInfo 云函数
   * @param {string} 书本的ISBN码
   * @returns {object} 返回包括所有书本详细信息的对象
   * @example 
   * wx.cloud.callFunction({
          name: 'getBookInfo',
          data: {
            isbn: 9787201077642
          }
        })
   */
  scanISBN() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        console.log('扫描ISBN码成功', res)
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
            console.log('调用云函数getBookInfo失败', err)
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
    const { file } = event.detail;
    // 当设置 mutiple 为 true 时, file 为数组格式，否则为对象格式
    wx.uploadFile({
      url: 'http://example.weixin.qq.com/upload', // 仅为示例，非真实的接口地址
      filePath: file.url,
      name: 'file',
      formData: { user: 'test' },
      success(res) {
        // 上传完成需要更新 fileList
        this.data.fileList.push({ ...file, url: res.data });
        this.setData({ fileList });
      },
    });
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