// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()

  result = await cloud.database().collection('users')
    .where({
      _openid: event.openid
    })
    .get()

  return {
    _openid: result.data[0]._openid,
    avatarUrl: result.data[0].avatarUrl,
    college: result.data[0].college,
    grade: result.data[0].grade,
    major: result.data[0].major,
    nickName: result.data[0].nickName,
  }
}