// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境

const _ = cloud.database().command

const document = cloud.database().collection('displayInformation').doc('a31a2188640c118f0004ff3c056cd52b')

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.price < 5) {
    document.update({
      data: {
        '0-6': _.inc(event.num)
      }
    })
  } else if (event.price < 10) {
    document.update({
      data: {
        '6-10': _.inc(event.num)
      }
    })
  } else if (event.price < 15) {
    document.update({
      data: {
        '10-16': _.inc(event.num)
      }
    })
  } else if (event.price < 20) {
    document.update({
      data: {
        '16-20': _.inc(event.num)
      }
    })
  } else {
    document.update({
      data: {
        '20+': _.inc(event.num)
      }
    })
  }
}