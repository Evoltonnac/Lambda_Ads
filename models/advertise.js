const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdvertiseSchema = new Schema({
    title: { // 广告标题
        type: String,
        required: true
    },
    owner: { // 广告创建用户
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    charge: { // 计费模型
        type: Schema.Types.ObjectId,
        ref: 'Charge',
        required: true
    },
    tags: { // 广告标签集
        type: [String],
        default: []
    },
    resources: [{ // 广告资源集
        uri: {
            type: String,
            required: true
        },
    }],
    createTime: { // 广告创建时间
        type: Date,
        default: Date.now
    },
    enable: { // 是否启用 默认启用
        type: Boolean,
        default: true
    }
});

if (mongoose.models.Advertise) {
    Advertise = mongoose.model('Advertise');
} else {
    Advertise = mongoose.model('Advertise', AdvertiseSchema);
}

module.exports = Advertise