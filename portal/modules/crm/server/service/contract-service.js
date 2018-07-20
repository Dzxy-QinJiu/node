'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

const restApis = {
    // 根据客户id获取合同信息
    getContractByCustomerId: '/rest/contract/v2/contract/range/:page_size/:sort_field/:order',
};

exports.getContractByCustomerId = (req, res) => {
    let url = restApis.getContractByCustomerId;
    let params = req.params;
    return restUtil.authRest.post(
        {
            url: url.replace(':page_size', params.page_size).
                replace(':sort_field', params.sort_field).
                replace(':order', params.order),
            req: req,
            res: res
        }, JSON.parse(req.body.rangParams));
};