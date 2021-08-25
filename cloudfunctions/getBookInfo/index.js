// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

var rp = require('request-promise')

exports.main = async (event, context) => {

  var res = rp('https://api.douban.com/v2/book/isbn/' + event.isbn)
  .then(html => {
    return html
  }).catch(err => {
    console.log(err)
  })

  return res
}