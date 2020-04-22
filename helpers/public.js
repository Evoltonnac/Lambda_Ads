const AppModel = require('../models/app')
const Advertise = require('../models/advertise')
const {
  filter
} = require('../helpers/utils')

module.exports.ad_select = async (next, appId, secret, advertiseId = "", viewer = {}) => {
  const app = await AppModel.findById(appId)
  if (!app || app.secret !== secret) next(new Error('Authentication failed')) // app不存在或密钥错误
  else {
    if (advertiseId) {
      // 指定广告
      const ad = await Advertise.findById(advertiseId)
      if (ad.enable) return ad
      else next(new Error('No matched advertise now'))
    } else {
      // 选择广告
      let query = {
        'tags': app.tags.length ? {
          '$in': app.tags
        } : undefined,
        'enable': true
      }
      query = filter(query, (key, value) => value !== undefined)
      const adList = await Advertise.find(query)
      const randomNum = Math.floor((Math.random() * adList.length))
      if (adList.length) return adList[randomNum]
      else next(new Error('No matched advertise now'))
    }
  }
}