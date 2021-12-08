// pages/editUserInfo/editUserInfo.js
import __user from "../../utils/user"

const grade = {
  '大一': 0,
  '大二': 1,
  '大三': 2,
  '大四': 3,
  '研一': 4,
  '研二': 5,
  '研三': 6,
}

const school = {
  '信息与通信工程学院': 0,
  '电子工程学院': 1,
  '光电信息科学与工程': 2,
  '计算机学院': 3,
  '网络空间安全学院': 4,
  '人工智能学院': 5,
  '现代邮政学院': 6,
  '经济管理学院': 7,
  '理学院': 8,
  '人文学院': 9,
  '数字媒体与设计艺术学院': 10,
  '国际学院': 11,
}

Page({
  data: {
    userGrade: '',
    userSchool: '',
    columns: '',
  },

  onLoad() {
    this.setPickerColumns()
  },

  // 年级与学院picker的值发生改变时调用
  gradeAndSchoolChange(event) {
    this.setData({
      userGrade: event.detail.value[0],
      userSchool: event.detail.value[1],
    })
  },

  // 取用户的年级学院值，让picker的默认值设置为用户的值
  setPickerColumns() {
    wx.cloud.database().collection('users')
      .where({
        _openid: __user.getUserOpenid()
      })
      .get()
      .then(res => {
        this.setData({
          columns: [
            {
              values: ['大一', '大二', '大三', '大四', '研一', '研二', '研三'],
              defaultIndex: grade[res.data[0].grade],
            },
            {
              values: ['信息与通信工程学院', '电子工程学院', '光电信息科学与工程', '计算机学院', '网络空间安全学院', '人工智能学院', '现代邮政学院', '经济管理学院', '理学院', '人文学院', '数字媒体与设计艺术学院', '国际学院'],
              defaultIndex: school[res.data[0].school],
            },
          ],
        })
      })
  },

  // 确认编辑
  confirmEdit() {
    wx.cloud.database().collection('users')
      .where({
        _openid: __user.getUserOpenid()
      })
      .update({
        data: {
          grade: this.data.userGrade,
          school: this.data.userSchool,
        }
      })
      .then(res => {
        // 返回上一页面
        wx.navigateBack()
      })
  }
})