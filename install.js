/*
 * this script will install the WordNet DB file
 * Usage: node install.js
 * Requires build-it 'zlib' (node >= 0.6)
 */
var log = console.log;

var http = require('http')
  , fs = require("fs")
  , path = require("path")
  , tar = require("tar")
  , zlib = require("zlib")
  , mkdirp = require("mkdirp")
  , sourceUrl = 'http://wordnetcode.princeton.edu/wn3.1.dict.tar.gz'
  , tarball = path.basename(sourceUrl)
  , dest = __dirname
  , filter = /\.(adj|adv|noun|sense|verb)$/;


function cleanup(path) {
  if (!fs.existsSync(path)) {
    return;
  }
  if (fs.statSync(path).isDirectory()) {
    fs.readdirSync(path).forEach(function(file) {
      cleanup(path + "/" + file);
    });
    fs.rmdirSync(path);
  } else {
    fs.unlinkSync(path);
  }
}

function getProgress(total) {
  var progress = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });
  progress.setPrompt('', 0);

  progress.__current = 0;
  progress.__total = total;
  progress.__timer = null;

  progress.clear = function clear() {
    if(!process.stdout.isTTY) {
      return this;
    }

    this.write(null, {ctrl: true, name: 'u'});

    return this;
  };
  progress.start = function startProgress() {
    this.stop();
    this.__timer = setInterval((function (inst) { return function () { inst.render(); }; })(this), 100);

    return this;
  };
  progress.stop = function finalizeProgress() {
    if (this.__timer) {
      clearInterval(this.__timer);
      this.__timer = null;
    }

    progress.clear();

    return this;
  };
  progress.increment = function progressIncrement(value) {
    this.__current += value;
  };

  progress.render = function renderProgress() {
    if(!process.stdout.isTTY) {
      return this;
    }

    var ratio = (this.__current / this.__total * 100).toFixed(2);

    progress.clear().write("   ..." + this.__current + " / " + this.__total + " bytes (" + ratio + "%)");

    return this;
  };

  return progress;
}

function download() {
  log("* Downloading from %s", sourceUrl);
  cleanup(tarball);

  var file = fs.createWriteStream(tarball)
    .on("error", log)
    .on('finish', function() { file.close(); });

  var request = http.get(sourceUrl, function(response) {
    var progress = getProgress(parseInt(response.headers['content-length'], 10)).start();

    response
      .on('data', function(chunk) { progress.increment(chunk.length); })
      .on('end', function() { progress.stop().close(); })
      .on('end', extract)
      .pipe(file);
  });
}

function extract() {
  log("* Extracting %s",tarball);

  fs.createReadStream(tarball)
    .on("error", log)
    .pipe(zlib.Unzip())
    .pipe(tar.Parse())
    .on("end", function() {
      cleanup(tarball);
      log();
    })
    .on("entry", function(entry) {
      if (filter.test(entry.path)) {
        var fullpath = path.join(dest, entry.path);
        try {
          mkdirp.sync(path.dirname(fullpath));
          log("   ...", entry.path);
          entry.pipe(fs.createWriteStream(fullpath));
        } catch (e) {
          log("   ... ERROR!", err);
        }
      }
    });
}


log("Installing WordNet dictionaries...");
cleanup(__dirname + '/dict');
download();
