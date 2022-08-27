// pages/main/main.js

import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp()

Page({

  data: {
    // 页面显示
    active: 0,              // 标签栏索引
    scrollViewHeight: '',   // 页面高度
    // formatLength: '',    // 格式化内容后的文字数量

    // 卖书部分
    bookTypeOption: [
      {
        text: '全部书籍',
      },
      {
        text: '未来学院',
        children: [
          {
            text: '电子信息类（元班）',
            value: '电子信息类（元班）',
          },
          {
            text: '计算机类（元班）',
            value: '计算机类（元班）',
          },
          {
            text: '通信工程',
            value: '通信工程',
          },
          {
            text: '电子科学与技术',
            value: '电子科学与技术',
          },
          {
            text: '计算机科学与技术',
            value: '计算机科学与技术',
          },
          {
            text: '网路空间安全',
            value: '网路空间安全',
          },
        ],
      },
      {
        text: '信息与通信工程学院',
        children: [
          {
            text: '通信工程（大类招生）',
            value: '通信工程（大类招生）',
          },
          {
            text: '通信工程',
            value: '通信工程',
          },
          {
            text: '电子信息工程',
            value: '电子信息工程',
          },
          {
            text: '空间信息与数字技术',
            value: '空间信息与数字技术',
          },
        ],
      },
      {
        text: '电子工程学院',
        children: [
          {
            text: '电子信息类',
            value: '电子信息类',
          },
          {
            text: '电子信息科学与技术',
            value: '电子信息科学与技术',
          },
          {
            text: '电子科学与技术',
            value: '电子科学与技术',
          },
          {
            text: '光电信息科学与工程',
            value: '光电信息科学与工程',
          },
        ],
      },
      {
        text: '计算机学院',
        children: [
          {
            text: '计算机类',
            value: '计算机类',
          },
          {
            text: '软件工程',
            value: '软件工程',
          },
          {
            text: '计算机科学与技术',
            value: '计算机科学与技术',
          },
          {
            text: '网络工程',
            value: '网络工程',
          },
          {
            text: '数据科学与大数据技术',
            value: '数据科学与大数据技术',
          },
        ],
      },
      {
        text: '网络空间安全学院',
        children: [
          {
            text: '网络空间安全（大类招生）',
            value: '网络空间安全（大类招生）',
          },
          {
            text: '网络空间安全',
            value: '网络空间安全',
          },
          {
            text: '信息安全',
            value: '信息安全',
          },
          {
            text: '密码科学与技术',
            value: '密码科学与技术',
          },
        ],
      },
      {
        text: '人工智能学院',
        children: [
          {
            text: '人工智能（大类招生）',
            value: '人工智能（大类招生）',
          },
          {
            text: '信息工程',
            value: '信息工程',
          },
          {
            text: '人工智能',
            value: '人工智能',
          },
          {
            text: '自动化',
            value: '自动化',
          },
          {
            text: '智能医学工程',
            value: '智能医学工程',
          },
        ],
      },
      {
        text: '现代邮政学院',
        children: [
          {
            text: '自动化类',
            value: '自动化类',
          },
          {
            text: '管理科学与工程类',
            value: '管理科学与工程类',
          },
          {
            text: '机械工程',
            value: '机械工程',
          },
          {
            text: '邮政工程',
            value: '邮政工程',
          },
          {
            text: '电子商务',
            value: '电子商务',
          },
          {
            text: '邮政管理',
            value: '邮政管理',
          },
        ],
      },
      {
        text: '经济管理学院',
        children: [
          {
            text: '大数据管理与应用金融科技',
            value: '大数据管理与应用金融科技',
          },
          {
            text: '工商管理类',
            value: '工商管理类',
          },
          {
            text: '工商管理',
            value: '工商管理',
          },
          {
            text: '公共事业管理',
            value: '公共事业管理',
          },
        ],
      },
      {
        text: '理学院',
        children: [
          {
            text: '理科试验班',
            value: '理科试验班',
          },
          {
            text: '数学与应用数学',
            value: '数学与应用数学',
          },
          {
            text: '信息与计算科学',
            value: '信息与计算科学',
          },
          {
            text: '应用物理学',
            value: '应用物理学',
          },
        ],
      },
      {
        text: '人文学院',
        children: [
          {
            text: '英语',
            value: '英语',
          },
          {
            text: '日语',
            value: '日语',
          },
          {
            text: '法学',
            value: '法学',
          },
        ],
      },
      {
        text: '数字媒体与设计艺术学院',
        children: [
          {
            text: '智能交互设计',
            value: '智能交互设计',
          },
          {
            text: '数字媒体技术',
            value: '数字媒体技术',
          },
          {
            text: '数字媒体艺术',
            value: '数字媒体艺术',
          },
          {
            text: '网络与新媒体',
            value: '网络与新媒体',
          },
        ],
      },
      {
        text: '国际学院',
        children: [
          {
            text: '电信工程及管理',
            value: '电信工程及管理',
          },
          {
            text: '物联网工程',
            value: '物联网工程',
          },
          {
            text: '电子信息工程',
            value: '电子信息工程',
          },
          {
            text: '智能科学与技术',
            value: '智能科学与技术',
          },
        ],
      },
      {
        text: '北京邮电大学玛丽女王海南学院',
        children: [
          {
            text: '信息与计算科学',
            value: '信息与计算科学',
          },
        ],
      },
    ],

    sortTypeOption: [
      {
        text: '默认排序',
        value: '',
      },
      {
        text: '最新上架',
        value: 'post_date',
      },
      {
        text: '最多浏览',
        value: 'views',
      },
    ],
    bookType: '全部书籍',    // 书籍类型
    sortType: '',           // 排序类型

    // goodsSum: '',        // 商品总数量
    goodsList: '',          // 卖书商品列表
    isReachBottom: false,   // 是否到达最底部

    // 求书部分
    seekList: '',           // 求书列表

    triggered: false,       // 关闭下拉刷新界面
    college: '',            // 选择的学院
    major: '',              // 选择的专业
    mainActiveIndex: 0,
    StateSum: 0,            //收藏tabbar展示的数字
    // cartSum: 0,          //我的tabbar展示的数字
  },

  onLoad() {
    this.getGoodsList()
    // this.getGoodsSum()
    this.getScrollViewHeight()
  },

  onShow() {
    this.countNumOfStateSum()
    // this.getCartSum()
  },

  //获取学院信息
  onClickNav({ detail = {} }) {
    this.setData({
      mainActiveIndex: detail.index || 0,
    });
    this.data.college = this.data.bookTypeOption[this.data.mainActiveIndex].text
    if (this.data.college === '全部书籍') {
      this.setData({
        bookType: '全部书籍',
        isReachBottom: false,
      })
      this.selectComponent('#identity').toggle(false)
      this.getGoodsList()
    }
  },

  //获取专业信息
  onClickItem({ detail = {} }) {
    this.data.major = detail.value
    var booksClassification = this.data.college + this.data.major
    this.setData({
      bookType: booksClassification,
      isReachBottom: false,
    })
    this.selectComponent('#identity').toggle(false)
    this.getGoodsList()
  },

  // 获取scroll-view的高度
  getScrollViewHeight() {
    const res = wx.getWindowInfo()
    this.setData({
      scrollViewHeight: res.windowHeight - 153
    })
  },

  // 下拉刷新监听
  onPullDownRefresh() {
    wx.showToast({
      title: '正在刷新...',
      icon: 'loading',
    })
    // 重置是否到达最底部标志
    this.setData({
      isReachBottom: false,
    })
    this.getGoodsList()
      .then(res => {
        wx.showToast({
          title: '刷新成功',
          icon: 'success',
          duration: 1000
        })
        setTimeout(() => {
          this.setData({
            triggered: false,
          })
        }, 1000)
      })
  },

  // 上拉触底监听
  onReachBottom() {
    // 已到达最底部，无需刷新
    if (this.data.isReachBottom) {
      return
    } else {
      // 加个简单的防抖
      this.setData({
        isReachBottom: true
      })
      // 无排序要求
      if (this.data.bookType === '全部书籍' && !this.data.sortType) {
        wx.cloud.database().collection('goods')
          .skip(this.data.goodsList.length)
          .limit(20)
          .get()
          .then(res => {
            if (res.data.length)
              this.setData({
                isReachBottom: false
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList,
            })
          })
      }
      // 书籍信息排序（时间、浏览、收藏等）
      else if (this.data.bookType === '全部书籍' && this.data.sortType) {
        wx.cloud.database().collection('goods')
          .orderBy(this.data.sortType, 'desc')
          .skip(this.data.goodsList.length)
          .limit(20)
          .get()
          .then(res => {
            if (res.data.length)
              this.setData({
                isReachBottom: false
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList,
            })
          })
      }
      // 书籍类型排序（学院、专业）
      else if (this.data.bookType !== '全部书籍' && !this.data.sortType) {
        wx.cloud.database().collection('goods')
          .where({
            college: this.data.college,
            major: this.data.major,
          })
          .skip(this.data.goodsList.length)
          .limit(20)
          .get()
          .then(res => {
            if (res.data.length)
              this.setData({
                isReachBottom: false
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList,
            })
          })
      }
      // 都存在
      else if (this.data.bookType !== '全部书籍' && this.data.sortType) {
        wx.cloud.database().collection('goods')
          .where({
            college: this.data.college,
            major: this.data.major,
          })
          .orderBy(this.data.sortType, 'asc')
          .skip(this.data.goodsList.length)
          .limit(20)
          .get()
          .then(res => {
            if (res.data.length)
              this.setData({
                isReachBottom: false
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            // 拼接数组
            this.data.goodsList = [...this.data.goodsList, ...tempGoodsList]

            this.setData({
              goodsList: this.data.goodsList,
            })
          })
      }
    }
  },

  // 关键字搜索
  keySearch(event) {
    if (event.detail.length > 0) {
      wx.navigateTo({
        url: '../searchResult/searchResult?keyword=' + event.detail,
      })
    } else {
      wx.showToast({
        title: '内容不能为空',
        icon: 'error'
      })
    }
  },

  // 扫描ISBN搜索
  scanSearch() {
    wx.scanCode({
      onlyFromCamera: false,
      scanType: ['barCode'],
      success: res => {
        wx.navigateTo({
          url: '../searchResult/searchResult?keyword=' + res.result,
        })
      },
      fail: res => {
        wx.showToast({
          icon: 'error',
          title: '识别失败',
        })
      }
    })
  },

  // 获取商品总数量
  // getGoodsSum() {
  //   var promise = new Promise((resolve, reject) => {
  //     wx.cloud.database().collection('goods')
  //       .count()
  //       .then(res => {
  //         this.setData({
  //           goodsSum: res.total
  //         })
  //         resolve(res)
  //       })
  //   })
  //   return promise
  // },

  // 获取商品列表
  getGoodsList() {
    var promise = new Promise((resolve, reject) => {
      // 无排序要求
      if (this.data.bookType === '全部书籍' && !this.data.sortType) {
        wx.cloud.database().collection('goods')
          .get()
          .then(res => {
            if (!res.data.length)
              this.setData({
                isReachBottom: true
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            this.setData({
              goodsList: tempGoodsList,
            })
            resolve(res)
          })
      }
      // 书籍信息排序（时间、浏览、收藏等）
      else if (this.data.bookType === '全部书籍' && this.data.sortType) {
        wx.cloud.database().collection('goods')
          .orderBy(this.data.sortType, 'desc')
          .get()
          .then(res => {
            if (!res.data.length)
              this.setData({
                isReachBottom: true
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            this.setData({
              goodsList: tempGoodsList,
            })
            resolve(res)
          })
      }
      // 书籍类型排序（学院、专业）
      else if (this.data.bookType !== '全部书籍' && !this.data.sortType) {
        wx.cloud.database().collection('goods')
          .where({
            college: this.data.college,
            major: this.data.major,
          })
          .get()
          .then(res => {
            if (!res.data.length)
              this.setData({
                isReachBottom: true
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            this.setData({
              goodsList: tempGoodsList
            })
            resolve(res)
          })
      }
      // 都存在
      else if (this.data.bookType !== '全部书籍' && this.data.sortType) {
        wx.cloud.database().collection('goods')
          .where({
            college: this.data.college,
            major: this.data.major,
          })
          .orderBy(this.data.sortType, 'asc')
          .get()
          .then(res => {
            if (!res.data.length)
              this.setData({
                isReachBottom: true
              })
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
            }))

            this.setData({
              goodsList: tempGoodsList
            })
            resolve(res)
          })
      }
    })
    return promise
  },

  // 排序类型改变时调用
  sortTypeChange(event) {
    console.log(event.detail)
    this.setData({
      sortType: event.detail,
      isReachBottom: false,
    })
    this.getGoodsList()
  },

  // 获取求书列表
  // getSeekList() {
  //   wx.cloud.database().collection('seek')
  //     .get()
  //     .then(res => {
  //       let tempSeekList = res.data.map((i, idx) => ({
  //         ...i,
  //         // 5天内将书籍设置为最新
  //         isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
  //         // 将日期自定义格式化
  //         date: this.dateFormat(i.post_date),
  //         // 书籍介绍自定义格式化，最长长度为50
  //         introduction: this.introductionFormat(i.introduction, 50),
  //         // 二手书需求内容格式化
  //         needs: this.needsFormat(i.needs),
  //       }))

  //       this.setData({
  //         seekList: tempSeekList
  //       })
  //     })
  // },

  // 添加商品到购物车
  addGoodsToCart(event) {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
      return
    } else {
      wx.cloud.database().collection('goods')
        .where({
          _id: event.currentTarget.dataset.id
        })
        .count()
        .then(res => {
          // 查看书籍是否存在
          if (res.total) {
            // 查询用户购物车里是否已有此商品
            wx.cloud.database().collection('cart')
              .where({
                _openid: __user.getUserOpenid(),
                goods_id: event.currentTarget.dataset.id,
              })
              .count()
              .then(res => {
                // 不允许添加自己的商品进购物车
                if (event.currentTarget.dataset.openid === app.globalData.userOpenid) {
                  wx.showToast({
                    title: '不能收藏自己的商品',
                    icon: 'none',
                  })
                } else {
                  // 已经在购物车内
                  if (res.total) {
                    wx.showToast({
                      title: '已收藏',
                      icon: 'error',
                    })
                  } else {
                    // 不在购物车内
                    wx.cloud.database().collection('cart')
                      .add({
                        data: {
                          goods_id: event.currentTarget.dataset.id,
                          add_time: new Date(),
                        }
                      })
                      .then(res => {
                        // this.setData({
                        //   cartSum: this.data.cartSum + 1
                        // })
                        // wx.setTabBarBadge({
                        //   index: 3,
                        //   text: this.data.cartSum.toString()
                        // })
                        wx.showToast({
                          title: '添加成功',
                          icon: 'success',
                        })
                      })
                  }
                }
              })
          } else {
            this.data.goodsList.splice(event.currentTarget.dataset.index, 1)
            this.setData({
              goodsList: this.data.goodsList
            })

            wx.showToast({
              title: '该书籍已被购买，建议下拉刷新',
              icon: 'none',
              duration: 2000
            })
          }
        })
        .catch(err => console.error(err))
    }
  },

  // 用户需求内容格式化
  // needsFormat(str) {
  //   // 过长则需要省略
  //   if (str.length > 50) {
  //     return str.substr(0, 50) + '……'
  //   }
  //   // 为空则需要提示
  //   else if (str.length === 0) {
  //     return '无二手书具体要求'
  //   }
  //   else return str
  // },

  // 获取书籍内容格式化后的字数
  // getIntroductionFormatLength() {
  //   var res = wx.getWindowInfo()
  //   this.setData({
  //     formatLength: parseInt((res.screenWidth - 168) / 14 * 2 - 3)
  //   })
  // },

  // 书籍介绍内容格式化
  // introductionFormat(str, length) {
  //   // 过长则需要省略
  //   if (str.length > length) {
  //     return str.substr(0, length) + '……'
  //   }
  //   // 不用格式化
  //   else return str
  // },

  // 计算tabbar展示的商品数量
  countNumOfStateSum() {
    if (__user.checkLoginStatus())
      wx.cloud.database().collection('trade')
        .where({
          _openid: __user.getUserOpenid(),
          state: 1
        })
        .count()
        .then(res => {
          this.setData({
            StateSum: res.total
          })
          wx.cloud.database().collection('trade')
            .where({
              seller_openid: __user.getUserOpenid(),
              state: 0
            })
            .count()
            .then(resner => {
              var tempnum = this.data.StateSum + resner.total
              if (tempnum) {
                wx.setTabBarBadge({
                  index: 4,
                  text: tempnum.toString()
                })
              } else {
                wx.removeTabBarBadge({
                  index: 4,
                })
              }
            })
        })
  },

  // // 获取购物车总商品量
  // getCartSum() {
  //   wx.cloud.database().collection('cart').where({
  //     _openid: __user.getUserOpenid()
  //   }).count().then(res => {
  //     this.setData({
  //       cartSum: res.total
  //     })
  //     if (this.data.cartSum) {
  //       wx.setTabBarBadge({
  //         index: 3,
  //         text: this.data.cartSum.toString()
  //       })
  //     }
  //   })
  // },
})