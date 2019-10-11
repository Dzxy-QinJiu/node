
'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');

const restApis = {
    //校验二级域名是否存在
    checkDomainExist: '/rest/customer/v3/customer/sub/domains',
};
//校验二级域名是否存在
exports.checkDomainExist = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.checkDomainExist,
            req: req,
            res: res
        }, req.query);
};
