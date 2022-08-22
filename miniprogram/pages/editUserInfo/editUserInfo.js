// pages/editUserInfo/editUserInfo.js
import __user from "../../utils/user"

const college = {
  未来学院: ['电子信息类（元班）', '计算机类（元班）', '通信工程', '电子科学与技术', '计算机科学与技术', '网路空间安全'],
  电子工程学院: ['电子信息类', '电子信息科学与技术', '电子科学与技术', '光电信息科学与工程'],
  信息与通信工程学院: ['通信工程（大类招生）', '通信工程', '电子信息工程', '空间信息与数字技术'],
  计算机学院: ['计算机类', '软件工程', '计算机科学与技术', '网络工程', '数据科学与大数据技术'],
  网络空间安全学院: ['网络空间安全（大类招生）', '网络空间安全', '信息安全', '密码科学与技术'],
  人工智能学院: ['人工智能（大类招生）', '信息工程', '人工智能', '自动化', '智能医学工程'],
  现代邮政学院: ['自动化类', '管理科学与工程类', '机械工程', '邮政工程', '电子商务', '邮政管理'],
  经济管理学院: ['大数据管理与应用金融科技', '工商管理类', '工商管理', '公共事业管理'],
  理学院: ['理科试验班', '数学与应用数学', '信息与计算科学', '应用物理学'],
  人文学院: ['英语', '日语', '法学'],
  数字媒体与设计艺术学院: ['智能交互设计', '数字媒体技术', '数字媒体艺术', '网络与新媒体'],
  国际学院: ['电信工程及管理', '物联网工程', '电子信息工程', '智能科学与技术'],
  北京邮电大学玛丽女王海南学院: ['信息与计算科学'],
};

Page({
  data: {
    userGrade: '2022级',    // 用户的年级
    userCollege: '',   // 用户的学院
    userMajor: '',    // 用户的专业
    gradeIndex: 0,
    show: false,
    columns: [
      {
        values: Object.keys(college),
        defaultIndex: 2,
      },
      {
        values: college['信息与通信工程学院'],
      },
    ],
    // 入学年级列表
    columnsYear: ['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022'],
  },

  onLoad() {

  },

  onShow() {
    this.getYourMessage()
  },

  // 打开入学年级弹出层
  selectYear() {
    this.setData({
      show: true
    })
  },

  // 关闭入学年级弹出层
  onClose() {
    this.setData({
      show: false
    })
  },

  // 获取用户的入学年级
  getYourYear(e) {
    this.setData({
      show: false,
      userGrade: e.detail.value
    })
  },

  getYourMessage() {
    wx.cloud.database().collection('users').where({
      _openid: __user.getUserOpenid()
    }).get()
      .then(res => {
        var gradeIndex = this.data.columnsYear.findIndex(i => i == res.data[0].grade)
        var collegeIndex = Object.keys(college).findIndex(i => i === res.data[0].college)
        var majorIndex = college[res.data[0].college].findIndex(i => i === res.data[0].major)
        this.setData({
          userGrade: res.data[0].grade,
          gradeIndex: gradeIndex,
          columns: [
            {
              values: Object.keys(college),
              defaultIndex: collegeIndex,
            },
            {
              values: college[res.data[0].college],
            },
          ],
        })
        setTimeout(() => {
          this.setData({
            'columns[1].defaultIndex': majorIndex
          })
        }, 400)
      })

  },

  // 当学院改变时，专业随之发生变化
  changeUserInfoInSchool(event) {
    const { picker, value } = event.detail;
    picker.setColumnValues(1, college[value[0]]);
  },

  // 确认编辑
  confirmEdit() {
    var tempMessage = this.selectComponent('#identity').getValues()
    this.setData({
      userCollege: tempMessage[0],
      userMajor: tempMessage[1],
    })
    wx.cloud.database().collection('users')
      .where({
        _openid: __user.getUserOpenid()
      })
      .update({
        data: {
          grade: this.data.userGrade,
          college: this.data.userCollege,
          major: this.data.userMajor,
        }
      })
      .then(res => {
        // 返回上一页面
        wx.redirectTo({
          url: '../mine/mine',
        })
      })
  }
})