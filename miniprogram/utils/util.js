const app = getApp();

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

// 自定义时间戳转成时间，形式如下
// x月x日 hh:mm
const newFormatTime = (date) => {
  return (date.getMonth() + 1) + '月' + date.getDate() + '日 ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
}

// 获取书籍内容格式化后的字数
const getFormatLength = (nearWidth, fontSize, line) => {
  var res = wx.getWindowInfo()
  return parseInt((res.screenWidth - nearWidth) / fontSize * line - 2)
}

/**
 * 格式化
 * @param {string} str 需要格式化的内容
 * @param {number} nearWidth 旁边的组件宽度
 * @param {number} fontSize 字体大小，单位为像素
 */
const format = (str, nearWidth, fontSize, line) => {
  const length = getFormatLength(nearWidth, fontSize, line)
  // 过长则需要省略
  if (str.length > length) {
    return str.substr(0, length) + '……'
  }
  // 不用格式化
  else return str
}

module.exports = {
  formatTime,
  newFormatTime,
  format,
}

