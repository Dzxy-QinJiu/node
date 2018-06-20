'use strict';

var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const commonUrl = '/rest/contract/v2/sales_commission/record';
const restApis = {
    getCommissionPaymentList: commonUrl + '/:page_size/:sort_field/:order' // 提成发放列表
};

// 提成发放列表
exports.getCommissionPaymentList = (req, res) => {
    let params = req.params;
    let query = req.query;
    let url = restApis.getCommissionPaymentList.replace(':page_size', params.page_size)
        .replace(':sort_field', params.sort_field)
        .replace(':order', params.order);
    if (query) {
        if (query.id) {
            url += '?id=' + query.id;
        }
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, req.body);
};