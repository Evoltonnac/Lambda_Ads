const router = require('express').Router()
const {
  check,
  validationResult
} = require('express-validator');
const Advertise = require('../../models/advertise')
// const {
//   getUserObjectId
// } = require('../../helpers/user')
const {
  filter
} = require('../../helpers/utils')

// 广告条件查询
QueryValidator = [
  // 广告标题关键词校验
  check('title').optional().isString(),
  // 广告标签关键词校验
  check('tags').optional().isString(),
  // 广告创建日期区间校验
  check('createtimeRange').optional().isArray(),
  // 广告启用格式校验
  check('enable').optional().isBoolean(),
]

router.post('/query', QueryValidator, async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      username,
      title,
      tags,
      createtimeRange,
      enable
    } = req.body
    // 获取用户id
    if (req.user) {
      let query = {
        owner: req.user._id,
        title: title && {
          $regex: title,
          $options: 'i'
        },
        tags,
        createTime: createtimeRange && {
          $gt: new Date(createtimeRange[0]).toISOString(),
          $lt: new Date(createtimeRange[1]).toISOString()
        },
        enable
      }
      query = filter(query, (key, value) => value !== undefined)
      const advertiseList = await Advertise.find(query)
      res.json({
        success: true,
        data: advertiseList
      })
    } else next(new Error('用户不存在，请重新登陆'))
  }
  next()
})

module.exports = router