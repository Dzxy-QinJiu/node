var Alt = require('alt');
window.alt = new Alt();
var EventEmitter = require('events');
window.emitter = new EventEmitter();

require('./jquery.ajax.trans.js');
require('./jquery.ajax.global.js');
require('./browser.sniff.js');
