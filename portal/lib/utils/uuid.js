var uuid = require("node-uuid");
module.exports = function(type) {
    type = type || 'v4';
    if(['v1','v4'].indexOf(type) === -1) {
        throw 'uuid type can be v1、v4,but you pass ' + type;
    }
    return uuid[type]();
};