// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()

  return await db.collection('trade').where({
    state: 1,
    state_one_time: _.lte(timeBeforeN(7)),
  })
    .update({
      data: {
        state: 2
      }
    })
}

/**
 * 取n天前的日期（默认为当前时间）
 * @param {number} N 天数
 */
function timeBeforeN(N) {
  if (!N) N = 0
  return new Date((new Date).getTime() - 86400000 * N)
}