
exports.version = '3.1';	// this is the WordNet DB version
exports.path = require('path').join(__dirname, 'dict');
exports.files = require('fs').readdirSync(exports.path);
