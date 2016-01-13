module.exports = function (val) {
  if (val != null && !Array.isArray(val)) {
    return [val];
  }

  return val;
}
