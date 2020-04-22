const {
    validationResult
} = require('express-validator');

function validationHandler(req, res, next) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.json({
            errors: errors.array()
        });
    }
}

function errorHandler(err, req, res, next) {
    // 鉴权失败
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token')
    } else {
        res.send({
            error: err.message
        });
    }
}

module.exports = {
    validationHandler,
    errorHandler
}