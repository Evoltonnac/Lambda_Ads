const AppModel = require('../models/app')
const Advertise = require('../models/advertise')
const Charge = require('../models/charge')
const {
  filter
} = require('../helpers/utils')

// module.exports.ad_select = async (next, appId, secret, advertiseId = "", viewer = {}) => {
//   const app = await AppModel.findById(appId)
//   if (!app || app.secret !== secret) next(new Error('Authentication failed')) // app不存在或密钥错误
//   else {
//     if (advertiseId) {
//       // 指定广告
//       const ad = await Advertise.findById(advertiseId)
//       if (ad.enable) return ad
//       else next(new Error('No matched advertise now'))
//     } else {
//       // 选择广告
//       let query = {
//         'tags': app.tags.length ? {
//           '$in': app.tags
//         } : undefined,
//         'enable': true
//       }
//       query = filter(query, (key, value) => value !== undefined)
//       const adList = await Advertise.find(query)
//       const randomNum = Math.floor((Math.random() * adList.length))
//       if (adList.length) return adList[randomNum]
//       else next(new Error('No matched advertise now'))
//     }
//   }
// }

/**
 * @description: 广告选择器，通过请求数据，处理中间件 得到最后结果
 */
module.exports.AdSelector = class AdSelector {
  constructor(condition) {
    this.context = {
      condition,
      result: {}
    }
    this.middlewares = []
  }

  use(fun) {
    if (typeof fun === 'function') {
      this.middlewares.push(fun)
    } else {
      throw new Error('TypeError: middleware should be a funciton')
    }
  }

  async exec() {
    let count = 0 // 当前中间件位置
    let top = this.middlewares.length //中间件集长度

    // next函数，依次执行中间件
    const next = async (err) => {
      // 错误抛出
      if (err instanceof Error) {
        throw err
      } else if (count < top) {
        count++
        await this.middlewares[count - 1](this.context, next)
      }
    }

    // 执行，返回最终结果或捕获错误
    try {
      await next()
      return Promise.resolve(this.context.result)
    } catch (err) {
      return Promise.reject(err)
    }
  }
}

// 投放应用鉴权中间件
module.exports.AppAuth = async ({
  condition
}, next) => {
  const {
    appId,
    secret
  } = condition
  const app = await AppModel.findById(appId)
  if (!app || app.secret !== secret) await next(new Error('Authentication failed')) // app不存在或密钥错误
  else condition.app = app
  await next()
}

// 查询筛选广告中间件
module.exports.AdQuery = async (context, next) => {
  const {
    app,
    advertiseId,
    events
  } = context.condition
  let query = {}
  // 指定广告
  if (advertiseId) {
    query._id = advertiseId
    // 非指定广告
  } else {
    // 标签匹配
    if (app.tags.length) {
      query.tags = {
        '$in': app.tags
      }
    }
    // 计费事件匹配
    if (app.events) {
      const chargeList = await Charge.aggregate([{
        $match: {
          events: events
        },
      }])

      query.charge = {
        '$in': chargeList.map(item => item._id)
      }
    }
  }
  // 筛选启用状态广告
  query.enable = true
  // 过滤空条件
  query = filter(query, (key, value) => value !== undefined)
  const adList = await Advertise.find(query)
  context.result = adList
  await next()
}

// 随机选择一条符合条件的广告
module.exports.RandomSelect = async (context, next) => {
  const {
    result
  } = context
  const randomNum = Math.floor((Math.random() * result.length))
  if (result.length) {
    context.result = result[randomNum]
    await next()
  } else await next(new Error('No matched advertise now'))
}