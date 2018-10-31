const querystring = require('querystring');
const restLogger = require('../utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');

module.exports = function(req, res) {
    const queryStr = querystring.stringify(req.query);
    //去掉强制使用通用路由的标识
    const path = req.path.replace('/force_use_common_rest', '');

    let url = queryStr ? path + '?' + queryStr : path;

    if(!_.isEmpty(req.params)) {
        url = url.replace(/\:([a-zA-Z_\-0-9]+)/g,function($0,$1) {
            let param = req.params[$1];
            if (param.indexOf('=') > -1) param = param.replace(/=/g, '/');
            if (param.indexOf('_null') > -1) param = '';
            return param;
        });
    }

    let data = req.body.reqData ? JSON.parse(req.body.reqData) : null;
    let method = req.method.toLowerCase();

    if (method === 'delete') method = 'del';

    let options = {
        url: url,
        req: req,
        res: res
    };

    if (req.query.timeout) options.timeout = req.query.timeout;

    restUtil.authRest[method](
        options,
        data
    )
        .on('success', result => {
            res.status(200).json(result);
        })
        .on('error', codeMessage => {
            res.status(500).json(codeMessage && codeMessage.message);
        });
};

