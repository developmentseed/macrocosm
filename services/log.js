var winston = require('winston');

// Uncomment to use file logs
/*
winston.add(winston.transports.File, {
  filename: 'SOMEFILE.log',

  // this is 10 mb
  maxsize: 10000000
});
*/

// Uncomment to use rotating-day file logs
/*
winston.add(winston.transports.DailyRotateFile, {
  filename: 'SOMEFILE.log',

  // Rotate to a new log file every day.
  datePattern: '.yy-MM-dd'
});
*/

module.exports = winston;
