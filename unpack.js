/*
 * this script will unpack the WordNet DB file at install-time
 * Usage: node unpack.js WNdb-3.1.tar.gz
 */
var log = console.log;

if (process.argv.length < 3) {
  log('Missing tar.gz file to extract.');
  process.exit(1);
}

var tarball = process.argv[2]
  , fs = require('fs')
  , tar = require('tar');

log('Extracting %s', tarball);

fs.createReadStream(tarball)
  .on('error', log)
  .on('end', log)
  .pipe(tar.extract({ path: __dirname }));
