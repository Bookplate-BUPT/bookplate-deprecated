// pages/editUserInfo/editUserInfo.js
import __user from "../../utils/user"

const college = {
  未来学院: ['电子信息类（元班）','计算机类（元班）','通信工程','电子科学与技术','计算机科学与技术','网路空间安全'],
  信息与通信工程学院: ['通信工程（大类招生）','通信工程','电子信息工程','空间信息与数字技术'],
  电子工程学院: ['电子信息类','电子信息科学与技术','电子科学与技术','光电信息科学与工程'],
  计算机学院: ['计算机类','软件工程','计算机科学与技术','网络工程','数据科学与大数据技术'],
  网络空间安全学院: ['网络空间安全（大类招生）','网络空间安全','信息安全','密码科学与技术'],
  人工智能学院: ['人工智能（大类招生）','信息工程','人工智能','自动化','智能医学工程'],
  现代邮政学院: ['自动化类','管理科学与工程类','机械工程', '邮政工程','电子商务','邮政管理'],
  经济管理学院: ['大数据管理与应用金融科技','工商管理类','工商管理','公共事业管理'],
  理学院: ['理科试验班','数学与应用数学','信息与计算科学','应用物理学'],
  人文学院: ['英语','日语','法学'],
  数字媒体与设计艺术学院: ['智能交互设计','数字媒体技术','数字媒体艺术','网络与新媒体'],
  国际学院: ['电信工程及管理','物联网工程','电子信息工程','智能科学与技术'],
  北京邮电大学玛丽女王海南学院: ['信息与计算科学'],
};

Page({
  data: {
    userGrade: '',    // 用户的届数
    userCollege: '',   // 用户的学院
    userMajor: '',    // 用户的专业
    columns: [
      {
        values: ['2011届', '2012届', '2013届', '2014届', '2015届', '2016届', '2017届', '2018届', '2019届', '2020届', '2021届', '2022届'],
      },
      {
        values: Object.keys(college),
      },
      {
        values: college['未来学院'],
      },
    ],
  },

  onLoad() {

  },

  onShow() {

  },

  // 当学院改变时，专业随之发生变化
  changeUserInfoInSchool(event) {
    const { picker, value, index } = event.detail;
    picker.setColumnValues(2, college[value[1]]);
  },

  // 确认编辑
  confirmEdit() {
    var tempMessage = this.selectComponent('#identity').getValues()
    this.setData({
      userGrade: tempMessage[0],
      userCollege: tempMessage[1],
      userMajor: tempMessage[2],
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
        wx.navigateBack()
      })
  }
})