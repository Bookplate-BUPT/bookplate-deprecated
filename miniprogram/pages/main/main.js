// pages/main/main.js

import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp()

Page({

  data: {
    // 页面显示
    active: 0,      // 标签栏索引

    // 卖书部分
    bookTypeOption: [
      {
        text: '全部书籍',
        value: '',
      },
      {
        text: '本科生',
        value: '本科生',
      },
      {
        text: '研究生',
        value: '研究生',
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
    bookType: '',   // 书籍类型
    sortType: '',   // 排序类型

    goodsSum: '',    // 商品总数量
    goodsList: '',  // 卖书商品列表
    nowGoodsList: '', // 当前买书商品列表

    // 求书部分
    seekList: '',   // 求书列表

    triggered: false   //关闭下拉刷新界面
  },

  onLoad() {
    this.getGoodsList()
    this.getGoodsSum()
    this.getSeekList()
  },

  onShow() {

  },

  // 下拉刷新监听
  onPullDownRefresh() {
    wx.showToast({
      title: '正在刷新...',
      icon: 'loading',
    })
    this.getGoodsList()
      .then(res => {
        wx.showToast({
          title: '刷新成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.setData({
            triggered: false,
          })
        }, 900)
      })
  },

  // 上拉触底监听
  onReachBottom() {
    var res = __util.reachBottom('goods', this.data.goodsSum, this.data.goodsList, this.data.nowGoodsList, 'collection')
    if (res == undefined) return
    this.setData({
      goodsList: res.list,
      nowGoodsList: res.nowList,
    })
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
  getGoodsSum() {
    wx.cloud.database().collection('goods').count().then(res => {
      this.setData({
        goodsSum: res.total
      })
    })
  },

  // 获取商品列表
  getGoodsList() {
    var promise = new Promise((resolve, reject) => {
      // 无排序要求
      if (!this.data.bookType && !this.data.sortType) {
        wx.cloud.database().collection('goods')
          .get()
          .then(res => {
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
              // 书籍介绍自定义格式化，最长长度为24
              introduction: this.introductionFormat(i.introduction, 24),
            }))

            this.setData({
              goodsList: tempGoodsList,
              nowGoodsList: tempGoodsList.slice(0, 10)
            })
            resolve(res)
          })
      }
      // 书籍信息排序（时间、浏览、收藏等）
      else if (!this.data.bookType && this.data.sortType) {
        wx.cloud.database().collection('goods')
          .orderBy(this.data.sortType, 'desc')
          .get()
          .then(res => {
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
              // 书籍介绍自定义格式化，最长长度为24
              introduction: this.introductionFormat(i.introduction, 24),
            }))

            this.setData({
              goodsList: tempGoodsList,
              nowGoodsList: tempGoodsList.slice(0, 10)
            })
            resolve(res)
          })
      }
      // 书籍类型排序（本科生、研究生）
      else if (this.data.bookType && !this.data.sortType) {
        wx.cloud.database().collection('goods')
          .where({
            grade: this.data.bookType
          })
          .get()
          .then(res => {
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
              // 书籍介绍自定义格式化，最长长度为24
              introduction: this.introductionFormat(i.introduction, 24),
            }))

            this.setData({
              goodsList: tempGoodsList,
              nowGoodsList: tempGoodsList.slice(0, 10)
            })
            resolve(res)
          })
      }
      // 都存在
      else if (this.data.bookType && this.data.sortType) {
        wx.cloud.database().collection('goods')
          .where({
            grade: this.data.bookType
          })
          .orderBy(this.data.sortType, 'asc')
          .get()
          .then(res => {
            let tempGoodsList = res.data.map((i, idx) => ({
              ...i,
              // 5天内将书籍设置为最新
              isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
              // 书籍介绍自定义格式化，最长长度为24
              introduction: this.introductionFormat(i.introduction, 24),
            }))

            this.setData({
              goodsList: tempGoodsList,
              nowGoodsList: tempGoodsList.slice(0, 10)
            })
            resolve(res)
          })
      }
    })
    return promise
  },

  // 筛选书籍类型改变时调用
  bookTypeChange(event) {
    this.setData({
      bookType: event.detail
    })
    this.getGoodsList()
  },

  // 排序类型改变时调用
  sortTypeChange(event) {
    this.setData({
      sortType: event.detail
    })
    this.getGoodsList()
  },

  // 获取求书列表
  getSeekList() {
    wx.cloud.database().collection('seek')
      .get()
      .then(res => {
        let tempSeekList = res.data.map((i, idx) => ({
          ...i,
          // 5天内将书籍设置为最新
          isNew: (new Date).getTime() - i.post_date.getTime() < 432000000,
          // 将日期自定义格式化
          date: this.dateFormat(i.post_date),
          // 书籍介绍自定义格式化，最长长度为50
          introduction: this.introductionFormat(i.introduction, 50),
          // 二手书需求内容格式化
          needs: this.needsFormat(i.needs),
        }))

        this.setData({
          seekList: tempSeekList
        })
      })
  },

  // 添加商品到购物车
  addGoodsToCart(event) {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else {
      // 查询用户购物车里是否已有此商品
      wx.cloud.database().collection('cart')
        .where({
          _openid: __user.getUserOpenid(),
          goods_id: event.currentTarget.dataset.id,
        })
        .get()
        .then(res => {
          // 不允许添加自己的商品进购物车
          if (event.currentTarget.dataset.openid === app.globalData.userOpenid) {
            wx.showToast({
              title: '不能添加自己的商品进购物车',
              icon: 'none',
            })
          } else {
            // 已经在购物车内
            if (res.data.length) {
              wx.showToast({
                title: '已在购物车中',
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
                  wx.showToast({
                    title: '添加成功',
                    icon: 'success',
                  })
                })
            }
          }
        })
    }
  },

  // 自定义格式化日期
  dateFormat(date) {
    return (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
  },

  // 用户需求内容格式化
  needsFormat(str) {
    // 过长则需要省略
    if (str.length > 50) {
      return str.substr(0, 50) + '……'
    }
    // 为空则需要提示
    else if (str.length === 0) {
      return '无二手书具体要求'
    }
    else return str
  },

  // 书籍介绍内容格式化
  introductionFormat(str, length) {
    // 过长则需要省略
    if (str.length > length) {
      return str.substr(0, length) + '……'
    }
    // 不用格式化
    else return str
  },
})