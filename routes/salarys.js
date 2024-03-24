//用户管理模块

const router = require('koa-router')()
const User = require('./../models/userSchema')
const Menu = require('./../models/menuSchema')
const Role = require('./../models/roleSchema')
const Counter = require('./../models/counterSchema')
const Salary = require('./../models/salarySchema')
const Dept = require('../models/deptSchema')
const SalaryList = require('./../models/salaryListSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
router.prefix('/salarys')
const md5 = require('md5')
//获取全部用户薪资信息列表
router.post('/all/user/query/', async (ctx) => {
  const { realName, userId, userName } = ctx.request.body
  const { page, skipIndex } = util.pager(ctx.request.body)
  console.log(page, skipIndex + '==1111111');
  if (realName || userId || userName) {
    const params = {}
    if (realName) {
      params.realName = realName
    }
    if (userId) {
      params.userId = userId
    }
    if (userName) {
      params.userName = userName
    }
    const userInfo = await User.find(params)
    if (userInfo.length) {
      const res = await Salary.find({ userId: userInfo[0].userId })
      userInfo[0].salaryInfo = res
      const deptList = await Dept.find({})
      Depttree(userInfo, deptList)
      ctx.body = util.success({ recrods: userInfo, total: 1 }, 'success')
      return
    }
    ctx.body = util.success({ recrods: [], total: 0 }, 'success')
    return
  } else {
    const params = [{
      $lookup: {
        from: "salarys",
        localField: "userId",
        foreignField: "userId",
        as: "salaryInfo"
      }
    }, { $skip: skipIndex + 1 }, { $limit: page.pageSize }, {
      $group: {
        _id: null,
        total: { $sum: 1 },
        users: { $push: "$$ROOT" }
      }
    },
    {
      $project: {
        user: "$$ROOT",
        total: 1
      }
    }];
    try {
      const result = await User.aggregate(params);
      if (!result.length) {
        ctx.body = util.success({ recrods: [], total: 0 }, 'success')
        return
      }
      const num = result[0]?.total
      const userInfo = result[0].user.users
      console.log(result);
      const deptList = await Dept.find({})
      Depttree(userInfo, deptList)
      ctx.body = util.success({ recrods: userInfo, total: num }, 'success')
    } catch (error) {
      ctx.body = util.fail(`查询异常${error}`)
    }
  }
})

const Depttree = (data, deptList) => {
  data.forEach(item => {
    item.deptId?.forEach((i, index) => {
      const dIndex = deptList.findIndex(d => (d._id + '') === i)
      if (dIndex !== -1) {
        item.deptId[index] = deptList[dIndex]
      }
    })
    item.salaryInfo && (item.salaryInfo = item?.salaryInfo[0])
  });
}

//修改个人薪资信息
router.post('/data/update', async (ctx) => {
  const {
    userId,
    basicSalary,
    lastSalary,
    personalworkYears,
    allLeaveDays,
    remark
  } = ctx.request.body
  if (!userId) {
    ctx.body = util.fail('用户ID不能为空')
    return
  }
  try {
    const result = await User.find({ userId });
    if (!result.length) {
      ctx.body = util.fail('暂无用户')
      return
    }
  } catch (error) {
    ctx.body = util.fail(`错误${error}`)
  }

  const newField = {
    userId,
    basicSalary,
    lastSalary,
    personalworkYears,
    allLeaveDays,
    remark
  }
  try {
    await Salary.updateMany({ userId: userId }, { $set: newField });
    ctx.body = util.success(`修改成功`)
  } catch (error) {
    ctx.body = util.fail(`修改失败:${error.stack}`)
  }
})

//修改工资单
router.post('/payroll/update', async (ctx) => {
  const {
    userId,
    examineDate,
    penalty,
    realWorkDays,
    realSalary,
    bonus,
    annualBonus,
    basicSalary,
    leaveDays,
    remark,
    punishmentDescribe
  } = ctx.request.body
  if (!userId) {
    ctx.body = util.fail('用户ID不能为空')
    return
  }

  const result = await SalaryList.find({ userId });
  if (!result.length) {
    ctx.body = util.fail('改用户暂无工资单')
    return
  }

  const newField = {
    examineDate,
    penalty,
    realWorkDays,
    realSalary,
    bonus,
    annualBonus,
    basicSalary,
    leaveDays,
    remark,
    punishmentDescribe
  }
  try {
    await SalaryList.updateMany({ userId: userId }, { $set: newField });
    ctx.body = util.success(`修改成功`)
  } catch (error) {
    ctx.body = util.fail(`修改失败:${error.stack}`)
  }
})

router.post('/payroll/update/query', async (ctx) => {
  const { userId, time } = ctx.request.body
  try {
    const params = {
      userId
    }
    if (time) {
      params.time = time
      const result = await SalaryList.find(params)
      ctx.body = util.success({ recrods: result }, `查询成功`)
      return
    } else {
      const result = await SalaryList.find(params)
      if (!result.length) {
        const r = await Salary.find({ userId })
        const salaryInfo = r[0]
        const newData = new SalaryList({
          userId,
          tax: salaryInfo?.tax,
          basicSalary: salaryInfo?.basicSalary,
        })
        await newData.save()
        const res = await SalaryList.find(params)
        ctx.body = util.success({ recrods: res }, `查询成功`)
        return
      } else {
        ctx.body = util.success({ recrods: result }, `查询成功`)
        return
      }
    }
  } catch (error) {
    ctx.body = util.fail(`查询失败:${error.stack}`)
  }
})

router.post('/payroll/all/query', async (ctx) => {
  const { realName, time } = ctx.request.body
  try {
    const params = {}
    if (realName) params.realName = realName
    if (time) params.time = time
    const result = await SalaryList.find(params)
    ctx.body = util.success({ recrods: result }, '查询成功')
  } catch (error) {
    ctx.body = util.fail('查询成功异常')
  }
})


//创建工资单
router.post('/payroll/create', async (ctx) => {
  const {
    realName,
    userId,
    examineDate,
    penalty,
    realWorkDays,
    realSalary,
    bonus,
    tax,
    annualBonus,
    basicSalary,
    eaveDays,
    remark,
    punishmentDescribe
  } = ctx.request.body
  //userId必传
  if (!userId) {
    ctx.body = util.fail('用户ID不能为空')
    return
  }
  try {
    //判断是否存在用户
    const result = await User.find({ userId });
    if (!result.length) {
      ctx.body = util.fail('暂无用户')
      return
    }
    //判断当月工资单是否创建
    const d = new Date();
    const t = [d.getFullYear(), d.getDate()].join('/');
    const userPayRoll = await SalaryList.find({ userId, examineDate: t });
    if (userPayRoll.length) {
      ctx.body = util.fail('本月工资单已存在')
      return
    }
  } catch (error) {
    ctx.body = util.fail(error.stack, '错误')
  }

  try {
    const newData = new SalaryList({
      userId,
      examineDate,
      penalty,
      realWorkDays,
      realSalary,
      bonus,
      tax,
      annualBonus,
      basicSalary,
      eaveDays,
      remark,
      punishmentDescribe,
      realName
    });
    newData.save()
    ctx.body = util.success('', '创建成功')
  } catch (error) {
    ctx.body = util.fail(error.stack, '创建失败')
  }
})

router.post('/all/user/update', async (ctx) => {
  const { userId, annualBonus, basicSalary, tax } = ctx.request.body
  try {
    await Salary.updateMany({ userId }, { $set: { annualBonus, basicSalary, tax } })
    ctx.body = util.success(`修改成功`)
  } catch (error) {
    ctx.body = util.fail(`修改失败:${error.stack}`)
  }
})

module.exports = router
