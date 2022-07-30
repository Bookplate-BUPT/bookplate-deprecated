// pages/cart/cart.js
import user from "../../utils/user";
import __user from "../../utils/user"
import __util from "../../utils/util"

const app = getApp();

Page({
  data: {
    userInfo: '',
    userOpenid: '',
    showNoLoginPopup: false,
    cartList: '',
    nowCartList: '',
    cartSum: '',
  },

  onLoad() {
    // this.getCartList()
  },

  onShow() {
    this.setData({
      userInfo: app.globalData.userInfo,
      userOpenid: app.globalData.userOpenid,
    })
    this.getCartSum()

    if (!__user.checkLoginStatus())
      this.setData({ showNoLoginPopup: true })
    else
      this.getCartList()
  },

  onHide() {
    this.closeNoLoginPopup()
    this.setData({
      cartList: '',
    })
  },

  // 上拉触底监听
  onReachBottom() {
    var res = __util.reachBottom('cart', this.data.cartSum, this.data.cartList, this.data.nowCartList, 'own')
    if (res == undefined) return
    this.setData({
      cartList: res.list,
      nowCartList: res.nowList,
    })
  },

  // 获取购物车总商品量
  getCartSum() {
    wx.cloud.database().collection('cart').where({
      _openid: __user.getUserOpenid()
    }).count().then(res => {
      this.setData({
        cartSum: res.total
      })
    })
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
      nowCartList: tempCartList.slice(0, 10),
    })
  },

  // 将商品移除购物车
  deleteGoods(event) {
    let tempCartList = this.data.nowCartList
    const index = this.data.nowCartList.findIndex(i => i._id === event.detail._id)

    tempCartList.splice(index, 1)

    this.setData({
      nowCartList: tempCartList,
      cartList: tempCartList
    })
  }
})