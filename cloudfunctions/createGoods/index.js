// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const currentOpenid = wxContext.OPENID

  // 对event中不存在的数据进行处理
  if(event.trade_spot==undefined)             event.trade_spot = ''
  if(event.contact_information == undefined)  event.contact_information = ''

  if (currentOpenid === event.openid) {
    return cloud.database().collection('goods').add({
      data: {
        _openid: currentOpenid,
        author: event.author,
        price: event.price,
        original_price: event.originalPrice,
        name: event.name,
        isbn: event.isbn,
        description: event.description,
        introduction: event.introduction,
        image_list: event.imageList,
        views: 0,
        post_date: new Date(),
        publisher: event.publisher,
        book_publish_date: event.publishDate,
        major: event.major,
        college: event.college,
        trade_spot: event.trade_spot,
        contact_information: event.contact_information,
        state: event.state,
      }
    })
  }
  else
    return null
}