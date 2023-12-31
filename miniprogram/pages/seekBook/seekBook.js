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

    // 页面展示相关
    showList: [],       // 展示在页面上的图片列表，类型为对象数组
    showDifficultyOverLay: false,   // 遇到困难遮罩层的显示
    helpSteps: [        // 遇到困难遮罩层内容
      {
        text: '一',
        desc: 'AAA'
      },
      {
        text: '二',
        desc: 'BBB'
      },
      {
        text: '三',
        desc: 'CCC'
      },
    ],
  },

  // 扫描ISBN
  scanISBN() {
    // 识别书籍的ISBN码
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        wx.showToast({
          title: '正在识别...',
          icon: 'loading',
        })

        // 将ISBN码上传到云函数
        wx.cloud.callFunction({
          name: 'getBookInfo',
          data: {
            isbn: res.result
          },
          success: resInner => {
            console.log(JSON.parse(resInner.result).data)

            let tempRes = JSON.parse(resInner.result).data

            if (tempRes) {
              this.setBookDetail(tempRes)
              wx.showToast({
                icon: 'success',
                title: '识别成功',
              })

              // 滚动页面到底部
              wx.pageScrollTo({
                scrollTop: 9999,
                duration: 200,
              })
            } else {
              wx.showToast({
                title: '未查询到书籍',
                icon: 'error',
              })
            }
          }
        })
      }
    })
  },

  // 设置书籍信息（在scanISBN里调用）
  setBookDetail(res) {
    let tempImageList = this.data.showList
    tempImageList.push({
      url: res.photoUrl,
      isImage: true,
    })

    this.setData({
      author: res.author,
      introduction: res.description,
      showList: tempImageList,
      isbn: res.code,
      name: res.name,
      publisher: res.publishing,
      publishDate: res.published,
    })
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
    else {
      // 上传数据库
      wx.cloud.database().collection('seek')
        .add({
          data: {
            author: this.data.author,
            introduction: this.data.introduction,
            isbn: this.data.isbn,
            name: this.data.name,
            publisher: this.data.publisher,
            publishDate: this.data.publishDate,
            imageList: this.data.imageList,
            needs: this.data.needs,
            post_date: new Date(),
          }
        })
        .then(res => {
          wx.showToast({
            title: '添加成功',
            icon: 'success',
          }).then(res => {
            wx.switchTab({
              url: '../sellBookMain/sellBookMain',
            })
          })
        })
        .catch(res => {
          wx.showToast({
            title: '添加失败',
            icon: 'error',
          })

          console.log(res)
        })
    }
  },

  // 展示遇到困难遮罩层
  showDifficultyOverLay() {
    this.setData({
      showDifficultyOverLay: true,
    })
  },

  // 隐藏遇到困难遮罩层
  closeDifficultyOverLay() {
    this.setData({
      showDifficultyOverLay: false,
    })
  },
})