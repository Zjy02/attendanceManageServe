//用户管理模块

const router = require('koa-router')()
const Leave = require('../models/leaveSchema')
const Dept = require('../models/deptSchema')
const User = require('../models/userSchema')
const util = require('../utils/util')
const Salary = require('./../models/salarySchema')
const SalaryList = require('./../models/salaryListSchema')
router.prefix('/leaves')
const { pager } = require('../utils/util')
const { create } = require('../models/leaveSchema')
const dayjs = require('dayjs')


//查询申请列表
router.get('/list', async (ctx) => {
  const { applyState, type } = ctx.request.query
  const { page, skipIndex } = util.pager(ctx.request.query)
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  try {
    let params = {}
    if (type == 'approve') {
      if (applyState == 1 || applyState == 2) {
        params.curAuditUserName = data.userName
        params.$or = [{ applyState: 1 }, { applyState: 2 }]
      } else if (applyState > 2) {
        params = { "auditFlows.userId": data.userId, applyState }
      } else {
        params = { "auditFlows.userId": data.userId }
      }
    } else {
      params = {
        "applyUser.userId": data.userId
      }
      if (applyState && applyState != 0) params.applyState = applyState
    }
    const query = Leave.find(params)
    const list = await query.skip(skipIndex).limit(page.pageSize)
    const total = await Leave.countDocuments(params)
    ctx.body = util.success({
      page: {
        ...page,
        total
      },
      list
    })

  } catch (error) {
    ctx.body = util.fail(`查询失败${error.stack}`)
  }
})

router.post('/operate', async (ctx) => {
  let { _id, action, userId, ...params } = ctx.request.body
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)

  if (action == 'create') {
    let orderNo = "XJ"
    orderNo += util.formatDate(new Date(), "yyyyMMdd")
    const total = await Leave.countDocuments()
    params.orderNo = orderNo + total

    //获取用户当前部门Id
    let id = data.deptId.pop()
    //查找负责人信息
    const userInfo = await User.find({ userId })
    let dept = await Dept.findById(userInfo[0].deptId.pop())

    //获取人事部和财务部门的负责人
    let userList = await Dept.find({ deptName: { $in: ['人力资源'] } })
    let auditUsers = dept?.userName
    let auditFlows = [
      { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail }
    ]
    userList.map(item => {
      auditFlows.push({
        userId: item.userId, userName: item.userName, userEmail: item.userEmail
      })
      auditUsers += " " + item.userName
    })
    params.auditUsers = auditUsers
    params.curAuditUserName = dept.userName
    params.auditFlows = auditFlows
    params.auditLogs = []
    params.applyUser = {
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      realName: data.realName
    }
    params.startTime = dayjs(params.startTime).format('YYYY-MM-DD HH:mm:ss')
    params.endTime = dayjs(params.endTime).format('YYYY-MM-DD HH:mm:ss')

    let res =  new Leave(params)
    await res.save()
    ctx.body = util.success("", "创建成功")
  } else {
    let res = await Leave.findByIdAndUpdate(_id, { applyState: 5 })
    ctx.body = util.success("", "删除成功")

  }
})

router.post('/approve', async (ctx) => {
  const { action, remark, _id } = ctx.request.body
  let authorization = ctx.request.headers.authorization
  let res = util.decoded(authorization)
  const data = res.data
  let params = {}
  try {
    let doc = await Leave.findById(_id)
    let auditLogs = doc.auditLogs || []
    if (doc.applyState == 3) {
      ctx.body = util.fail("当前申请单被驳回，请勿重复提交")
      return
    }
    if (doc.auditLogs.some(item => item.userId === data.userId)) {
      ctx.body = util.fail("当前申请已处理，请勿重复提交")
      return
    }
    if (action == 'refuse') {
      params.applyState = 3
    } else {
      //审核通过
      if (doc.auditFlows.length > doc.auditLogs.length + 1) {
        params.applyState = 2
        params.curAuditUserName = doc.auditFlows[doc.auditLogs.length + 1]?.userName || ''
      } else if (doc.auditFlows.length >= doc.auditLogs.length + 1) {
        params.applyState = 4
        const p = { examineDate: dayjs().format('YYYY/MM'), userId: doc.applyUser.userId }
        const salarys = await SalaryList.find(p)
        if (salarys.length) {
          await SalaryList.updateMany(p, { $set: { leaveDays: doc.leaveTime } })
        } else {
          const result = await Salary.find({ userId: doc.applyUser.userId })
          const salaryInfo = result[0]
          const newData = new SalaryList({
            userId: doc.applyUser.userId,
            realName: doc.applyUser.realName,
            tax: salaryInfo?.tax,
            basicSalary: salaryInfo?.basicSalary,
          })
          await newData.save()
        }
      }
    }
    auditLogs.push({
      userId: data.userId,
      userName: data.userName,
      createTime: new Date(),
      remark,
      action: action == 'refuse' ? ' 审核拒绝' : '审核通过'
    })
    params.auditLogs = auditLogs
    let res = await Leave.findByIdAndUpdate(_id, params)
    ctx.body = util.success("", "处理成功")
  } catch (error) {
    ctx.body = util.fail(`处理失败,${error.message}`)
  }
})

router.get('/count', async (ctx) => {
  let authorization = ctx.request.headers.authorization
  let { data } = util.decoded(authorization)
  try {
    let params = {}
    params.curAuditUserName = data.userName
    params.$or = [{ applyState: 1 }, { applyState: 2 }]
    const total = await Leave.countDocuments(params)
    ctx.body = util.success(total)
  } catch (error) {
    ctx.body = util.fail(`查询异常${error.message}`)
  }
})

module.exports = router
