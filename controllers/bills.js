const router = require('express').Router()
const mongoose = require('mongoose')
const {
  check,
  validationResult
} = require('express-validator');
const Record = require('../models/record')
const Advertise = require('../models/advertise')
const AppModel = require('../models/app')
const Charge = require('../models/charge')
const {
  monthRange
} = require('../helpers/utils')

// 计算
function calculate(record) {
  const {
    count,
    rules
  } = record
  let amount = 0
  let lastLimit = 0
  for (let i = 0; i < rules.length; i++) {
    const {
      limit,
      price
    } = rules[i]
    if (count > limit) {
      amount += limit * price
      lastLimit = limit
    } else {
      amount += (count - lastLimit) * price
      break
    }
  }
  return (amount / 10000).toFixed(4)
}

// 聚合同一个广告同一个应用的记录,计算点数和
const group = {
  $group: {
    _id: {
      advertiseId: "$advertiseId",
      appId: "$appId",
    },
    count: {
      $sum: '$count'
    }
  }
}

// month参数示例:202003
router.post('/advertise/monthly', [check('month').matches(/^\d{6}$/), ], async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      month
    } = req.body
    const [startTime, endTime] = monthRange(month)
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

    const doc = await Record.aggregate([
      ...matchPipe,
      // 筛选指定月份数据
      {
        $match: {
          createTime: {
            $gt: startTime,
            $lt: endTime
          }
        }
      },
      // 聚合同一个广告同一个应用的记录
      group,
      // 筛选当前用户广告记录
      {
        $lookup: {
          from: Advertise.collection.name,
          localField: "_id.advertiseId",
          foreignField: "_id",
          as: "advertise"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{
              $arrayElemAt: ["$advertise", 0]
            }, "$$ROOT"]
          }
        }
      },
      {
        $project: {
          advertise: 0,
          tags: 0,
          enable: 0,
          resources: 0
        }
      },
      {
        $match: {
          'owner': mongoose.Types.ObjectId(req.user._id)
        }
      },
      // 链接计费模型
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
                  chargeName: "$name",
                  events: "$events",
                  rules: "$rules"
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
      {
        $project: {
          charge: 0,
        }
      },
    ])

    for (let i = 0; i < doc.length; i++) {
      doc[i].bill = calculate(doc[i])
    }

    res.json({
      success: true,
      data: doc
    })
  }
  next()
})

router.post('/app/monthly', [check('month').matches(/^\d{6}$/), ], async (req, res, next) => {
  if (validationResult(req).isEmpty()) {
    const {
      month
    } = req.body
    const [startTime, endTime] = monthRange(month)
    const appList = await AppModel.aggregate([{
      $match: {
        owner: mongoose.Types.ObjectId(req.user._id)
      },
    }])

    matchPipe = [
      // 筛选当前用户广告记录和指定月份数据
      {
        $match: {
          'appId': {
            $in: appList.map(item => item._id)
          },
          'createTime': {
            $gt: startTime,
            $lt: endTime
          }
        }
      }
    ]

    const doc = await Record.aggregate([
      ...matchPipe,
      group,
      // 筛选当前用户应用记录
      {
        $lookup: {
          from: AppModel.collection.name,
          localField: "_id.appId",
          foreignField: "_id",
          as: "app"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{
              $arrayElemAt: ["$app", 0]
            }, "$$ROOT"]
          }
        }
      },
      {
        $project: {
          app: 0,
          tags: 0,
          secret: 0,
        }
      },
      {
        $match: {
          'owner': mongoose.Types.ObjectId(req.user._id)
        }
      },
      // 查询计费模型
      {
        $lookup: {
          from: Advertise.collection.name,
          let: {
            advertise_id: "$_id.advertiseId"
          },
          pipeline: [{
              $match: {
                $expr: {
                  $eq: ["$_id", "$$advertise_id"]
                },
              }
            },
            {
              $project: {
                advertise: {
                  charge: '$charge'
                }
              }
            },
            {
              $replaceRoot: {
                newRoot: "$advertise"
              }
            }
          ],
          as: "advertise"
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{
              $arrayElemAt: ["$advertise", 0]
            }, "$$ROOT"]
          }
        }
      },
      {
        $project: {
          advertise: 0
        }
      },
      // 链接计费模型
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
                  chargeName: "$name",
                  events: "$events",
                  rules: "$rules"
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
      {
        $project: {
          charge: 0,
        }
      },
    ])


    for (let i = 0; i < doc.length; i++) {
      doc[i].bill = calculate(doc[i])
    }

    res.json({
      success: true,
      data: doc
    })
  }
  next()
})

module.exports = router