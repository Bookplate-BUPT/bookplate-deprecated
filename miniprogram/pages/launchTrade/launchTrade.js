// pages/launchTrade/launchTrade.js
import Dialog from '../../miniprogram_npm/@vant/weapp/dialog/dialog';

import __util from "../../utils/util"
import __user from "../../utils/user"

const beforeClose = (action) => new Promise((resolve) => {
  if (action === 'confirm') {
    //获取当前页面栈
    const pages = getCurrentPages();
    //获取上一页面对象
    let prePage = pages[pages.length - 2];
    prePage.setData({
      'bookDetail.state': 1,
      textShowState: 1,
      textDiffShow: '取消预订'
    })
    wx.navigateBack()
    resolve(true);
  } else {
    // 拦截取消操作
    resolve(false);
  }
});

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookDetail: {},       // 书籍详细信息
    sellerDetail: {},     // 卖家详细信息
    // trade_date: '',       // 交易日期
    // trade_time: '',       // 交易时间
    // trade_spot: '',       // 交易地点
    contactInformation: '',  // 买家联系方式

    // originalTradeDate: '',        // 原本格式的交易日期
    // originalTradeTime: '',        // 原本格式的日期时间

    // showCalendar: false,  // 显示日期弹出层
    // showTime: false,      // 显示时间弹出层

    // 时间选择的过滤器
    // filter(type, options) {
    //   if (type === 'minute') {
    //     return options.filter((option) => option % 10 === 0);
    //   }

    //   return options;
    // },
  },

  // 循环解析url
  getUrl(url) {
    if (url.indexOf('%') < 0) {
      return url
    } else {
      const newUrl = decodeURIComponent(url)
      return this.getUrl(newUrl)
    }
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    // 首先对url进行解码
    var bookDetail = JSON.parse(options.bookDetail)
    bookDetail.image_list.forEach((i, idx) => {
      bookDetail.image_list[idx] = this.getUrl(i)
    })
    this.setData({
      bookDetail: bookDetail,
      sellerDetail: JSON.parse(options.sellerDetail),
      // originalTradeDate: new Date(),
      // trade_date: `${new Date().getFullYear()}年 ${new Date().getMonth() + 1}月${new Date().getDate()}日`,
      // trade_time: __util.formatTime(new Date()).slice(11, 16),
    })
  },

  // 打开日期弹出层
  // displayCalendar() {
  //   this.setData({ showCalendar: true });
  // },

  // 关闭日期弹出层
  // closeCalendar() {
  //   this.setData({ showCalendar: false });
  // },

  // 格式化日期
  // formatDate(date) {
  //   date = new Date(date);
  //   return `${date.getFullYear()}年 ${date.getMonth() + 1}月${date.getDate()}日`;
  // },

  // 确认选择日期
  // confirmCalendar(event) {
  //   this.setData({
  //     showCalendar: false,
  //     trade_date: this.formatDate(event.detail),
  //     originalTradeDate: new Date(event.detail),
  //   });
  // },

  // 填写现价
  // onChangeTradePrice(e) {
  //   this.setData({
  //     'bookDetail.price': e.detail
  //   })
  // },

  // 填写交易地点
  // onChangeTradeSpot(e) {
  //   this.setData({
  //     trade_spot: e.detail
  //   })
  // },

  // 显示时间弹出层
  // displayTime() {
  //   this.setData({
  //     showTime: true
  //   })
  // },

  // 关闭时间弹出层
  // closeTime() {
  //   this.setData({
  //     showTime: false
  //   })
  // },

  // 确认选择时间
  // confirmTime(e) {
  //   this.setData({
  //     trade_time: e.detail,
  //     showTime: false
  //   })
  // },

  // 确认提交交易信息
  commitForm(event) {
    wx.showLoading({
      title: '提交中…',
    })
    wx.cloud.database().collection('trade').where({
      goods_id: this.data.bookDetail._id,
    }).get().then(res => {
      if (res.data.length) {
        if (res.data.some(i => { return i.state == 0 })) {
          wx.showToast({
            title: '该书已被预订',
            icon: 'error'
          }).then(res => {
            setTimeout(() => {
              //获取当前页面栈
              const pages = getCurrentPages();
              //获取上一页面对象
              let prePage = pages[pages.length - 2];
              prePage.setData({
                'bookDetail.state': 1
              })
              wx.navigateBack({
                delta: 1,
              })
            }, 1500)
          })
        } else {
          this.addTradeRecord()
        }
      } else {
        this.addTradeRecord()
      }
    })
  },

  // 向trade集合中添加记录
  addTradeRecord() {
    // 连接完整的交易时间
    // var time = this.data.trade_time
    // this.data.originalTradeDate.setHours(+(time.slice(0, 2)))
    // this.data.originalTradeDate.setMinutes(+(time.slice(3, 5)))

    var bookDetail = this.data.bookDetail
    delete bookDetail.views

    wx.cloud.database().collection('trade').add({
      data: {
        goods_id: this.data.bookDetail._id,
        state: 0,
        trade_price: this.data.bookDetail.price,
        // trade_time: this.data.originalTradeDate,
        trade_spot: this.data.trade_spot,
        seller_openid: this.data.bookDetail._openid,
        bookDetail: bookDetail,
        state_zero_time: new Date(),
        buyer_openid: __user.getUserOpenid(),
        contact_information: this.data.contactInformation,
      }
    }).then(res => {
      // 调用云函数修改数据库
      wx.cloud.callFunction({
        name: 'updateGoods',
        data: {
          type: 'updateState',
          goodsID: this.data.bookDetail._id,
          state: 1,
        }
      })
        .then(res => {
          var that = this
          wx.hideLoading()
          // 弹出提示点击确认后返回页面
          Dialog.alert({
            title: '提示',
            message: that.data.bookDetail.contact_information ? '卖家备注：' + that.data.bookDetail.contact_information + "\n下次查看可到'我买到的'页面查看\n(成交后备注将不会显示)" : "卖家暂没有留下备注",
            beforeClose,
          })
            .then()
            .catch()
        })
    })
  },

  // 点击轮播图片可以进行预览
  preview(e) {
    let image_list = this.data.bookDetail.image_list
    wx.previewImage({
      urls: image_list,
      current: image_list[e.currentTarget.dataset.index]
    })
  },
})