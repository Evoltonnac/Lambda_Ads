const express = require('express')
const router = express.Router()

router.use('/users', require('./users'))
router.use('/advertise', require('./advertise'))
router.use('/apps', require('./apps'))
router.use('/charges', require('./charges'))
router.use('/statistics', require('./statistics'))
router.use('/bills', require('./bills'))

// 公开接口:广告投放,事件回馈
router.use('/public', require('./public'))

router.get('/', (req, res) => {
    res.status(404)
})

module.exports = router