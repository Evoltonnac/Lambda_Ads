const router = require('express').Router()
const {
    check,
    validationResult
} = require('express-validator');
const Advertise = require('../../models/advertise')
const {
    filter
} = require('../../helpers/utils')

/**
 * @description 广告资源校验器
 */
isResources = (value) => {
    return Array.isArray(value) && value.reduce((pre, cur) => {
        if (pre) {
            return !!cur.uri
        }
        return pre
    }, true)
}

/**
 * 广告实例信息校验
 */
AdvertiseValidator = [
    // 广告资源格式校验
    check('resources').optional().custom(isResources).withMessage('广告资源缺失或不完整'),
    // 广告计费模型校验
    check('charge').optional().isString(),
    // 广告标签关键词格式校验
    check('tags').optional().isArray(),
    // 广告启用格式校验
    check('enable').optional().isBoolean(),
]

// 广告创建
router.post('/', AdvertiseValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            title,
            tags,
            charge,
            resources
        } = req.body
        const newAdvertise = new Advertise({
            title,
            owner: req.user._id,
            tags,
            charge,
            resources
        })
        const data = await newAdvertise.save()
        res.json({
            success: true,
            data
        })
    }
    next()
})

// 广告更新
router.put('/:advertiseId', AdvertiseValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            title,
            tags,
            charge,
            resources,
            enable
        } = req.body
        const update = filter({
            title,
            tags,
            charge,
            resources,
            enable
        }, (key, value) => value !== undefined)
        const data = await Advertise.findByIdAndUpdate(req.params.advertiseId, update, {
            new: true
        })
        res.json({
            success: true,
            data
        })
    }
    next()
})

// 广告删除
router.delete('/:advertiseId', async (req, res, next) => {
    await Advertise.findByIdAndDelete(req.params.advertiseId)
    res.json({
        success: true,
    })
})

// 广告信息查询
router.get('/:advertiseId', async (req, res, next) => {
    const data = await Advertise.findById(req.params.advertiseId)
    res.json({
        success: true,
        data
    })
})

module.exports = router