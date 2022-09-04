// pages/scanISBN/scanISBN.js

const citys = {
  '所有学院': ['所有专业'],
  '未来学院': ['电子信息类（元班）', '计算机类（元班）', '通信工程', '电子科学与技术', '计算机科学与技术', '网路空间安全'],
  '电子工程学院': ['电子信息类', '电子信息科学与技术', '电子科学与技术', '光电信息科学与工程'],
  '计算机学院': ['计算机类', '软件工程', '计算机科学与技术', '网络工程', '数据科学与大数据技术'],
  '信息与通信工程学院': ['通信工程（大类招生）', '通信工程', '电子信息工程', '空间信息与数字技术'],
  '网络空间安全学院': ['网络空间安全（大类招生）', '网络空间安全', '信息安全', '密码科学与技术'],
  '人工智能学院': ['人工智能（大类招生）', '信息工程', '人工智能', '自动化', '智能医学工程'],
  '现代邮政学院': ['自动化类', '管理科学与工程类', '机械工程', '邮政工程', '电子商务', '邮政管理'],
  '经济管理学院': ['大数据管理与应用金融科技', '工商管理类', '工商管理', '公共事业管理'],
  '理学院': ['理科试验班', '数学与应用数学', '信息与计算科学', '应用物理学'],
  '人文学院': ['英语', '日语', '法学'],
  '数字媒体与设计艺术学院': ['智能交互设计', '数字媒体技术', '数字媒体艺术', '网络与新媒体'],
  '国际学院': ['电信工程及管理', '物联网工程', '电子信息工程', '智能科学与技术'],
  '北京邮电大学玛丽女王海南学院': ['信息与计算科学']
};

