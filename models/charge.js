const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RuleSchema = new Schema({
    limit: { // 计费阶段限制数
        type: Number,
        default: 999999,
        get: v => Math.round(v),
        set: v => Math.round(v),
    },
    price: { // 计费单价 精确到小数点后4位
        type: Number,
        default: 0,
        get: v => (v / 10000).toFixed(4),
        set: v => (v * 10000),
    }
}, {
    toObject: {
        getters: true
    },
    toJSON: {
        getters: true
    }
})

const ChargeSchema = new Schema({
    name: { // 计费名称
        type: String,
        required: true
    },
    owner: { // 计费创建用户
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    events: { // 计费事件
        type: String,
        required: true
    },
    rules: [{ // 计费模型
        type: RuleSchema,
    }],
    createTime: { // 计费创建时间
        type: Date,
        default: Date.now
    }
}, {
    toObject: {
        getters: true
    },
    toJSON: {
        getters: true
    }
});

if (mongoose.models.Charge) {
    Charge = mongoose.model('Charge');
} else {
    Charge = mongoose.model('Charge', ChargeSchema);
}

module.exports = Charge