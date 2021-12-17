// pages/cart/cart.js
import __user from "../../utils/user"

const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    cartList: '',
  },

  onLoad() {
    this.getCartList()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })

    if (!this.data.userInfo || !this.data.userOpenid)
      this.setData({ showNoLoginPopup: true })

    this.getCartList()
  },

  onHide() {
    this.closeNoLoginPopup()
  },

  // 打开提示弹出层
  showNoLoginPopup() {
    this.setData({ showNoLoginPopup: true });
  },

  // 关闭提示弹出层
  closeNoLoginPopup() {
    this.setData({ showNoLoginPopup: false });
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

  // 获取购物车内的所有商品
  async getCartList() {
    // 获取购物车内的商品ID列表
    const goodsIdList = await wx.cloud.database().collection('cart')
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
    const tempCartList = goodsIdList.data.map((i, idx) => ({
      ...i,
      bookDetail: bookDetailList[idx].data[0],
    }))

    this.setData({
      cartList: tempCartList,
    })
  },

  // 进入商品详情页
  goToBookDetail(event) {
    wx.navigateTo({
      url: '../bookDetail/bookDetail?id=' + event.currentTarget.dataset.id,
    })
  },

  // 将商品移除购物车
  deleteGoods(event) {
    wx.cloud.database().collection('cart')
      .doc(event.currentTarget.dataset.id)
      .remove()
      .then(res => {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
        })

        let tempCartList = this.data.cartList
        const index = this.data.cartList.findIndex(i => i._id === event.currentTarget.dataset.id)

        tempCartList.splice(index, 1)

        this.setData({
          cartList: tempCartList
        })
      })
      .catch(res => {
        wx.showToast({
          title: '删除失败',
          icon: 'error',
        })
      })
  },


})