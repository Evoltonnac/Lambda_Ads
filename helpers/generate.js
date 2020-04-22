const Record = require('../models/record')
const moment = require('moment')
const config = require('../env.config')
const {
  statistic
} = require('../helpers/statstics')

// 设置 Mongoose 连接
const mongoose = require('mongoose');
const mongoDB = config.MONGODB_Path;
mongoose.Promise = global.Promise;
mongoose.connect(mongoDB, {
    useNewUrlParser: true
  }).then(() => {
    console.log('mongoDB is connected...')
  })
  .catch((err) => {
    throw err
  })

const random = (int) => {
  return Math.floor(Math.random() * int)
}

const generateRecordDoc = (count) => {
  let doc = []
  for (let i = 0; i < count; i++) {
    doc.push(generateRecord())
  }
  return doc
}

// 生成随机的观看记录
const generateRecord = () => {
  let appId = mongoose.Types.ObjectId('5e93ed1dd1157c0e201b70fd')
  let advertiseId = mongoose.Types.ObjectId('5e8b375bc2f05a95a8df7261')
  let createTime = generateTime()
  let triggers = generateTriggersDoc(createTime)
  let view = "'{}"
  return {
    appId,
    advertiseId,
    createTime,
    triggers,
    view,
    count: statistic('load view', [triggers])
  }
}

// 生成随机的事件触发记录
const generateTriggersDoc = (createTime) => {
  let triggerDocs = []
  const length = random(10) + 5
  const randomEvent = generateEvent(length)
  let lastTriggerTime = createTime
  for (let i = 0; i < length; i++) {
    let triggerEvent = randomEvent()
    let triggerTime = generateTime(lastTriggerTime)
    lastTriggerTime = triggerTime
    if (i === 0) triggerEvent = 'load'
    triggerDocs.push({
      triggerEvent,
      triggerTime
    })
  }
  return triggerDocs
}

// 生成随机时间或未来10秒内随机时间
const generateTime = (time) => {
  if (time) {
    return moment(time).add(random(10), "s").add(100, 'ms').toISOString()
  } else {
    return moment([2020, random(12), random(28) + 1, random(24), random(60)]).toISOString()
  }
}

// 生成随机事件
const eventList = ['load', 'view', 'focus', 'blur', 'click']
const generateEvent = (length) => {
  let events = eventList.slice()
  for (let i = 0; i < length - 5; i++) {
    events.push('custom' + (i + 1))
  }
  return () => events[random(length)]
}

const generate = async () => {
  for (let i = 0; i < 20; i++) {
    await Record.insertMany(generateRecordDoc(5000))
  }
}

generate().then(() => {
  mongoose.disconnect().then(() => {
      console.log('mongoDB is disconnected!')
    })
    .catch((err) => {
      throw err
    })
})