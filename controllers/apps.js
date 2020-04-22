const router = require('express').Router()
const {
    check,
    validationResult
} = require('express-validator');
const AppModel = require('../models/app')
const User = require('../models/user')

const {
    filter
} = require('../helpers/utils')

/**
 * 应用实例信息校验
 */
AppModelValidator = [
    // 应用名称
    check('name').optional().isString(),
    // 应用标签关键词格式校验
    check('tags').optional().isArray(),
]

// 应用创建
router.post('/', AppModelValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            name,
            tags,
        } = req.body
        const {
            password
        } = await User.findById(req.user._id)
        const newApp = new AppModel({
            name,
            owner: req.user._id,
            tags,
            secret: password
        })
        const data = await newApp.save()
        res.json({
            success: true,
            data
        })
    }
    next()
})

// 应用更新
router.put('/:appId', AppModelValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            name,
            tags,
        } = req.body
        const update = filter({
            name,
            tags,
        }, (key, value) => value !== undefined)
        const data = await AppModel.findByIdAndUpdate(req.params.appId, update, {
            new: true
        })
        res.json({
            success: true,
            data
        })
    }
    next()
})

// 应用删除
router.delete('/:appId', async (req, res, next) => {
    await AppModel.findByIdAndDelete(req.params.appId)
    res.json({
        success: true,
    })
})

// 应用信息查询
router.get('/:appId', async (req, res, next) => {
    const data = await AppModel.findById(req.params.appId)
    res.json({
        success: true,
        data
    })
})

QueryValidator = [
    check('name').optional().isString(),
    check('tags').optional().isString(),
    check('createtimeRange').optional().isArray(),
]
// 条件查询
router.post('/query', QueryValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            name,
            tags,
            createtimeRange,
        } = req.body
        let query = {
            owner: req.user._id,
            name: name && {
                $regex: name,
                $options: 'i'
            },
            tags,
            createTime: createtimeRange && {
                $gt: new Date(createtimeRange[0]).toISOString(),
                $lt: new Date(createtimeRange[1]).toISOString()
            },
        }
        query = filter(query, (key, value) => value !== undefined)
        const appList = await AppModel.find(query)
        res.json({
            success: true,
            data: appList
        })
    }
    next()
})

module.exports = router