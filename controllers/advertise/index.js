const router = require('express').Router()
const basic = require('./basic')
const query = require('./query')

router.use(basic)
router.use(query)

module.exports = router