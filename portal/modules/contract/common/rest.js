const querystring = require('querystring');
const restLogger = require('../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const routes = require('./route');
const _ = require('lodash');
const moment = require('moment');
const path = require('path');
//正则
import {pathParamRegex} from '../../../lib/utils/regex-util';

routes.forEach(route => {
    exports[route.handler] = function(req, res, next) {
        const queryStr = querystring.stringify(req.query);
        let url = queryStr ? route.path + '?' + queryStr : route.path;
        if(!_.isEmpty(req.params)) {
            url = url.replace(pathParamRegex,function($0,$1) {
                return req.params[$1];
            });
        }
        let data = req.body.reqData ? JSON.parse(req.body.reqData) : null;
        let method = route.method;
        if (method === 'delete') method = 'del';

        let options = {
            url: url,
            req: req,
            res: res
        };

        if (route.handler === 'uploadContractPreview') {
            options['pipe-upload-file'] = true;
            options['timeout'] = 5 * 60 * 1000;
        }

        const restRequest = restUtil.authRest[method](
            options,
            data
        );

        //没有next函数时，返回一个request对象，供调用者自己处理请求结果
        if (!next) return restRequest;

        restRequest.on('success', result => {
            res.json(result);
        })
            .on('error', codeMessage => {
                res.json(codeMessage);
            });
    };
});

