const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AppSchema = new Schema({
    name: { // 应用名称
        type: String,
        required: true
    },
    owner: { // 应用创建用户
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    tags: { // 应用标签集
        type: [String],
        default: []
    },
    createTime: { // 应用注册时间
        type: Date,
        default: Date.now
    },
    secret: { // 应用密钥
        type: String,
        required: true
    }
});

if (mongoose.models.AppModel) {
    AppModel = mongoose.model('App');
} else {
    AppModel = mongoose.model('App', AppSchema);
}

module.exports = AppModel