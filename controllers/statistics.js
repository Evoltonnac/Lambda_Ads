const router = require('express').Router()
const mongoose = require('mongoose')
const {
  check,
  validationResult
} = require('express-validator');
const Record = require('../models/record')
const Advertise = require('../models/advertise')
const AppModel = require('../models/app')
const {
  monthRange
} = require('../helpers/utils')

const groupEvent = (event) => {
  const unwind = '$triggers'
  const project = {
    "appId": 1,
    "advertiseId": 1,
    view: {
      $cond: [{
          $eq: ["$triggers.triggerEvent", 'view']
        },
        1,
        0
      ]
    },
    focus: {
      $cond: [{
          $eq: ["$triggers.triggerEvent", 'focus']
        },
        1,
        0
      ]
    },
    click: {
      $cond: [{
          $eq: ["$triggers.triggerEvent", 'click']
        },
        1,
        0
      ]
    }
  }
  const group = {
    _id: "$advertiseId",
    view: {
      $sum: '$view'
    },
    focus: {
      $sum: '$focus'
    },
    click: {
      $sum: '$click'
    }

  }
  let customEvent = (event || '').split(' ')
  if (event) {
    project[customEvent.join('-')] = {
      $cond: [{
          $eq: ["$triggers.triggerEvent", customEvent[0]]
        },
        1,
        0
      ]
    }
    group[customEvent.join('-')] = {
      $sum: '$' + customEvent.join('-')
    }
  }
  return [{
    $unwind: unwind
  }, {
    $project: project
  }, {
    $group: group
  }]
}

router.post('/advertise/requests', [check('advertiseId').optional().isString(), ], async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      advertiseId
    } = req.body

    let matchPipe
    if (advertiseId) {
      matchPipe = [{
        $match: {
          advertiseId: mongoose.Types.ObjectId(advertiseId)
        }
      }]
    } else {
      const advertiseList = await Advertise.aggregate([{
        $match: {
          owner: mongoose.Types.ObjectId(req.user._id)
        },
      }])

      matchPipe = [
        // 筛选当前用户广告记录
        {
          $match: {
            'advertiseId': {
              $in: advertiseList.map(item => item._id)
            }
          }
        }
      ]
    }
    const doc = await Record.aggregate([
      // 筛选广告数据(可选)
      ...matchPipe,
      {
        $project: {
          month: {
            $month: '$createTime'
          }
        }
      },
      {
        $group: {
          _id: "$month",
          total: {
            $sum: 1
          }
        }
      }
    ])

    res.json({
      success: true,
      data: doc
    })
  }
  next()
})


router.post('/advertise/events/monthly', [check('advertiseId').optional().isString(), check('event').optional().isString(), check('month').matches(/^\d{6}$/)], async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      advertiseId,
      event,
      month
    } = req.body

    if (!advertiseId) {
      res.json({
        success: true,
        doc: []
      })
      next()
    } else {
      const [startTime, endTime] = monthRange(month)
      const doc = await Record.aggregate([
        // 筛选广告数据(可选)
        {
          $match: {
            advertiseId: mongoose.Types.ObjectId(advertiseId)
          }
        },
        // 筛选指定月份数据
        {
          $match: {
            createTime: {
              $gt: startTime,
              $lt: endTime
            }
          }
        },
        ...groupEvent(event)
      ])

      const eventName = (event || '').split(' ').join('-')
      let result = [{
        name: 'view',
        total: doc[0].view
      }, {
        name: 'focus',
        total: doc[0].focus
      }, {
        name: 'click',
        total: doc[0].click
      }]
      if (event) {
        result.push({
          name: eventName,
          total: doc[0][eventName]
        })
      }
      res.json({
        success: true,
        data: result
      })
    }
    next()
  }
})

router.post('/app/requests', [check('appId').optional().isString(), ], async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      appId
    } = req.body

    let matchPipe
    if (appId) {
      matchPipe = [{
        $match: {
          appId: mongoose.Types.ObjectId(appId)
        }
      }]
    } else {
      const appList = await AppModel.aggregate([{
        $match: {
          owner: mongoose.Types.ObjectId(req.user._id)
        },
      }])

      matchPipe = [
        // 筛选当前用户广告记录
        {
          $match: {
            'appId': {
              $in: appList.map(item => item._id)
            }
          }
        }
      ]
    }
    const doc = await Record.aggregate([
      // 筛选广告数据(可选)
      ...matchPipe,
      {
        $project: {
          month: {
            $month: '$createTime'
          }
        }
      },
      {
        $group: {
          _id: "$month",
          total: {
            $sum: 1
          }
        }
      }
    ])

    res.json({
      success: true,
      data: doc
    })
  }
  next()
})


router.post('/app/events/monthly', [check('appId').optional().isString(), check('event').optional().isString(), check('month').matches(/^\d{6}$/)], async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      appId,
      event,
      month
    } = req.body

    if (!appId) {
      res.json({
        success: true,
        doc: []
      })
      next()
    } else {
      const [startTime, endTime] = monthRange(month)
      const doc = await Record.aggregate([
        // 筛选广告数据(可选)
        {
          $match: {
            appId: mongoose.Types.ObjectId(appId)
          }
        },
        // 筛选指定月份数据
        {
          $match: {
            createTime: {
              $gt: startTime,
              $lt: endTime
            }
          }
        },
        ...groupEvent(event)
      ])

      const eventName = (event || '').split(' ').join('-')
      let result = [{
        name: 'view',
        total: doc[0].view
      }, {
        name: 'focus',
        total: doc[0].focus
      }, {
        name: 'click',
        total: doc[0].click
      }]
      if (event) {
        result.push({
          name: eventName,
          total: doc[0][eventName]
        })
      }
      res.json({
        success: true,
        data: result
      })
    }
    next()
  }
})

module.exports = router