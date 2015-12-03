var log = require('./log.js');

// Module to split an array into nested arrays,
// each containing n items of the original array where n = interval.
module.exports = function(array, interval) {
  var interval = interval || 5000;
  var count = array.length;
  if (count === 0) {
    return [];
  }
  var chunks = count < interval ? [array] : Array.apply(null, {length: Math.ceil(count/interval)})
    .map(function(d, i) {
      var start = i * interval,
        end = start + interval > count ? count : start + interval;
      return array.slice(start, end);
    });
  log.info(count, 'entities divided into', chunks.length, 'chunks');
  return chunks;
};
