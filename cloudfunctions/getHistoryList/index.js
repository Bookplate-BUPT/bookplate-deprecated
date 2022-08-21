// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  const db = cloud.database()
  return db.collection('history')
    .aggregate()
    .match({
      _openid: wxContext.OPENID
    })
    .sort({
      view_time: -1
    })
    .skip(event.skipNum)
    .limit(20)
    .lookup({
      from: 'goods',
      localField: 'goods_id',
      foreignField: '_id',
      as: 'bookDetail',
    })
    .end()
}