const app = getApp();

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

function reachBottom(name, sum, list, nowList, type, state) {
  var length = list.length
  var nowLength = nowList.length
  if (nowLength < sum) {
    if (nowLength === length) {
      switch (type) {
        case 'collection':
          wx.cloud.database().collection(name).skip(nowLength).limit(20).get().then(res => {
            var tempGoodsList = res.data // 新的数据

            list = [...list, ...tempGoodsList] // 拼接数组
            list = [...list, ...tempGoodsList.slice(0, 10)] // 拼接数组

            // 更新页面
            return {
              nowList: nowList,
              list: list
            }
          })
        case 'own':
          wx.cloud.database().collection(name).where({
            _openid: app.globalData.userOpenid
          }).skip(nowLength).limit(20).get().then(res => {
            var tempGoodsList = res.data // 新的数据

            list = [...list, ...tempGoodsList] // 拼接数组
            list = [...list, ...tempGoodsList.slice(0, 10)] // 拼接数组

            // 更新页面
            return {
              nowList: nowList,
              list: list
            }
          })
        case 'seller':
          if (state == undefined) {
            wx.cloud.database().collection(name).where({
              seller_openid: app.globalData.userOpenid,
            }).skip(nowLength).limit(20).get().then(res => {
              var tempGoodsList = res.data // 新的数据

              list = [...list, ...tempGoodsList] // 拼接数组
              list = [...list, ...tempGoodsList.slice(0, 10)] // 拼接数组

              // 更新页面
              return {
                nowList: nowList,
                list: list
              }
            })
          } else {
            wx.cloud.database().collection(name).where({
              seller_openid: app.globalData.userOpenid,
              state: state
            }).skip(nowLength).limit(20).get().then(res => {
              var tempGoodsList = res.data // 新的数据

              list = [...list, ...tempGoodsList] // 拼接数组
              list = [...list, ...tempGoodsList.slice(0, 10)] // 拼接数组

              // 更新页面
              return {
                nowList: nowList,
                list: list
              }
            })
          }
      }
    } else {
      nowList = [...nowList, ...list.slice(nowLength, nowLength + 10)]//拼接数组

      // 更新页面
      return ({
        list: list,
        nowList: nowList
      })
    }
  }
}

module.exports = {
  reachBottom: reachBottom,
  formatTime
}

