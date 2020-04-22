const User = require('../models/user')
const jwt = require('jsonwebtoken')
const {
  JWT_SECRET
} = require('../env.config')


/**
 * 获取用户ObjectId
 * @param {*} username 用户名
 */
const getUserObjectId = async (username) => {
  const result = await User.find({
    username
  })
  if (result.length && result[0].id) return result[0].id
  else return false

}

const generateToken = userdoc => {
  let user
  if (Array.isArray(userdoc)) {
    if (userdoc.length) user = userdoc[0]
    else throw new Error('用户不存在')
  } else user = userdoc
  const token = 'Bearer ' + jwt.sign({
      _id: user._id,
      username: user.username
    },
    JWT_SECRET, {
      expiresIn: 3600 * 24
    }
  )
  return token
}

module.exports = {
  getUserObjectId,
  generateToken
}