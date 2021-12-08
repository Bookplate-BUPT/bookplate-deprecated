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
        price: event.price,
        original_price: event.originalPrice,
        name: event.name,
        isbn: event.isbn,
        description: event.description,
        introduction: event.introduction,
        image_list: event.imageList,
        state: 0,
        views: 0,
        favorites: 0,
        post_date: new Date(),
        book_publish_date: event.publishDate,
      }
    })
  }
  else
    return null
}