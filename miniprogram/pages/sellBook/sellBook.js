// pages/scanISBN/scanISBN.js
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
    originalPrice: '',  // 为了使初始化时原价那一栏什么也不写，这里需要为空字符串，而不是数字0
    price: '',          // 二手定价同理
    description: '',    // 用户对自己二手书的描述
    grade: '',          // 书籍对应的学习水平（本科、研究生等）

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

    userOpenid: '',
  },

  onLoad() {
    this.setData({
      userOpenid: __user.getUserOpenid(),
    })
  },

  // 扫描ISBN
  scanISBN() {
    // 识别书籍的ISBN码
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        wx.showToast({
          icon: 'loading',
          title: '正在识别...',
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

  // 设置书籍信息（在scanISBN里调用）
  setBookDetail(res) {
    // 图片的base64格式的处理（旧api接口）
    // 目前isbn查询api已更换，不需要base64
    // let tempImageList = this.data.showList
    // tempImageList.push({
    //   url: 'data:image/png;base64,' + res.image,
    //   isImage: true,
    // })

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
      originalPrice: this.stringToPrice(res.price),
    })
  },

  // 清除所有信息
  clearBookDetail() {
    this.setData({
      author: '',
      introduction: '',
      showList: [],
      isbn: '',
      name: '',
      publisher: '',
      publishDate: '',
      imageList: [],
      originalPrice: '',
      price: '',
      description: '',
      grade: '',
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

  // 将用于展示的图片数组转成可上传至数据库的数组之后，上传全部数据
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

    // 信息是否完整
    if (!this.data.author || !this.data.isbn || !this.data.name || !this.data.publisher || !this.data.publishDate || !this.data.originalPrice || !this.data.description || !this.data.grade || this.data.price === '') {
      wx.showToast({
        title: '信息不完整',
        icon: 'error',
      })
      return
    }

    // 上传数据库
    wx.cloud.callFunction({
      name: 'createGoods',
      data: {
        author: this.data.author,
        introduction: this.data.introduction,
        isbn: this.data.isbn,
        name: this.data.name,
        price: this.data.price,
        publisher: this.data.publisher,
        publishDate: this.data.publishDate,
        imageList: this.data.imageList,
        originalPrice: this.data.originalPrice,
        price: this.data.price,
        description: this.data.description,
        openid: this.data.userOpenid,
        grade: this.data.grade,
      },
      success: res => {
        wx.showToast({
          title: '发布成功',
          icon: 'success',
        }).then(res => {
          wx.switchTab({
            url: '../sellBookMain/sellBookMain',
          })
        })
      },
      fail: res => {
        wx.showToast({
          title: '发布失败',
          icon: 'error',
        })
      }
    })
  },

  // 当slider发生拖动改变时调用
  priceDragInSlider(event) {
    let tempPrice = event.detail.value / 100 * Number(this.data.originalPrice)

    // 错误检测
    if (isNaN(tempPrice)) {
      wx.showToast({
        icon: 'error',
        title: `原价输入有误`,
      });
      return
    } else if (this.data.originalPrice == '') {
      wx.showToast({
        icon: 'error',
        title: `原价不能为空`,
      });
      return
    }

    // 保留两位小数
    tempPrice = tempPrice.toFixed(2)

    this.setData({
      price: tempPrice,
    })
  },

  // 当slider发生点击改变时调用
  priceChangeInSlider(event) {
    let tempPrice = event.detail / 100 * Number(this.data.originalPrice)

    // 错误检测
    if (isNaN(tempPrice)) {
      wx.showToast({
        icon: 'error',
        title: `原价输入有误`,
      });
      return
    } else if (this.data.originalPrice == '') {
      wx.showToast({
        icon: 'error',
        title: `原价不能为空`,
      });
      return
    }

    // 保留两位小数
    tempPrice = tempPrice.toFixed(2)

    this.setData({
      price: tempPrice,
    })
  },

  // 更改书籍的年级时调用
  bookGradeChange(event) {
    this.setData({
      grade: event.detail
    })
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

  // 价格字符串转换
  stringToPrice(str) {
    // xx.xx元 形式
    if (str.endsWith('元')) {
      return Number(str.substr(0, str.length - 2))
    }
    // XXX xx.xx 形式
    else if (!Number(str[0])) {
      if (str.includes('CNY')) {
        return Number((str.split(' '))[1])
      }
    }

    return ''
  }
})