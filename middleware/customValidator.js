const expressValidator = require('express-validator');

const customValidator = expressValidator({
    errorFormatter: function(param, message, value) {
        return {
            param: param,
            message: message,
            value: value
        }
    },
    customValidators: {
        isEmail: function(value) {
            return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(value);
        },
        isPassword: function(value) {
            return /[a-zA-Z0-9]{8-16}/.test(value)
        },
        isString: function(value) {
            return typeof value === 'string';
        },
        isObject: function(value) {
            return (typeof value === 'object' && !Array.isArray(value));
        },
        isArray: function(value){
            return Array.isArray(value);
        },
        isBoolean: function(value) {
            return value === true || value === false;
        },
        custom: function(value, callback) {
            if(typeof value !== 'undefined') {
                callback(value);
                return true;
            } else {
                return false;
            }
        }
    }
})

module.exports = customValidator