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
    nowHistoryList: '', // 当前浏览历史记录
    historySum: '',
    today: '', // 今天的日期
  },

  onLoad() {
    // this.getHistoryList()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })

    if (!this.data.userInfo || !this.data.userOpenid)
      this.setData({ showNoLoginPopup: true })

    this.getHistoryList()
    this.getHistorySum()
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
    // 获取浏览历史内的商品ID列表
    var goodsIdList = await wx.cloud.database().collection('history')
      .where({
        _openid: __user.getUserOpenid(),
      }).get()

    // 将其中的数据取出
    goodsIdList = goodsIdList.data

    // 按照浏览时间逆序排列
    goodsIdList.sort((a, b) => {
      return b.view_time.getTime() - a.view_time.getTime()
    })
    // console.log('goodsIdList:',goodsIdList)

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
    // console.log('bookDetailList:',bookDetailList)

    // 将详细信息放入原商品ID列表
    var tempHistoryList = goodsIdList.map((i, idx) => ({
      ...i,
      bookDetail: bookDetailList[idx].data[0],
    }))
    // console.log('tempHistoryList:',tempHistoryList)

    // 去除空的书籍
    tempHistoryList = tempHistoryList.filter(i => {
      return i.bookDetail != undefined
    })

    // 书籍介绍内容格式化
    for (var tempHistory of tempHistoryList)
      tempHistory.bookDetail.introduction = this.introductionFormat(tempHistory.bookDetail.introduction, 24)

    tempHistoryList.forEach(i => {
      i.view_time = i.view_time.toLocaleDateString()
    })
    this.setData({
      historyList: tempHistoryList,
      nowHistoryList: tempHistoryList.slice(0, 10),
      today: new Date().toLocaleDateString(),
    })
  },

  // 将商品移除浏览历史
  deleteHistory(event) {
    wx.cloud.database().collection('history')
      .doc(event.currentTarget.dataset.id)
      .remove()
      .then(res => {

        let tempNowHistoryList = this.data.nowHistoryList
        let tempHistoryList = this.data.historyList
        const index = this.data.nowHistoryList.findIndex(i => i._id === event.currentTarget.dataset.id)

        tempNowHistoryList.splice(index, 1)
        tempHistoryList.splice(index, 1)

        // 书籍介绍内容格式化
        for (var tempHistory of tempHistoryList)
          tempHistory.bookDetail.introduction = this.introductionFormat(tempHistory.bookDetail.introduction, 24)
        for (var tempNowHistory of tempNowHistoryList)
          tempNowHistory.bookDetail.introduction = this.introductionFormat(tempNowHistory.bookDetail.introduction, 24)

        this.setData({
          nowHistoryList: tempNowHistoryList,
          historyList: tempHistoryList
        })

        wx.showToast({
          title: '删除成功',
          icon: 'success',
        })
      })
      .catch(res => {
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        })
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
  onReachBottom() {
    var res = __util.reachBottom('history', this.data.historySum, this.data.historyList, this.data.nowHistoryList, 'own')
    if (res == undefined) return

    // 将新增加的记录取出
    var len = this.data.historyList.length
    var nowLen = this.data.nowHistoryList.length
    var list = res.list.slice(len, len + 20)
    var nowList = res.nowList.slice(len, len + 10)

    if (nowLen < len)
      this.setData({
        historyList: res.list,
        nowHistoryList: res.nowList,
      })
    else {
      // 根据商品ID查询对应的商品详细信息
      const promiseArray = list.map((i) => (
        wx.cloud.database().collection('goods')
          .where({
            _id: i.goods_id
          })
          .get()
      ))

      // 等到所有的查询线程结束后再继续进行
      Promise.all(promiseArray)

      const tempHistoryList = list.map((i, idx) => ({
        ...i,
        bookDetail: promiseArray[idx].data[0]
      }))

      // 向原数组中添加新值
      var historyList = [...this.data.historyList, tempHistoryList]
      var nowHistoryList = [...this.data.nowHistoryList, tempHistoryList.slice(0, 10)]

      // 更新页面
      this.setData({
        historyList: historyList,
        nowHistoryList: nowHistoryList
      })
    }
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