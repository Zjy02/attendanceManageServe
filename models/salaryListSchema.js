const dayjs = require('dayjs')
const mongoose = require('mongoose')

const salaryListSchema = mongoose.Schema({
  "userId": Number,    //用户ID
  "examineDate": {
    type: String,
    default: dayjs().format('YYYY/MM')
  }, //考核年月份
  "penalty": {
    type: Number,
    default: 0
  }, //罚款
  "realName": {
    type: String,
    default: ""
  },
  "realWorkDays": {
    type: Number,
    default: 0
  }, //当月实际工作天数
  "realSalary": {
    type: Number,
    default: 0
  }, //实际薪资
  "bonus": {
    type: Number,
    default: 0
  }, //当月奖金
  "basicSalary": {
    type: Number,
    default: 0
  }, //底薪
  "leaveDays": {
    type: Number,
    default: 0
  },//当月请假天数
  "tax": {
    type: Number,
    default: 0
  }, //税务
  "createTime": {
    type: Date,
    default: Date.now()
  },              //创建时间
  "lastLoginTime": {
    type: Date,
    default: Date.now()
  },              //更新时间
  "remark": {
    type: String,
    default: ""
  },//备注
  "punishmentDescribe": {
    type: String,
    default: ""
  },//罚款说明
})

module.exports = mongoose.model("salary_list", salaryListSchema, "salary_list") //第三个参数值集合的名称