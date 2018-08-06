const querystring = require('querystring');
const restLogger = require('../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const routes = require('./route');
const _ = require('lodash');

routes.forEach(route => {
    exports[route.handler] = function(req, res, next) {
        const queryStr = querystring.stringify(req.query);
        let url = queryStr ? route.path + '?' + queryStr : route.path;

        if (!_.isEmpty(req.params)) {
            url = url.replace(/\:([a-zA-Z_\-0-9]+)/g, function($0, $1) {
                let param = req.params[$1];
                if (param.indexOf('=') > -1) param = param.replace(/=/g, '/');
                if (param.indexOf('_null') > -1) param = '';
                return param;
            });
        }
        if (url.includes('/rest/base/v1')) {
            url = 'http://172.19.103.102:8391' + url;
        }
        let data = req.body.reqData ? JSON.parse(req.body.reqData) : null;
        let method = route.method;

        if (method === 'delete') method = 'del';

        let options = {
            url: url,
            req: req,
            res: res
        };

        if (req.query.timeout) options.timeout = req.query.timeout;


        const restRequest = restUtil.authRest[method](
            options,
            data
        );
        //使用特殊处理时，返回一个request对象，供调用者自己处理请求结果
        if (!next) {
            return restRequest;
        }

        restRequest.on('success', result => {
            res.status(200).json(result);
        })
            .on('error', codeMessage => {
                res.status(500).json(codeMessage);
            });
    };
});

