const mongoose = require('mongoose')

const leaveSchema = mongoose.Schema({
    orderNo: String,
    applyType: Number,
    startTime: {
        type: String,
        default: Date.now()
    },
    endTime: {
        type: String,
        default: Date.now()
    },
    applyUser: {
        userId: String,
        userName: String,
        userEmail: String,
        realName: String
    },
    leaveTime: String,
    reasons: String,
    auditUsers: String,
    curAuditUserName: String,
    auditFlows: [
        {
            userId: String,
            userName: String,
            userEmail: String
        }
    ],
    auditLogs: [
        {
            userId: String,
            userName: String,
            createTime: Date,
            remark: String,
            action: String
        }
    ],
    applyState: {
        type: Number,
        default: 1
    },
    createTime: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("leaves", leaveSchema, "leaves") //第三个参数值集合的名称