const college = {
  '所有学院': 0,
  '未来学院': 1,
  '电子工程学院': 2,
  '计算机学院': 3,
  '信息与通信工程学院': 4,
  '网络空间安全学院': 5,
  '人工智能学院': 6,
  '现代邮政学院': 7,
  '经济管理学院': 8,
  '理学院': 9,
  '人文学院': 10,
  '数字媒体与设计艺术学院': 11,
  '国际学院': 12,
  '北京邮电大学玛丽女王海南学院': 13,
}
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
    major: '',          // 书籍对应的专业
    college: '',         //书籍对应的学院
    backedMajor: '',     //备份专业，避免二查数据库
    backedCollege: '',   //备份学院，避免二查数据库

    // 页面展示相关
    showList: [],       // 展示在页面上的图片列表，类型为对象数组
    showListToo: [],    // 展示在页面上的图片列表，类型为对象数组, 原始图片数据
    showDifficultyOverLay: false,   // 遇到困难遮罩层的显示
    helpSteps: [        // 遇到困难遮罩层内容
      {
        text: 'Q：提示功能不能使用',
        desc: 'A：该书正在交易中，不可以修改书籍信息'
      },
      {
        text: 'Q：提示信息不完整',
        desc: 'A：带星号为必填项'
      },
      {
        text: 'Q：上传图片的图标消失',
        desc: 'A：亲，图片最多只能上传9张哦~'
      },
    ],
    state: 0,                   // 书籍是否被锁定

    userOpenid: '',
    showState: true,            // 根据不同的页面判断呈现相应的页面
    showCollege: false,
    showMajor: false,
    columnsCollege: [
      {
        values: Object.keys(college),
      },
    ],
    columnsMajor: [],

    // 回退时需要修改书籍的索引
    index: '',
    tempMessage: ''    // 暂存修改卖书页面传过来的书籍信息
  },

  //选择书籍的类型时调用
  selectCollege(e) {
    this.setData({
      showCollege: true
    })
  },

  //选择书籍的类型时调用
  selectMajor(e) {
    if (this.data.major == '所有专业')
      return
    this.setData({
      showMajor: true,
      columnsMajor: citys[this.data.college]
    })
  },

  onCloseCollege() {
    this.setData({
      showCollege: false
    })
  },

  onCloseMajor() {
    this.setData({
      showMajor: false
    })
  },

  onOrderCollege(e) {
    var tempList = this.selectComponent('#Collegeclassification').getValues()
    if (this.data.college !== tempList[0]) {
      if (tempList[0] == '所有学院') {
        this.setData({
          showCollege: false,
          college: tempList[0],
          major: '所有专业',
        })
        return
      }
      this.setData({
        showCollege: false,
        college: tempList[0],
        major: '',
      })
    }
  },

  onOrderMajor(e) {
    var tempList = this.selectComponent('#Majorclassification').getValues()
    this.setData({
      showMajor: false,
      major: tempList[0],
    })
  },

  // 循环解析url
  getUrl(url) {
    if (url.indexOf('%') < 0) {
      return url
    } else {
      const newUrl = decodeURIComponent(url)
      return this.getUrl(newUrl)
    }
  },

  //根据页面的不同，赋予不同的setdata
  onLoad(options) {
    if (options.identification == 'transmission' || !(JSON.parse(options.message).identification == 'mySellBooks')) {
      wx.cloud.database().collection('users')
        .where({
          _openid: __user.getUserOpenid()
        })
        .get()
        .then(res => {
          this.setData({
            userOpenid: __user.getUserOpenid(),
            major: res.data[0].major,
            backedMajor: res.data[0].major,
            college: res.data[0].college,
            backedCollege: res.data[0].college,
          })

          if (options.scan_isbn === 'true')
            // 调用函数进行扫码
            this.scanISBN()
        })
    }
    else {
      // console.log(JSON.parse(options.message))
      this.setData({
        tempMessage: options.message
      })
      var { author, book_publish_date, description, image_list, introduction, isbn, name, original_price, price, publisher, _id, college, major, state } = JSON.parse(options.message)

      // 首先进行url解码
      image_list.forEach((i, idx) => {
        image_list[idx] = this.getUrl(i)
      })

      for (var i = 0; i < image_list.length; i++) {
        this.data.showList.push({
          url: image_list[i],
          isImage: true,
        })
      }

      var showListToo = this.data.showList.map(i => (i))
      this.setData({
        userOpenid: __user.getUserOpenid(),
        showState: false,
        name: name,
        author: author,
        publishDate: book_publish_date,
        description: description,
        showList: this.data.showList,
        showListToo: showListToo,
        introduction: introduction,
        isbn: isbn,
        originalPrice: original_price,
        price: price,
        publisher: publisher,
        _id: _id,
        college: college,
        major: major,
        index: options.index,
        state: state,
      })
    }
  },

  // 扫描ISBN
  scanISBN() {

    if (this.data.state) {
      wx.showToast({
        title: '书籍已被预订，不能使用扫码填写哦~',
        icon: 'none',
      })
      return
    }
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
            // console.log(JSON.parse(resInner.result))
            if (JSON.parse(resInner.result).showapi_res_body.ret_code) {
              wx.showToast({
                title: '未查询到书籍',
                icon: 'error',
              })
            } else {
              let tempRes = JSON.parse(resInner.result).showapi_res_body.datas[0]
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
      url: res.img,
      isImage: true,
    })

    if (tempImageList[0].url == undefined) {
      wx.showToast({
        title: '未查询到书籍相关图片，请手动拍照上传哦~',
        icon: 'none',
      })
      this.setData({
        author: res.author,
        introduction: res.gist,
        isbn: res.isbn,
        name: res.title,
        publisher: res.publisher,
        publishDate: this.formatPubDate(res.pubdate),
        originalPrice: res.price.toFixed(2),
      })
    } else
      this.setData({
        author: res.author,
        introduction: res.gist,
        showList: tempImageList,
        isbn: res.isbn,
        name: res.title,
        publisher: res.publisher,
        publishDate: this.formatPubDate(res.pubdate),
        originalPrice: res.price.toFixed(2),
      })
  },

  // 清除所有信息
  clearBookDetail() {
    if (this.data.showState) {   // 清空
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
        college: this.data.backedCollege,
        major: this.data.backedMajor,
      })
    } else {
      if (this.data.state) {
        wx.showToast({
          title: '书籍已被预订，不能使用该功能哦~',
          icon: 'none',
        })
        return
      }

      var { author, book_publish_date, image_list, description, introduction, isbn, name, original_price, price, publisher, college, major } = JSON.parse(this.data.tempMessage)  // 还原
      // 处理修改后图片的还原问题
      image_list.forEach((i, idx) => {
        image_list[idx] = this.getUrl(i)
      })
      this.data.showList = []
      for (var i = 0; i < image_list.length; i++) {
        this.data.showList.push({
          url: image_list[i],
          isImage: true,
        })
      }
      this.setData({
        name: name,
        author: author,
        publishDate: book_publish_date,
        description: description,
        showList: this.data.showList,
        introduction: introduction,
        isbn: isbn,
        originalPrice: original_price,
        price: price,
        publisher: publisher,
        college: college,
        major: major,
      })
    }
  },

  // 点击相机图标添加图片
  addImage(event) {

    event.detail.file.forEach(i => {
      this.data.showList.push({
        url: i.url,
        isImage: true,
      })
    })

    this.setData({
      showList: this.data.showList
    })
  },

  // 删除展示列表里的某一张图片
  deleteImage(event) {
    // 如果是修改书籍页面
    if (!this.data.showState) {
      this.data.showList.splice(event.detail.index, 1)
      this.setData({
        showList: this.data.showList
      })
    } else {    // 不是修改书籍页面
      // 如果该图片不存在，则直接删除
      if (this.data.showList[event.detail.index].url == undefined) {
        this.data.showList.splice(event.detail.index, 1)
        this.setData({
          showList: this.data.showList
        })
        return
      }
      if (this.data.showList[event.detail.index].url.slice(0, 8) === 'cloud://')
        wx.cloud.deleteFile({
          fileList: [this.data.showList[event.detail.index].url]
        })
          .then(res => {
            this.data.showList.splice(event.detail.index, 1)
            this.setData({
              showList: this.data.showList
            })
          })
      else {
        this.data.showList.splice(event.detail.index, 1)
        this.setData({
          showList: this.data.showList
        })
      }
    }
  },

  // 将图片上传至云存储
  uploadFilePromise(timeStamp, idx, _openid, format, filePath) {
    return wx.cloud.uploadFile({
      cloudPath: 'bookPicture/' + _openid + '/' + timeStamp + '-' + idx + '-' + _openid + format,
      filePath: filePath
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

    this.fromObjectToChar()

    // 信息是否完整
    if (!this.data.author || !this.data.isbn || !this.data.name || !this.data.publisher || !this.data.publishDate || !this.data.originalPrice || !this.data.description || !this.data.college || !this.data.major || this.data.price === '') {
      wx.showToast({
        title: '信息不完整',
        icon: 'error',
      })
      return
    }

    // 提醒用户没有上传图片信息
    if (!this.data.imageList.length) {
      wx.showToast({
        title: '图片不能为空哦~',
        icon: 'none'
      })
      return
    }

    // 将临时图片路径转换为云存储文件ID
    wx.showLoading({
      title: '录入中',
    })

    const uploadTasks = this.data.imageList.map((i, idx) => {
      if (i.slice(0, 11) === 'http://tmp/' || i.slice(0, 12) === 'wxfile://tmp') {
        return this.uploadFilePromise(new Date().getTime(), idx, __user.getUserOpenid(), i.slice(-4), i)
      } else {
        return i
      }
    });

    Promise.all(uploadTasks)
      .then(res => {
        res.forEach((i, idx) => {
          if (i.fileID != undefined) {
            res[idx] = i.fileID
          }
        })
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
            imageList: res,
            originalPrice: this.data.originalPrice,
            price: this.data.price,
            description: this.data.description,
            openid: this.data.userOpenid,
            major: this.data.major,
            college: this.data.college,
            state: 0, // 表示未售出
          },
          success: res => {
            wx.hideLoading()
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
            wx.hideLoading()
            wx.showToast({
              title: '发布失败',
              icon: 'error',
            })
          }
        })
      })
      .catch(err => {
        wx.showModal({
          content: `${err}`
        })
        console.log(err)
      })
  },

  // 当slider发生拖动改变时调用
  // priceDragInSlider(event) {
  //   let tempPrice = event.detail.value / 100 * Number(this.data.originalPrice)

  //   // 错误检测
  //   if (isNaN(tempPrice)) {
  //     wx.showToast({
  //       icon: 'error',
  //       title: `原价输入有误`,
  //     });
  //     return
  //   } else if (this.data.originalPrice == '') {
  //     wx.showToast({
  //       icon: 'error',
  //       title: `原价不能为空`,
  //     });
  //     return
  //   }

  //   // 保留两位小数
  //   tempPrice = tempPrice.toFixed(2)

  //   this.setData({
  //     price: tempPrice,
  //   })
  // },

  // 当slider发生点击改变时调用
  // priceChangeInSlider(event) {
  //   let tempPrice = event.detail / 100 * Number(this.data.originalPrice)

  //   // 错误检测
  //   if (isNaN(tempPrice)) {
  //     wx.showToast({
  //       icon: 'error',
  //       title: `原价输入有误`,
  //     });
  //     return
  //   } else if (this.data.originalPrice == '') {
  //     wx.showToast({
  //       icon: 'error',
  //       title: `原价不能为空`,
  //     });
  //     return
  //   }

  //   // 保留两位小数
  //   tempPrice = tempPrice.toFixed(2)

  //   this.setData({
  //     price: tempPrice,
  //   })
  // },

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
  },

  //更新上传实时的我的卖书信息，通过选择判断决定是否进行上传更新我的卖书信息
  upDateMySellBooksMessages() {

    if (this.data.state) {
      wx.showToast({
        title: '书籍已被预订，暂不能修改哦~',
        icon: 'none',
      })
      return
    }

    if (!this.data.showList.length) {
      wx.showToast({
        title: '图片不能为空哦~',
        icon: 'none'
      })
      return
    }

    wx.showLoading({
      title: '修改中',
    })
    // 将已删除的数据清除
    this.data.showListToo.forEach(i => {
      var isDelete = true
      this.data.showList.forEach(item => {
        if (i.url === item.url)
          isDelete = false
      })
      if (isDelete && i.url.slice(0, 8) === 'cloud://')    // 如果需要删除
      {
        wx.cloud.deleteFile({
          fileList: [i.url]
        })
      }
    })

    this.fromObjectToChar()
    // 将临时图片路径转换为云存储文件ID
    const uploadTasks = this.data.imageList.map((i, idx) => {
      if (i.slice(0, 11) === 'http://tmp/' || i.slice(0, 12) === 'wxfile://tmp') {
        return this.uploadFilePromise(new Date().getTime(), idx, __user.getUserOpenid(), i.slice(-4), i)
      } else {
        return i
      }
    });
    Promise.all(uploadTasks)
      .then(res => {
        res.forEach((i, idx) => {
          if (i.fileID != undefined) {
            res[idx] = i.fileID
          }
        })

        // 修改本地书籍
        // 获取当前页面栈
        const pages = getCurrentPages();
        // 获取上一页面对象
        let prePage = pages[pages.length - 2];
        var index = this.data.index
        prePage.data.goodsList[index].name = this.data.name
        prePage.data.goodsList[index].author = this.data.author
        prePage.data.goodsList[index].introduction = this.data.introduction
        prePage.data.goodsList[index].isbn = this.data.isbn
        prePage.data.goodsList[index].publisher = this.data.publisher
        prePage.data.goodsList[index].publishDate = this.data.publishDate
        prePage.data.goodsList[index].originalPrice = this.data.originalPrice
        prePage.data.goodsList[index].price = this.data.price
        prePage.data.goodsList[index].image_list = res
        prePage.data.goodsList[index].description = this.data.description
        prePage.data.goodsList[index].major = this.data.major
        prePage.data.goodsList[index].college = this.data.college
        prePage.setData({
          goodsList: prePage.data.goodsList
        })

        // 修改数据库
        wx.cloud.database().collection('goods').doc(this.data._id).update({
          data: {
            name: this.data.name,
            author: this.data.author,
            introduction: this.data.introduction,
            isbn: this.data.isbn,
            publisher: this.data.publisher,
            publishDate: this.data.publishDate,
            originalPrice: this.data.originalPrice,
            price: this.data.price,
            image_list: res,
            description: this.data.description,
            major: this.data.major,
            college: this.data.college,
          }
        }).then(res => {
          wx.showToast({
            title: '修改成功',
            icon: 'success'
          }).then(res => {
            wx.navigateBack()
          })
        })
      })

  },

  // 对象数组映射成字符串数组
  fromObjectToChar() {
    let tempImageList = this.data.showList.map(i => i.url)
    this.setData({
      imageList: tempImageList,
    })
  },

  // 将日期格式化
  formatPubDate(d) {
    return d.slice(0, 4) + '/' + d.slice(4)
  },
})