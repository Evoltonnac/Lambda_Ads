const moment = require('moment')

module.exports.filter = (obj, predicate) => {
  let result = {},
    key;

  for (key in obj) {
    if (obj.hasOwnProperty(key) && predicate(key, obj[key])) {
      result[key] = obj[key];
    }
  }

  return result;
};

module.exports.monthRange = (month) => {
  const monthMoment = moment(month, 'YYYYMM')
  return [
    monthMoment.startOf('month').toDate(),
    monthMoment.endOf('month').toDate()
  ]
}