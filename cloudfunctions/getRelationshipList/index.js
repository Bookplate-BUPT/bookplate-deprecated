// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  if (wxContext.OPENID !== event.openid) {
    return []
  }

  // 先拿到 user1 为自己，对方的用户数据
  result1 = await cloud.database().collection('relationship')
    .aggregate()
    .match({
      user1: event.openid,
      last_content: cloud.database().command.neq('')
    })
    .sort({
      last_conversation_time: -1
    })
    .lookup({
      from: 'users',
      localField: 'user2',
      foreignField: '_openid',
      as: 'userInfo',
    })
    .end()

  // 再拿到 user2 为自己，对方的用户数据
  result2 = await cloud.database().collection('relationship')
    .aggregate()
    .match({
      user2: event.openid,
      last_content: cloud.database().command.neq('')
    })
    .sort({
      last_conversation_time: -1
    })
    .lookup({
      from: 'users',
      localField: 'user1',
      foreignField: '_openid',
      as: 'userInfo',
    })
    .end()

  return result1.list.concat(result2.list)
}