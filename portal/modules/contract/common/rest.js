const querystring = require('querystring');
const fs = require('fs');
const multiparty = require('multiparty');
const restLogger = require('../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const routes = require('./route');
const _ = require('lodash');
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

        //如果是上传合同
        if (route.handler === 'uploadContractPreview') {
            options['timeout'] = 5 * 60 * 1000;
            const form = new multiparty.Form();

            form.parse(req, function(err, fields, files) {
                const file = files.contracts[0].path;
                //multiple value 类型的参数需要放到options.formData中向后端传递
                options.formData = {
                    attachments: [fs.createReadStream(file)]
                };

                doRequest(null, () => {
                    fs.unlink(file, err => {
                        if (err) throw err;
                    });
                });
            })
        } else {
            return doRequest(data);
        }

        function doRequest(data, cb) {
            const restRequest = restUtil.authRest[method](
                options,
                data
            );

            //没有next函数时，返回一个request对象，供调用者自己处理请求结果
            if (!next) return restRequest;

            restRequest.on('success', result => {
                res.status(200).json(result);
                if (cb) cb();
            }).on('error', codeMessage => {
                res.status(500).json(codeMessage && codeMessage.message);
                if (cb) cb();
            });
        }
    }
});
