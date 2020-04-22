const router = require('express').Router()
const mongoose = require('mongoose')
const Record = require('../models/record')
const Advertise = require('../models/advertise')
const Charge = require('../models/charge')
const {
  ad_select
} = require('../helpers/public')
const {
  statistic
} = require('../helpers/statstics')

router.post('/serverlessAds', async (req, res, next) => {
  const {
    appId,
    secret,
    advertiseId,
    viewer
  } = req.body
  const {
    title,
    tags,
    resources,
    _id
  } = await ad_select(next, appId, secret, advertiseId, viewer)

  // 创建一个新的view记录
  const newRecord = new Record({
    appId,
    advertiseId: _id,
    view: JSON.stringify(viewer),
    triggers: [{
      triggerEvent: 'load'
    }]
  })
  const record = await newRecord.save()

  // 响应广告资源信息
  res.json({
    ad_title: title,
    ad_tags: tags,
    ad_resources: resources,
    next: `/public/serverlessAds/${record._id}/trigger` // 触发事件需要请求的url
  })
  next()
})

router.get('/serverlessAds/:recordId/trigger/:event', async (req, res, next) => {
  const record = await Record.findById(req.params.recordId)

  // 查询计费模型
  const charge = await Advertise.aggregate([{
      $match: {
        _id: mongoose.Types.ObjectId(record.advertiseId)
      }
    },
    {
      $lookup: {
        from: Charge.collection.name,
        let: {
          charge_id: "$charge"
        },
        pipeline: [{
            $match: {
              $expr: {
                $eq: ["$_id", "$$charge_id"]
              },
            }
          },
          {
            $project: {
              _id: 0,
              charge: {
                events: "$events",
              }
            }
          },
          {
            $replaceRoot: {
              newRoot: "$charge"
            }
          }
        ],
        as: "charge"
      }
    },
    {
      $replaceRoot: {
        newRoot: {
          $mergeObjects: [{
            $arrayElemAt: ["$charge", 0]
          }, "$$ROOT"]
        }
      }
    },
  ])
  const [{
    events
  }] = charge

  // 附加事件触发记录
  record.triggers.push({
    triggerEvent: req.params.event
  })
  // 统计计费模型统计维度的点数
  record.count = statistic(events, [record.triggers])

  await record.save()
  res.status(200).send()
})

module.exports = router