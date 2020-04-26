// 当前环境
const env = (process.env.NODE_ENV || 'production').toLowerCase()
console.log(env)

/**
 * 不同环境的环境变量
 * @var MONGODB_Path: mongoDB连接的用户名，密码，地址，数据库名
 * @var JWT_SECRET: JWT签名密钥
 */
const config = {
    default_config: {
        JWT_SECRET: '71116226xmh'
    },
    development: {
        // MONGODB_Path: 'mongodb+srv://root:root@aws-lambda-hsvxv.mongodb.net/test?retryWrites=true&w=majority',
        MONGODB_Path: 'mongodb://127.0.0.1:27017/test',
        CORS_ORIGIN: /localhost/,
    },
    production: {
        MONGODB_Path: 'mongodb+srv://root:root@aws-lambda-hsvxv.mongodb.net/test?retryWrites=true&w=majority',
        CORS_ORIGIN: /lambda-ads-web.*\.now\.sh/,
    }
}

module.exports = {
    ...config.default_config,
    ...config[env]
}