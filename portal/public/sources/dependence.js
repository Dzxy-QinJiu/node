require('bootstrap/dist/css/bootstrap.min.css');
require('bootstrap/dist/js/bootstrap.min.js');
require('antd/dist/antd.min.css');
var Alt = require('alt');
window.alt = new Alt();
var EventEmitter = require('events');
window.emitter = new EventEmitter();

require('./jquery.ajax.trans.js');
require('./jquery.ajax.global.js');
require('./browser.sniff.js');
require('es6-shim');