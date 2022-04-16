// pages/favorite/favorite.js

import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    favoriteList: '',
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

    this.getFavoriteList()
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

  // 获取已收藏的书籍
  async getFavoriteList() {
    // 获取收藏夹内的商品ID列表
    const goodsIdList = await wx.cloud.database().collection('favorite')
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

    // 将详细信息放入原商品ID列表
    const tempFavoriteList = goodsIdList.data.map((i, idx) => ({
      ...i,
      bookDetail: bookDetailList[idx].data[0],
    }))

    this.setData({
      favoriteList: tempFavoriteList,
    })

    console.log(this.data.favoriteList)
  },

  // 进入商品详情页
  goToBookDetail(event) {
    wx.navigateTo({
      url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
    })
  },

  // 将商品移除收藏夹
  deleteFavorite(event) {
    wx.cloud.database().collection('favorite')
      .doc(event.currentTarget.dataset.id)
      .remove()
      .then(res => {
        wx.showToast({
          title: '移除成功',
          icon: 'success',
        })

        let tempFavoriteList = this.data.favoriteList
        const index = this.data.favoriteList.findIndex(i => i._id === event.currentTarget.dataset.id)

        tempFavoriteList.splice(index, 1)

        this.setData({
          favoriteList: tempFavoriteList
        })
      })
      .catch(res => {
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        })
      })
  },

  // 添加商品到购物车
  addGoodsToCart(event) {
    // 查询用户购物车里是否已有此商品
    wx.cloud.database().collection('cart')
      .where({
        _openid: __user.getUserOpenid(),
        goods_id: event.currentTarget.dataset.id,
      })
      .get()
      .then(res => {
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
      })

  },
})