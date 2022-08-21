// pages/launchTrade/launchTrade.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookDetail: {},       // 书籍详细信息
    sellerDetail: {},     // 卖家详细信息
    trade_date: '',       // 交易日期
    trade_time: '',       // 交易时间
    trade_spot: '',       // 交易地点

    showCalendar: false,  // 显示日期弹出层
    showTime: false,      // 显示时间弹出层

    // 时间选择的过滤器
    filter(type, options) {
      if (type === 'minute') {
        return options.filter((option) => option % 10 === 0);
      }

      return options;
    },
  },

  // 生命周期函数--监听页面加载
  onLoad(options) {
    this.setData({
      bookDetail: JSON.parse(options.bookDetail),
      sellerDetail: JSON.parse(options.sellerDetail),
      trade_date: `${new Date().getFullYear()}年 ${new Date().getMonth() + 1}月${new Date().getDate()}日`,
      trade_time: new Date().toISOString().slice(11, 16),
    })

    console.log(options.sellerDetail)

  },

  // 打开日期弹出层
  displayCalendar() {
    this.setData({ showCalendar: true });
  },

  // 关闭日期弹出层
  closeCalendar() {
    this.setData({ showCalendar: false });
  },

  // 格式化日期
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}年 ${date.getMonth() + 1}月${date.getDate()}日`;
  },

  // 确认选择日期
  confirmCalendar(event) {
    this.setData({
      showCalendar: false,
      trade_date: this.formatDate(event.detail),
    });
  },

  // 填写现价
  onChangeTradePrice(e) {
    this.setData({
      'bookDetail.price': e.detail
    })
  },

  // 填写交易地点
  onChangeTradeSpot(e) {
    this.setData({
      trade_spot: e.detail
    })
  },

  // 显示时间弹出层
  displayTime() {
    this.setData({
      showTime: true
    })
  },

  // 关闭时间弹出层
  closeTime() {
    this.setData({
      showTime: false
    })
  },

  // 确认选择时间
  confirmTime(e) {
    this.setData({
      trade_time: e.detail,
      showTime: false
    })
  },

  // 确认提交交易信息
  commitForm(event) {
    if (!this.data.bookDetail.price) {
      wx.showToast({
        title: '现价不能为空',
        icon: 'error'
      })
    }
    else if (!this.data.trade_spot) {
      wx.showToast({
        title: '地点不能为空',
        icon: 'error'
      })
    }
    else {
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
    }
  },

  // 向trade集合中添加记录
  addTradeRecord() {
    // 连接完整的交易时间
    var trade_time = this.data.trade_date + this.data.trade_time

    this.data.bookDetail.image_list.forEach((i, idx) => {
      if (i === 'cloud://qqk-4gjankm535f1a524.7171-qqk-4gjankm535f1a524-1306811448/undefined.jpg') {
        this.data.bookDetail.image_list.splice(idx, 1)
      }
    })
    wx.cloud.database().collection('trade').add({
      data: {
        goods_id: this.data.bookDetail._id,
        state: 0,
        trade_price: this.data.bookDetail.price,
        trade_time: trade_time,
        trade_spot: this.data.trade_spot,
        original_price: this.data.bookDetail.original_price,
        seller_openid: this.data.bookDetail._openid,
        grade: this.data.bookDetail.grade,
        college: this.data.bookDetail.college,
        name: this.data.bookDetail.name,
        isbn: this.data.bookDetail.isbn,
        image_list: this.data.bookDetail.image_list,
      }
    }).then(res => {
      wx.showToast({
        title: '交易请求已发送',
        icon: 'success'
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
          })
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