// pages/favorite/favorite.js

import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    historyList: '', // 总浏览历史记录
    nowHistoryList: '' // 当前浏览历史记录
  },

  onLoad() {
    // this.getFavoriteList()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })

    if (!this.data.userInfo || !this.data.userOpenid)
      this.setData({ showNoLoginPopup: true })

    this.getHistoryList()
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
    const goodsIdList = await wx.cloud.database().collection('history')
      .where({
        _openid: __user.getUserOpenid(),
      })
      .get()

    // 根据商品ID查询对应的商品详细信息
    const promiseArray = goodsIdList.data.map((i) => (
      wx.cloud.database().collection('goods')
        .where({
          _id: i.goods_id
        })
        .get()
    ))

    // 等到所有的查询线程结束后再继续进行
    const bookDetailList = await Promise.all(promiseArray)
    console.log('bookDetailList:',bookDetailList)

    // 将详细信息放入原商品ID列表
    const tempHistoryList = goodsIdList.data.map((i, idx) => ({
      ...i,
      bookDetail: bookDetailList[idx].data[0],
    }))

    this.setData({
      historyList: tempHistoryList,
      nowHistoryList: tempHistoryList.slice(0,7)
    })
  },

  // 进入商品详情页
  goToBookDetail(event) {
    wx.navigateTo({
      url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
    })
  },

  // 将商品移除浏览历史
  deleteHistory(event) {
    wx.cloud.database().collection('history')
      .doc(event.currentTarget.dataset.id)
      .remove()
      .then(res => {
        wx.showToast({
          title: '移除成功',
          icon: 'success',
        })

        let tempHistoryList = this.data.historyList
        const index = this.data.historyList.findIndex(i => i._id === event.currentTarget.dataset.id)

        tempHistoryList.splice(index, 1)

        this.setData({
          historyList: tempHistoryList
        })
      })
      .catch(res => {
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        })
      })
  },

  /**
   * 下拉触底事件
   */
  onReachBottom() {
    if(this.data.nowHistoryList.length === this.data.historyList.length)
      return
    var i = this.data.nowHistoryList.length
    this.setData({
      nowHistoryList: [...this.data.nowHistoryList, ...this.data.historyList.slice(i, i+7)]
    })
  }
})