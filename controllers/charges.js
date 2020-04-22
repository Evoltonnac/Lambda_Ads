const router = require('express').Router()
const {
    check,
    validationResult
} = require('express-validator');
const Charge = require('../models/charge')

const {
    filter
} = require('../helpers/utils')

/**
 * @description 计费规则校验器
 */
isRules = (value) => {
    try {
        value.reduce((pre, cur, index) => {
            const {
                limit,
                price
            } = cur
            if (index !== value.length - 1) { // 非最后一条规则
                if (typeof limit !== 'number' || limit <= pre.limit || limit > 999999) throw new Error()
            } else { // 最后一条规则
                if (limit && typeof limit !== 'number' || limit <= pre.limit || limit > 999999) throw new Error()
            }
            if (Number.isNaN(parseFloat(price))) throw new Error()
            return cur
        }, {
            limit: 0,
        })
        return true
    } catch (e) {
        return false
    }
}

/**
 * 计费模型实例信息校验
 */
ChargeValidator = [
    // 计费模型名称
    check('name').optional().isString(),
    // 计费事件
    check('events').optional().isString(),
    // 计费规则
    check('rules').optional().custom(isRules).withMessage('计费规则缺失或不完整'),
]

// 计费模型创建
router.post('/', ChargeValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            name,
            events,
            rules
        } = req.body
        const newCharge = new Charge({
            name,
            owner: req.user._id,
            events,
            rules
        })
        const data = await newCharge.save()
        res.json({
            success: true,
            data
        })
    }
    next()
})

// 计费模型更新
router.put('/:chargeId', ChargeValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            name,
            events,
            rules
        } = req.body
        const update = filter({
            name,
            events,
            rules
        }, (key, value) => value !== undefined)
        const data = await Charge.findByIdAndUpdate(req.params.chargeId, update, {
            new: true
        })
        res.json({
            success: true,
            data
        })
    }
    next()
})

// 计费模型删除
router.delete('/:chargeId', async (req, res, next) => {
    await Charge.findByIdAndDelete(req.params.chargeId)
    res.json({
        success: true,
    })
})

// 计费模型信息查询
router.get('/:chargeId', async (req, res, next) => {
    const data = await Charge.findById(req.params.chargeId)
    res.json({
        success: true,
        data
    })
})

QueryValidator = [
    check('name').optional().isString(),
    check('type').optional().isString(),
]
// 条件查询
router.post('/query', QueryValidator, async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const {
            name,
            events
        } = req.body
        let query = {
            owner: req.user._id,
            name: name && {
                $regex: name,
                $options: 'i'
            },
            events,
        }
        query = filter(query, (key, value) => value !== undefined)
        const chargeList = await Charge.find(query)
        res.json({
            success: true,
            data: chargeList
        })
    }
    next()
})

module.exports = router