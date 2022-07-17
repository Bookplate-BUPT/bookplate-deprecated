// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const currentOpenid = wxContext.OPENID

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
        grade: event.grade,
        state: event.state,
      }
    })
  }
  else
    return null
}