const router = require('express').Router()
const {
    check,
    validationResult
} = require('express-validator');
const User = require('../models/user')
const {
    generateToken
} = require('../helpers/user')



router.post('/login', [
    // 用户名校验
    check('username').exists({
        checkFalsy: true
    }).withMessage('用户名不能为空'),
    // 密码校验
    check('password').exists({
        checkFalsy: true
    }).withMessage('密码不能为空'),
], (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        User.find({
            username: req.body.username
        }, (err, doc) => {
            if (!err && doc.length && doc[0].password === req.body.password) {
                const token = generateToken(doc)
                res.json({
                    success: true,
                    token
                })
            } else {
                next(new Error('用户名或密码错误'))
            }
        })
    }
    next()
})

router.post('/registry', [
    // 用户名校验
    check('username').isEmail().withMessage('用户名必须是一个有效邮箱'),
    // 密码校验
    check('password').matches(/[a-zA-Z0-9]{8,16}/).withMessage('密码必须为8到16位数字或字母'),
], async (req, res, next) => {
    if (validationResult(req).isEmpty()) {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        })
        // 校验用户名是否存在
        const isExist = await User.exists({
            'username': newUser.username
        })
        if (!isExist) {
            const doc = await newUser.save()
            const token = generateToken(doc)
            res.json({
                success: true,
                token
            })
        } else {
            next(new Error('用户名已存在'))
        }
    }
    next()
})

module.exports = router