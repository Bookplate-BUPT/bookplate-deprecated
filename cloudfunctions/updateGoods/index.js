// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  switch (event.type) {
    case 'updateState': return cloud.database().collection('goods').doc(event.goodsID).update({
      data: {
        state: event.state
      }
    })
    case 'removeGoods': return cloud.database().collection('goods').doc(event.goodsID).remove()
  }

}