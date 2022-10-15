// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (!event.trade_price)
    switch (event.type) {
      case 1:
        return cloud.database().collection('trade').doc(event._id).update({
          data: {
            state: event.state,
            state_one_time: new Date(),
          }
        })
      case 2:
        return cloud.database().collection('trade').doc(event._id).update({
          data: {
            state: event.state,
            state_two_time: new Date(),
          }
        })
      case 3:
        return cloud.database().collection('trade').doc(event._id).update({
          data: {
            state: event.state,
            state_three_time: new Date(),
          }
        })
    }
  else
    switch (event.type) {
      case 1:
        return cloud.database().collection('trade').doc(event._id).update({
          data: {
            state: event.state,
            state_one_time: new Date(),
            trade_price: event.trade_price,
          }
        })
      case 2:
        return cloud.database().collection('trade').doc(event._id).update({
          data: {
            state: event.state,
            state_two_time: new Date(),
            trade_price: event.trade_price,
          }
        })
      case 3:
        return cloud.database().collection('trade').doc(event._id).update({
          data: {
            state: event.state,
            state_three_time: new Date(),
            trade_price: event.trade_price,
          }
        })
    }
}