// pages/history/history.js

import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    historyList: '', // 总浏览历史记录
    historySum: '',
    today: '', // 今天的日期
    formatLength: '', //格式化的字符串字数

    // 页面展示
    scrollViewHeight: '', // 页面的显示高度
    triggered: false,     // 页面是否下拉刷新
  },

  onLoad() {
    this.getHistoryList()
    this.getHistorySum()
    this.getIntroductionFormatLength()
    this.getScrollViewHeight()
  },

  onShow() {

  },

  // 用户登录，认证用户信息
  userLogin() {
    // 获取用户昵称、头像
    wx.getUserProfile({
      desc: '获取你的昵称、头像',
      success: res => {
        wx.showToast({
          title: '登录成功',
          icon: 'success',
        })

        app.globalData.userInfo = res.userInfo
        this.setData({
          userInfo: app.globalData.userInfo,
        })

        // 获取用户openid
        wx.cloud.callFunction({
          name: 'getOpenid',
          success: resInner => {
            app.globalData.userOpenid = resInner.result.openid
            this.setData({
              userOpenid: app.globalData.userOpenid,
            })

            // 本地缓存
            wx.setStorageSync('user', {
              userInfo: app.globalData.userInfo,
              userOpenid: app.globalData.userOpenid
            })
          }
        })
      },
      fail: res => {
        wx.showToast({
          title: '获取失败',
          icon: 'error',
        })
      }
    })
  },

  // 获取已浏览的书籍
  async getHistoryList() {
    // 按降序获取浏览历史内的商品ID列表
    var goodsIdList = await wx.cloud.database().collection('history')
      .where({
        _openid: __user.getUserOpenid(),
      }).orderBy('view_time', 'desc')
      .get()

    // 将返回结果映射为数组
    goodsIdList = goodsIdList.data

    // 根据商品ID查询对应的商品详细信息
    const promiseArray = goodsIdList.map((i) => (
      wx.cloud.database().collection('goods')
        .where({
          _id: i.goods_id
        })
        .get()
    ))

    // 等到所有的查询线程结束后再继续进行
    const bookDetailList = await Promise.all(promiseArray)

    // 将详细信息放入原商品ID列表
    var tempHistoryList = goodsIdList.map((i, idx) => ({
      ...i,
      bookDetail: bookDetailList[idx].data[0],
    }))

    tempHistoryList.forEach(i => {
      if (i.bookDetail == undefined)
        i.bookDetail = {
          introduction: '非常抱歉，该书已被他人购买，现已下架',
          image_list: ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/imageDownloadFail.png'],
          name: '已下架',
          college: '无'
        }
      else
        // 书籍介绍内容格式化
        i.bookDetail.introduction = this.introductionFormat(i.bookDetail.introduction, this.data.formatLength)
      // 将时间改为字符串
      i.view_time = i.view_time.toISOString().slice(0, 10)
    })

    this.setData({
      historyList: tempHistoryList,
      today: new Date().toISOString().slice(0, 10),
    })
    return tempHistoryList
  },

  // 将商品移除浏览历史
  deleteHistory(event) {
    wx.cloud.database().collection('history')
      .doc(event.currentTarget.dataset.id)
      .remove()
      .then(res => {
        // 将操作数组取出
        var historyList = this.data.historyList
        // 寻找被删除书籍索引
        const index = historyList.findIndex(i => i._id === event.currentTarget.dataset.id)

        // 删除书籍
        historyList.splice(index, 1)

        // 书籍介绍内容格式化
        historyList.forEach((i, idx) => {
          i.bookDetail.introduction = this.introductionFormat(i.bookDetail.introduction, this.data.formatLength)
        })

        // 更新页面
        this.setData({
          historyList: historyList,
          historySum: this.data.historySum - 1
        })

        wx.showToast({
          title: '删除成功',
          icon: 'success',
        })
      })
      .catch(err => {
        console.error(err)
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        })
      })
  },

  // 获取书籍内容格式化后的字数，注：此函数每个手机只需执行一遍
  getIntroductionFormatLength() {
    var res = wx.getWindowInfo()
    this.setData({
      formatLength: parseInt((res.screenWidth - 168) / 14 * 2 - 3)
    })
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

  // 上拉触底事件
  async onReachBottom() {
    if (this.data.historyList.length < this.data.historySum) {
      var res = await wx.cloud.database().collection('history').where({
        _openid: __user.getUserOpenid()
      }).orderBy('view_time', 'desc')
        .skip(this.data.historyList.length)
        .get()

      // 将返回结果映射为数组
      var list = res.data

      // 根据商品ID查询对应的商品详细信息
      const promiseArray = list.map((i) => (
        wx.cloud.database().collection('goods')
          .where({
            _id: i.goods_id
          })
          .get()
      ))

      // 等到所有的查询线程结束后再继续进行
      const bookDetailList = await Promise.all(promiseArray)

      // 将书籍信息放进原浏览历史列表
      const tempHistoryList = list.map((i, idx) => ({
        ...i,
        bookDetail: bookDetailList[idx].data[0]
      }))

      tempHistoryList.forEach(i => {
        if (i.bookDetail == undefined)
          i.bookDetail = {
            introduction: '非常抱歉，该书已被他人购买，现已下架',
            image_list: ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/imageDownloadFail.png'],
            name: '已下架',
            college: '无'
          }
        else
          // 书籍介绍内容格式化
          i.bookDetail.introduction = this.introductionFormat(i.bookDetail.introduction, this.data.formatLength)
        // 将时间改为字符串
        i.view_time = i.view_time.toISOString().slice(0, 10)
      })

      // 向原数组中添加新值
      this.data.historyList = [...this.data.historyList, ...tempHistoryList]

      // 更新页面
      this.setData({
        historyList: this.data.historyList
      })
    }
  },

  // 下拉刷新事件
  onPullDownRefresh() {
    wx.showToast({
      title: '正在刷新...',
      icon: 'loading'
    })
    this.getHistoryList()
      .then(res => {
        wx.showToast({
          title: '刷新成功',
          icon: 'success'
        })
        setTimeout(() => {
          this.setData({
            triggered: false
          })
        }, 1000)
      })
  },

  // 获取scroll-view的高度
  getScrollViewHeight() {
    const res = wx.getWindowInfo()
    this.setData({
      scrollViewHeight: res.windowHeight - 50
    })
  },

  // 获取浏览历史总数量
  getHistorySum() {
    wx.cloud.database().collection('history').where({
      _openid: __user.getUserOpenid()
    }).count().then(res => {
      this.setData({
        historySum: res.total
      })
    })
  },
})