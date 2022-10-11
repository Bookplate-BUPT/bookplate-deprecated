// pages/bookDetail/bookDetail.js
import __user from "../../utils/user"
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

const app = getApp();

Page({
  data: {
    goodsID: '',
    bookDetail: '',
    sellerDetail: '',
    isExisted: false,
    numOfUserCartGoods: '',
    eventID: '',
    textShowState: '',   // 前后端状态显示控制
    textDiffShow: '',    // 控制文案的显示
  },

  // 跳转至发起交易页面
  gotoLaunchTrade() {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else if (this.data.bookDetail.state == 1) {
      wx.cloud.database().collection('trade').where({
        goods_id: this.data.bookDetail._id,
        buyer_openid: __user.getUserOpenid()
      }).count().then(res => {
        if (res.total) {
          wx.cloud.callFunction({
            name: 'updateGoods',
            data: {
              type: 'updateState',
              goodsID: this.data.bookDetail._id,
              state: 0,
            }
          }).then(resner => {
            this.data.bookDetail.state = 0
            this.setData({
              textShowState: 0,
              textDiffShow: '我想要'
            })
            wx.cloud.database().collection('trade').where({
              goods_id: this.data.bookDetail._id,
              buyer_openid: __user.getUserOpenid()
            }).remove()
          })
          wx.showToast({
            title: '已取消预订',
            icon: 'success'
          })
        }
      })
    } else if (this.data.bookDetail._openid == __user.getUserOpenid()) {
      wx.showToast({
        title: '不能购买自己的商品',
        icon: 'none'
      })
    } else {
      // 跳转前对图片中的url进行编码
      var bookDetail = this.data.bookDetail
      bookDetail.image_list.forEach((i, idx) => {
        bookDetail.image_list[idx] = encodeURIComponent(i)
      })
      // 跳转至新页面
      wx.navigateTo({
        url: `../launchTrade/launchTrade?bookDetail=${JSON.stringify(bookDetail)}&sellerDetail=${JSON.stringify(this.data.sellerDetail)}`,
      })
    }
  },

  /**
   * 刷新首页
   * @param {number} 书籍的_id
   * @param {number} 需要删除书籍的索引
   * @returns 无返回值
   */
  refreshMainPage(goods_id, index) {
    wx.cloud.database().collection('goods')
      .where({
        _id: goods_id
      })
      .count()
      .then(res => {
        if (!res.total) {
          // 获取当前页面栈
          const pages = getCurrentPages();
          // 获取上一页面对象
          let prePage = pages[pages.length - 2];

          prePage.data.goodsList.splice(index, 1)
          prePage.setData({
            goodsList: prePage.data.goodsList
          })
          wx.showToast({
            title: '该书籍已被购买，建议返回首页下拉刷新',
            icon: 'none',
            duration: 2000
          })
          setTimeout(res => wx.navigateBack(), 2000)
        }
      })
  },

  onLoad(options) {
    this.setData({
      goodsID: options.id,
    })

    if (options.isMainPage == "true")
      this.refreshMainPage(options.id, options.deleteBookIndex)

    // 商品被浏览量加1
    wx.cloud.database().collection('goods')
      .doc(options.id)
      .update({
        data: {
          views: wx.cloud.database().command.inc(1)
        }
      })

    this.getBookDetail()

  },

  onShow() {
    this.checkcartStatus()
  },

  // 获取书籍详细信息
  getBookDetail() {
    wx.cloud.database().collection('goods')
      .doc(this.data.goodsID)
      .get()
      .then(res => {
        if (res.data.state) {
          wx.cloud.database().collection('trade').where({
            goods_id: this.data.goodsID,
            buyer_openid: __user.getUserOpenid()
          }).count().then(resner => {
            if (resner.total) {
              this.setData({
                bookDetail: res.data,
                trade_price: res.data.price,
                textShowState: res.data.state,
                textDiffShow: '取消预订'
              })
            } else {
              this.setData({
                bookDetail: res.data,
                trade_price: res.data.price,
                textShowState: res.data.state,
                textDiffShow: '已被预订'
              })
            }
          })
        } else {
          this.setData({
            bookDetail: res.data,
            trade_price: res.data.price,
            textShowState: res.data.state,
            textDiffShow: '我想要'
          })
        }

        // 获取卖家详细信息
        wx.cloud.callFunction({
          name: 'getUserPublicInfo',
          data: {
            openid: res.data._openid
          }
        }).then(res => {
          this.setData({
            sellerDetail: res.result
          })
        })
      })
  },

  // 获取用户购物车内商品总数 - 已无用
  // getNumOfUserCartGoods() {
  //   // 如果没登录则直接返回
  //   if (!__user.checkLoginStatus()) return

  //   wx.cloud.database().collection('cart')
  //     .where({
  //       _openid: app.globalData.userOpenid
  //     })
  //     .get()
  //     .then(res => {
  //       this.setData({
  //         numOfUserCartGoods: res.data.length
  //       })
  //     })
  // },

  // 前往购物车页面 
  // gotoCart() {
  //   wx.switchTab({
  //     url: '../cart/cart',
  //   })
  // },

  // 判断商品收藏状态，以控制收藏图标的状态 
  checkcartStatus() {
    // 如果没登录的话直接设为未收藏 
    if (!__user.checkLoginStatus()) {
      this.setData({
        isExisted: false
      })
    } else {
      wx.cloud.database().collection('cart')
        .where({
          goods_id: this.data.goodsID,
          _openid: __user.getUserOpenid()
        })
        .get()
        .then(res => {
          if (res.data.length === 1) {
            this.setData({
              isExisted: true
            })
          } else {
            this.setData({
              isExisted: false
            })
          }
        })
    }
  },

  // 添加商品到收藏
  addGoodsToCart(event) {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else {
      // 不允许添加自己的商品进收藏
      if (this.data.bookDetail._openid === __user.getUserOpenid()) {
        wx.showToast({
          title: '不能添加自己的商品进收藏',
          icon: 'none',
        })
      } else {
        if (event.currentTarget.dataset.state == 1) {
          this.lockedGoodsConfirm()
        } else {
          // 查询用户收藏里是否已有此商品
          wx.cloud.database().collection('cart')
            .where({
              _openid: __user.getUserOpenid(),
              goods_id: this.data.goodsID,
            })
            .get()
            .then(res => {
              // 如果已经收藏此商品，则需要取消收藏 
              if (res.data.length === 1) {
                wx.cloud.database().collection('cart')
                  .doc(res.data[0]._id)
                  .remove()
                  .then(res => {
                    this.setData({
                      isExisted: false
                    })
                    wx.showToast({
                      title: '已取消收藏',
                      icon: 'success'
                    })
                  })
              }
              // 收藏此商品 
              else {
                wx.cloud.database().collection('cart')
                  .add({
                    data: {
                      goods_id: this.data.goodsID,
                      add_time: new Date()
                    }
                  })
                  .then(res => {
                    this.setData({
                      isExisted: true
                    })
                    wx.showToast({
                      title: '收藏成功',
                      icon: 'success'
                    })
                  })
              }
            })
        }
      }
    }
  },

  // 商品被锁定时加入购物车的确认
  lockedGoodsConfirm() {
    // 查询用户收藏里是否已有此商品
    wx.cloud.database().collection('cart')
      .where({
        _openid: __user.getUserOpenid(),
        goods_id: this.data.goodsID,
      })
      .get()
      .then(res => {
        // 如果已经收藏此商品，则需要取消收藏 
        if (res.data.length === 1) {
          wx.cloud.database().collection('cart')
            .doc(res.data[0]._id)
            .remove()
            .then(res => {
              this.setData({
                isExisted: false
              })
              wx.showToast({
                title: '已取消收藏',
                icon: 'success'
              })
            })
        }
        // 收藏此商品 
        else {
          Dialog.confirm({
            title: '确定加入收藏吗？',
            message: '该书籍目前已被预定，被购买后将下架',
            closeOnClickOverlay: true,
          })
            .then(res => {
              wx.cloud.database().collection('cart')
                .add({
                  data: {
                    goods_id: this.data.goodsID,
                    add_time: new Date()
                  }
                })
                .then(res => {
                  this.setData({
                    isExisted: true
                  })
                  wx.showToast({
                    title: '添加成功',
                    icon: 'success'
                  })
                })
            })
        }
      })
  },

  // 联系卖家
  contactSeller() {
    if (!__user.checkLoginStatus()) {
      wx.showToast({
        title: '请先登录',
        icon: 'error',
      })
    } else if (this.data.bookDetail._openid === app.globalData.userOpenid) {
      wx.showToast({
        title: '无法联系自己',
        icon: 'error',
      })
    } else {
      wx.navigateTo({
        url: '../chatroom/chatroom?otherid=' + this.data.bookDetail._openid,
      })
    }
  },

  // 点击轮播图片可以进行预览
  preview(e) {
    var image_list = this.data.bookDetail.image_list
    wx.previewImage({
      urls: image_list,
      showmenu: true,
      current: image_list[e.currentTarget.dataset.index],
    })
  },
})