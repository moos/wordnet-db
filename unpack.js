/*
 * this script will unpack the WordNet DB file at install-time
 * Usage: node unpack.js WNdb-3.0.tar.gz
 * Requires build-it 'zlib' (node >= 0.6)
 */
var log = console.log;
if (process.argv.length < 3) {
  log('Missing tar.gz file to extract.');
  process.exit(1);
}

var tarball = process.argv[2]
  , fs = require("fs")
  , tar = require("tar")
  , zlib = require("zlib")

log("Extracting %s",tarball);

fs.createReadStream(tarball)
  .on("error", log)
  .pipe(zlib.Unzip())
  .pipe(tar.Extract({ path: __dirname }))
  .on("end", log);
