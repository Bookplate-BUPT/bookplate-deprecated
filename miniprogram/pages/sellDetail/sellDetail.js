// pages/sellDetail/sellDetail.js
Page({
  data: {
    identity: 0, // 身份标识，0表示未选，1表示卖家，2表示买家
    active: 0,   // 当前步骤
    sellerSteps: [
      {
        text: '步骤一',
        desc: '发布书籍',
      },
      {
        text: '步骤二',
        desc: '订单确认',
      },
      {
        text: '步骤三',
        desc: '买家收货',
      },
    ],
    buyerSteps: [
      {
        text: '步骤一',
        desc: '查找书籍',
      },
      {
        text: '步骤二',
        desc: '提交申请',
      },
      {
        text: '步骤三',
        desc: '确认收货',
      },
    ],
  },
  // 设置未卖家
  isSeller() {
    this.setData({
      identity: 1
    })
  },
  // 设置为买家
  isBuyer() {
    this.setData({
      identity: 2
    })
  },
  // 下一步
  gotoNextStep() {
    if (this.data.active === 2)
      wx.showModal({
        title: '警告',
        content: '当前已是最后一步，是否返回 ？',
        cancelColor: '#B4B4B4',
        confirmColor: '#8AC286',
      })
        .then(res => {
          if (res.confirm) {      // 点击确认
            this.setData({
              identity: 0,
              active: 0,
            })
          } else {                // 点击取消

          }
        })
    else
      this.setData({
        active: this.data.active + 1
      })
  },
  // 上一步
  gotoPreviousStep() {
    this.setData({
      active: this.data.active - 1
    })
  },
})