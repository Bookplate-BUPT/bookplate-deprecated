// pages/message/message.js

/**
 *
 * 你也是可以单独将自定义的文本放到一个js文件当中,通过export的方式导出来,在想要使用的地方引入进去也是可以的
 */
const g_reg = /操|杀|贱|傻|疯|炮|奸|猪|笨|屁|麻痹|滚犊子|婊/gm
 
 
// pages/msgSecCheck/msgSecCheck.js
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    textareaVal: '',
    hasSensitiveWords: ''
  },
  // 监听表单时,数据有变化时
  onInput(event) {
    let textVal = event.detail.value;
    this.setData({
      textareaVal: textVal
    })
 
  },
 
  // 聚焦焦点时
  onFocus() {
    console.log('聚焦焦点时');
  },
 
  // 失去焦点时
  onBlur(event) {
    console.log("失去焦点时");
    // 前端可进行手动的弱校验,也可以在失去焦点时发送请求进行文本的校验,但是每次失去焦点就请求一次,这样是消耗云资源的,其实在发布时候与失去焦点做校验两者都可以
    const textVal = event.detail.value;
    if (this._hasSensitiveWords(textVal)) {
      wx.showToast({
        title: '含有敏感词,敏感词将会用***号处理',
      })
      this.setData({
        hasSensitiveWords: textVal.replace(g_reg, "***")
      })
      console.log(this.data.textareaVal);
    } else {
      this.setData({
        hasSensitiveWords: textVal
      })
      console.log(this.data.textareaVal);
    }
 
  },
 
  // 发布
  send() {
    // 请求msgSecCheck1云函数,对文本内容进行校验
    this._requestCloudMsgCheck();
  },
 
  _requestCloudMsgCheck() {
    let textareaVal = this.data.textareaVal;
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