//用户管理模块

const router = require('koa-router')()
const User = require('./../models/userSchema')
const Menu = require('./../models/menuSchema')
const Role = require('./../models/roleSchema')
const Counter = require('./../models/counterSchema')
const Salary = require('./../models/salarySchema')
const SalaryList = require('./../models/salaryListSchema')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
router.prefix('/salarys')
const md5 = require('md5')
//获取全部用户薪资信息列表
router.post('/all/list', async (ctx) => {
  const { userName } = ctx.request.body
  const { page, skipIndex } = util.pager(ctx.request.body)

  const params = [{
    $lookup: {
      from: "salarys",
      localField: "userId",
      foreignField: "userId",
      as: "salaryInfo"
    }
  }, { $skip: skipIndex + 1 }, { $limit: page.pageSize }];
  if (userName) {
    params.push({
      $match: { userName }
    })
  }
  try {
    const result = await User.aggregate(params);
    ctx.body = util.success(result, 'success')
  } catch (error) {
    ctx.body = util.fail(`查询异常${error}`)
  }
})

router.post('/data/update', async (ctx) => {
  const {
    userId,
    basicSalary,
    lastSalary,
    personalworkYears,
    allLeaveDays,
    remark
  } = ctx.request.body
  console.log(ctx.request.body);
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
    tax,
    annualBonus,
    basicSalary,
    eaveDays,
    remark,
    punishmentDescribe
  } = ctx.request.body
  console.log(ctx.request.body);
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
    tax,
    annualBonus,
    basicSalary,
    eaveDays,
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



//创建工资单
router.post('/payroll/create', async (ctx) => {
  const {
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
      punishmentDescribe
    });
    newData.save()
    ctx.body = util.success('', '创建成功')
  } catch (error) {
    ctx.body = util.fail(error.stack, '创建失败')
  }
})


router.post('/pay/detail/update', async (ctx) => {

})
module.exports = router
