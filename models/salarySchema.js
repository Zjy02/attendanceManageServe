const mongoose = require('mongoose')

const salarySchema = mongoose.Schema({
  "userId": {
    type: Number,
    ref: 'users'
  },    //用户ID
  "basicSalary": {
    type: Number,
    default: 0
  }, //底薪
  "lastSalary": {
    type: Number,
    default: 0
  }, //上月薪资
  "personalworkYears": {
    type: Number,
    default: 0
  }, //工作年限
  "allLeaveDays": {
    type: Number,
    default: 0
  }, //总请假天数
  "allExtraTime": {
    type: Number,
    default: 0
  },
  "createTime": {
    type: Date,
    default: Date.now()
  },              //创建时间
  "lastLoginTime": {
    type: Date,
    default: Date.now()
  },              //更新时间
  "remark": String, //备注
})

module.exports = mongoose.model("salarys", salarySchema, "salarys") //第三个参数值集合的名称