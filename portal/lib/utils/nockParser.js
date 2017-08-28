var url = require("url");
var querystring = require("querystring");

//解析器
function Parser() {
    this.urlParam = '';
    this.req = '';
    this.body = '';
}
//设置url的param
Parser.prototype.setUrlParam = function (urlParam) {
    this.urlParam = urlParam;
    return this;
};
//设置request
Parser.prototype.setRequest = function (req) {
    this.req = req;
    return this;
};
//设置body
Parser.prototype.setBody = function (body) {
    this.body = body;
    return this;
};
//解析出req.query,req.param,req.body,req.param
Parser.prototype.parse = function () {
    //返回的结果
    var ret = {
        query: {},
        body: {},
        headers: {},
        param: {}
    };
    //解析query
    var urlInfo = url.parse(this.req.path);
    var queryStr = urlInfo.query || '';
    var queryObj = querystring.parse(queryStr);
    ret.query = queryObj;
    ret.body = this.body;
    //解析headers
    ret.headers = this.req.headers;
    //解析param
    var pathname = urlInfo.pathname.replace(/(^\/|\/$)/g, '');
    var parts = pathname.split(/\//g);
    //有urlParam的时候，只返回:开头的
    if (this.urlParam) {
        var urlParts = this.urlParam.replace(/(^\/|\/$)/g, '').split(/\//g);
        var param = {};
        for (var i = 0, len = urlParts.length; i < len; i++) {
            var part = urlParts[i];
            if (/^\:/.test(part)) {
                part = part.replace(/^\:/, '');
                param[part] = parts[i];
            }
        }
        ret.param = param;
    } else {
        ret.param = parts;
    }
    return ret;
};

module.exports = Parser;