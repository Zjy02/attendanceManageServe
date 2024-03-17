const mongoose = require('mongoose')

const registrationSchema = mongoose.Schema({
  "userId": {
    type: Number,
    ref: 'users'
  },    //用户ID
  "today": {
    type: String,
    default: ''
  },
  "location": {
    type: Array,
    default: []
  }, //打卡位置
  "workStartTime": {
    type: String,
    default: ""
  },//上班卡
  "workEndTime": {
    type: String,
    default: ""
  }, //下班卡
  "extraTime": {
    type: Number,
    default: 0
  },
  "earlyTime": {
    type: Number,
    default: 0
  },
  "delayTime": {
    type: Number,
    default: 0
  },
  "isDelay": {
    type: Boolean,
    default: false
  }, //是否迟到
  "isEarly": {
    type: Boolean,
    default: false
  }, //是否早退
  "lateReason": {
    type: String,
    default: ""
  }, //迟到原因
  "earlyReason": {
    type: String,
    default: ""
  }, //早退原因
  "endLocationName": {
    type: String,
    default: ""
  },//上班签到地址
  "startLocationName": {
    type: String,
    default: ""
  },//下班签到地址
  "createTime": {
    type: Date,
    default: Date.now()
  },              //创建时间
  "lastLoginTime": {
    type: Date,
    default: Date.now()
  },              //更新时间
})

module.exports = mongoose.model("registration", registrationSchema, "registration") //第三个参数值集合的名称