var wn = require('./index');
var crlf = require('crlf');
var path = require('path');
var bad = false;

// verify all dict\ files have LF line-ending
wn.files.forEach(function(file, index) {
  crlf.get(path.join(wn.path, file), null, function(err, endingType) {
    if (err) console.error(err);
    if (endingType !== 'LF') {
      console.log(' ✖', file, endingType);
      bad |= true;
    } else {
      console.log('✔', file, endingType)
    }

    if (index === wn.files.length - 1) {
      // done:
      process.exit(bad ? 1 : 0)
    }
  });
});
