const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TriggerSchema = new Schema({
  triggerEvent: { // 计费阶段限制数
    type: String,
    required: true
  },
  triggerTime: { // 计费单价 精确到小数点后4位
    type: Date,
    default: Date.now
  }
})

const RecordSchema = new Schema({
  appId: { // 应用Id
    type: Schema.Types.ObjectId,
    ref: 'App',
    required: true
  },
  advertiseId: { // 广告Id
    type: Schema.Types.ObjectId,
    ref: 'Advertise',
    required: true
  },
  view: {
    type: String,
    set: JSON.stringify,
    get: JSON.parse,
    default: '{}'
  },
  triggers: [{ // 事件触发记录
    type: TriggerSchema,
  }],
  createTime: { // 计费创建时间
    type: Date,
    default: Date.now
  },
  count: { // 计费点数
    type: Number,
    default: 0,
    get: v => Math.round(v),
    set: v => Math.round(v),
  }
}, {
  toObject: {
    getters: true
  },
  toJSON: {
    getters: true
  }
});

if (mongoose.models.Record) {
  Record = mongoose.model('Record');
} else {
  Record = mongoose.model('Record', RecordSchema);
}

module.exports = Record