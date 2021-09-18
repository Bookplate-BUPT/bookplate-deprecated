// pages/message/message.js

/**
 *
 * 你也是可以单独将自定义的文本放到一个js文件当中,通过export的方式导出来,在想要使用的地方引入进去也是可以的
 */
const g_reg = /aaaaaa|bbbbbb/gm

Page({

  data: {
    textareaValue: '',
    hasSensitiveWords: ''
  },

  // 监听表单时,数据有变化时
  onInput(event) {
    let textVal = event.detail.value;
    this.setData({
      textareaValue: textVal
    })
  },

  // 失去焦点时
  onBlur(event) {
    // 前端可进行手动的弱校验,也可以在失去焦点时发送请求进行文本的校验,但是每次失去焦点就请求一次,这样是消耗云资源的,其实在发布时候与失去焦点做校验两者都可以
    const textVal = event.detail.value;
    if (this._hasSensitiveWords(textVal)) {
      wx.showToast({
        title: '含有敏感词！',
      })
      this.setData({
        hasSensitiveWords: textVal.replace(g_reg, "***")
      })
      console.log(this.data.textareaValue);
    } else {
      this.setData({
        hasSensitiveWords: textVal
      })
      console.log(this.data.textareaValue);
    }
  },

  // 发布
  send() {
    // 请求msgSecCheck1云函数,对文本内容进行校验
    this._requestCloudMsgCheck();
  },

  _requestCloudMsgCheck() {
    let textareaVal = this.data.textareaValue;
    wx.cloud.callFunction({
      name: 'msgSecCheck2',
      data: {
        content: textareaVal
      }
    }).then(res => {
      console.log(res);
    }).catch(err => {
      // 失败时,也就是违规做一些用户提示,或者禁止下一步操作等之类的业务逻辑操作
      console.error(err);
    })
  },

  // 手动对敏感词检测
  _hasSensitiveWords(str) {
    if (str == '' || str == 'undefined') return false;
    if (g_reg.test(str)) { // 如果检测有违规,就返回true
      return true;
    }
  }
})