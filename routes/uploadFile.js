//用户管理模块

const router = require('koa-router')()
const multer = require('@koa/multer')
const User = require('./../models/userSchema')
const File = require('./../models/fileSchema')
const { UPLOAD_PATH } = require('../config/path')
const { SERVER_PORT, SERVER_HOST } = require('../config/server')
const util = require('../utils/util')

const uploadAvatar = multer({
  // 跟启动项目的路径有关
  dest: UPLOAD_PATH
})
router.prefix('/file')

//获取全部用户薪资信息列表
router.post('/avatar', uploadAvatar.single('avatar'), async (ctx) => {
  const { filename, mimetype, size } = ctx.request.file
  const { userId } = ctx.request.body
  console.log(ctx.request.file);
  try {
    const result = await User.find({ userId })
    if (!result.length) {
      ctx.body = util.fail('暂无用户')
      return
    }
    const newData = {
      filename,
      mimetype,
      size,
      userId
    }
    const files = new File(newData)
    await files.save()
    const avatarUrl = `${SERVER_HOST}:${SERVER_PORT}/api/users/avatar/${userId}`
    const newField = {
      avatar: avatarUrl
    }
    await User.updateMany({ userId }, { $set: newField })
    ctx.body = {
      code: 0,
      message: '头像上传成功',
      avatarUrl
    }
  } catch (error) {
    ctx.body = {
      code: -1,
      message: '头像上传失败',
      error
    }
  }
})
module.exports = router
