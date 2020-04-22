const express = require('express');
const expressJwt = require('express-jwt')
const config = require('./env.config')

const app = express();

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

// 请求中间件
app.use(express.urlencoded({
  extended: false
}))
app.use(express.json());

// 跨域中间件
const cors = require('cors')

corsOptions = {
  origin: config.CORS_ORIGIN,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// JWT鉴权
app.use(expressJwt({
  secret: config.JWT_SECRET // 签名的密钥 或 PublicKey
}).unless({
  path: ['/users/login', '/users/registry', /\/public\/.*/] // 登陆、注册、公共接口路径不经过 Token 解析
}))

// 路由
app.use(require('./controllers'))

// 错误处理中间件
app.use(require('./middleware/errorHandler').validationHandler)
app.use(require('./middleware/errorHandler').errorHandler)

module.exports = app;