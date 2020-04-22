const moment = require('moment')

/**
 * 统计每个应用每个广告的事件触发量
 * @param {*} eventStr 需要统计的事件名，单个事件统计次数，两个事件统计每两次触发之间的时长
 * @param {*} triggersArray 每个应用每个广告的触发记录二维数组
 */
const statistic = (eventStr, triggersArray) => {
  const events = eventStr.split(' ')
  if (!events.length) return 0
  let sum = 0
  // 次数统计
  if (events.length === 1) {
    for (let i = 0; i < triggersArray.length; i++) {
      sum += triggersArray[i].reduce((pre, cur) => {
        if (cur.triggerEvent === events[0]) return pre + 1
        return pre
      }, 0)
    }
    return sum
  }
  // 时长统计
  else {
    for (let i = 0; i < triggersArray.length; i++) {
      let time = 0
      let startTime = ''
      for (let j = 0; j < triggersArray[i].length; j++) {
        const item = triggersArray[i][j]
        if (!startTime) {
          // 未取到事件开始时间
          if (item.triggerEvent === events[0]) {
            startTime = item.triggerTime
          } else {
            continue
          }
        } else {
          // 已取到事件开始时间
          if (item.triggerEvent === events[1]) {
            time += moment(item.triggerTime).diff(moment(startTime), 'seconds')
            startTime = ''
          } else {
            continue
          }
        }
      }
      sum += time
    }
    return sum
  }
}

module.exports.statistic = statistic