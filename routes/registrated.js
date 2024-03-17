//用户管理模块

const router = require('koa-router')()
const User = require('./../models/userSchema')
const Menu = require('./../models/menuSchema')
const Role = require('./../models/roleSchema')
const Counter = require('./../models/counterSchema')
const Salary = require('./../models/salarySchema')
const SalaryList = require('./../models/salaryListSchema')
const Registration = require('./../models/registrationSchema')
const dayjs = require('dayjs')
const util = require('./../utils/util')
const jwt = require('jsonwebtoken')
router.prefix('/registrated')

//早签
router.post('/sign/start', async (ctx) => {
  const { userId, location, lateReason, startLocationName } = ctx.request.body
  try {
    const user = await User.find({ userId });
    if (!user.length) {
      ctx.body = util.fail('用户不存在');
      return
    }
    const todayStr = dayjs().format('YYYY-MM-DD');
    const result = await Registration.find({ today: todayStr, userId })
    if (result.length) {
      ctx.body = util.fail('今天已打上班卡');
      return
    }
    let delayTime = 0
    let isDelay = false;
    const t = dayjs()
    const todayAtNine = dayjs().startOf('day').add(9, 'hour');
    const after = t.isAfter(todayAtNine)
    const diff = t.diff(todayAtNine, 'minute', true)
    //判断是否迟到
    if (after) {
      // 迟到
      if (!lateReason) {
        ctx.body = util.fail('上班迟到，迟到原因必填');
        return
      }
      delayTime = Number(diff)
      isDelay = true
    }
    const newData = new Registration({
      userId,
      today: dayjs().format('YYYY-MM-DD'),
      location,
      workStartTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      isDelay,
      lateReason,
      delayTime,
      startLocationName
    })
    await newData.save()
    ctx.body = util.success('上班卡成功');
  } catch (error) {
    ctx.body = util.fail(error)
  }
})

//晚签
router.post('/sign/end', async (ctx) => {
  const { userId, location, earlyReason, endLocationName } = ctx.request.body
  try {
    const user = await User.find({ userId });
    if (!user.length) {
      ctx.body = util.fail('用户不存在');
      return
    }
    const todayStr = dayjs().format('YYYY-MM-DD');
    const result = await Registration.find({ today: todayStr, userId })
    if (!result.length) {
      ctx.body = util.fail('今天未打上班卡');
      return
    }
    //判断是否早退
    let earlyTime = 0
    let extraTime = 0
    let isEarly = false;
    const t = dayjs()
    const todayAtNine = dayjs().startOf('day').add(18, 'hour');
    const before = t.isBefore(todayAtNine)
    const diff = t.diff(todayAtNine, 'minute', true)

    if (before) {
      //早退
      if (!earlyReason) {
        ctx.body = util.fail('早退原因必填');
        return
      }
      isEarly = true
      earlyTime = Number(diff)
    } else {
      //加班时长
      extraTime = Number(diff)
    }
    const newField = {
      location,
      earlyReason,
      earlyTime,
      isEarly,
      workEndTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      extraTime,
      endLocationName
    }
    await Registration.updateMany({ userId }, { $set: newField })
    const userSalary = await Salary.find({ userId })
    const extratime = (userSalary[0]?.allExtraTime || 0) + extraTime
    await Salary.updateMany({ userId }, { $set: { allExtraTime: extratime } })
    ctx.body = util.success('下班卡成功');
  } catch (error) {
    ctx.body = util.fail(error)
  }
})

router.post('/sign/query', async (ctx) => {
  const { userId, time } = ctx.request.body
  try {
    const result = await Registration.find({ userId, today: time });
    console.log(result);
    ctx.body = util.success(result[0], 'success')
  } catch (error) {
    ctx.body = util.fail(`查询失败${error}`)
  }
})
module.exports = router
