// pages/history/history.js

import __user from "../../utils/user"
import __util from "../../utils/util"

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    historyList: '',              // 总浏览历史记录
    isReachBottom: false,         // 是否到达底部
    today: '',                    // 今天的日期

    // 页面展示
    // scrollViewHeight: '',      // 页面的显示高度
    // triggered: false,          // 页面是否下拉刷新
  },

  onLoad() {
    this.getHistoryList()
  },

  onShow() {

  },

  // 获取已浏览的书籍
  getHistoryList() {
    var promise = new Promise((resolve, reject) => {
      // 获取浏览历史列表
      wx.cloud.callFunction({
        name: 'getHistoryList',
        data: {
          skipNum: 0
        }
      })
        .then(res => {
          var tempHistoryList = res.result.list
          if (tempHistoryList.length < 20)
            this.setData({
              isReachBottom: true
            })

          // console.log(tempHistoryList)

          tempHistoryList.forEach((i, idx) => {
            if (i.bookDetail.length === 0)
              // 将不存在的书籍统一化
              i.bookDetail = [{
                introduction: '非常抱歉，该书已被他人购买，现已下架',
                image_list: ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/imageDownloadFail.png'],
                name: '已下架',
                college: '无',
                major: '无',
              }]

            // 这里的时间是ISO标准（这里不太理解）
            i.view_time = i.view_time.slice(0, 10)
          })

          this.setData({
            historyList: tempHistoryList,
            today: new Date().toISOString().slice(0, 10),
          })

          resolve(res)
        })
        .catch(err => console.error(err))
    })
    return promise
  },

  // 将商品移除浏览历史
  deleteHistory(event) {
    wx.cloud.database().collection('history')
      .doc(event.currentTarget.dataset.id)
      .remove()
      .then(res => {

        // 删除书籍
        this.data.historyList.splice(this.data.historyList.findIndex(i => i._id === event.currentTarget.dataset.id), 1)

        // 更新页面
        this.setData({
          historyList: this.data.historyList,
        })

        wx.showToast({
          title: '删除成功',
          icon: 'success',
        })
      })
      .catch(err => {
        // console.error(err)
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        })
      })
  },

  // 上拉触底事件
  onReachBottom() {
    if (this.data.isReachBottom) {
      return
    }
    else {
      // 防抖
      this.setData({
        isReachBottom: true
      })
      // 获取数据
      wx.cloud.callFunction({
        name: 'getHistoryList',
        data: {
          skipNum: this.data.historyList.length
        }
      })
        .then(res => {
          var tempHistoryList = res.result.list
          if (tempHistoryList.length == 20)
            this.setData({
              isReachBottom: false
            })
          // console.log(tempHistoryList)

          tempHistoryList.forEach((i, idx) => {
            if (i.bookDetail.length === 0)
              // 将不存在的书籍统一化
              i.bookDetail = [{
                introduction: '非常抱歉，该书已被他人购买，现已下架',
                image_list: ['cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/imageDownloadFail.png'],
                name: '已下架',
                college: '无',
                major: '无',
              }]
            // 将浏览时间取前面日期（这里是ISO标准时间）
            i.view_time = i.view_time.slice(0, 10)
          })

          // 拼接数组
          this.data.historyList = [...this.data.historyList, ...tempHistoryList]

          this.setData({
            historyList: this.data.historyList,
            today: new Date().toISOString().slice(0, 10),
          })
        })
        .catch(err => console.error(err))
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
          icon: 'success',
          duration: 1000,
        })
        setTimeout(() => {
          wx.stopPullDownRefresh()
        }, 1000)
      })
  },

  // 获取scroll-view的高度
  // getScrollViewHeight() {
  //   const res = wx.getWindowInfo()
  //   this.setData({
  //     scrollViewHeight: res.windowHeight - 50
  //   })
  // },

})