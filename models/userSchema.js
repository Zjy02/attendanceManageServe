const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    "userId": Number,    //用户ID 自增长
    "userName": String,  // 用户名称
    "realName": String,
    "avatar": String,
    "userPwd": String,   //用户密码 md5加密
    "userEmail": String, //用户邮箱
    "mobile": String,    // 手机号
    "sex": Number,       //性别 男：0 女：1
    "deptId": [],        //部门
    "job": String,       //岗位
    "age": Number,       //年龄
    "state": {
        type: Number,
        default: 1
    },              //在职：1 离职：2 使用期：3
    "role": {
        type: Number,
        default: 1
    },              //用户角色：0 系统管理员：1 普通用户
    "roleList": [],      //系统角色
    "createTime": {
        type: Date,
        default: Date.now()
    },              //创建时间
    "lastLoginTime": {
        type: Date,
        default: Date.now()
    }              //更新时间
})

module.exports = mongoose.model("users", userSchema, "users") //第三个参数值集合的名称