'use strict';

var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const commonUrl = '/rest/contract/v2/';
const commonCommissionUrl = commonUrl + 'sales_commission';
const restApis = {
    getSalesCommissionList: commonCommissionUrl + '/range/:page_size/:sort_field/:order', // 销售提成列表
    updateSaleCommission: commonCommissionUrl, // 更新销售提成
    recalculateSaleCommission: '/rest/analysis/contract/commission/calculate', // 重新计算提成
    getSaleCommissionDetail: commonCommissionUrl + '/detail/:page_size/:sort_field/:order/:user_id', // 销售提成明细
    getContractDetail: commonUrl + 'contract/query/contract/:num' // 合同详情
};

// 销售提成列表
exports.getSalesCommissionList = (req, res) => {
    let params = req.params;
    let query = req.query;
    let url = restApis.getSalesCommissionList.replace(':page_size', params.page_size)
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
// 更新销售提成
exports.updateSaleCommission = (req, res) => {
    return restUtil.authRest.put(
        {
            url: restApis.updateSaleCommission,
            req: req,
            res: res
        }, req.body);
};
// 重新计算提成
exports.recalculateSaleCommission = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.recalculateSaleCommission,
            req: req,
            res: res
        }, req.query);
};
// 销售提成明细
exports.getSaleCommissionDetail = (req, res) => {
    let params = req.params;
    let queryObj = req.body;
    let url = restApis.getSaleCommissionDetail.replace(':page_size', params.page_size)
        .replace(':sort_field', params.sort_field)
        .replace(':order', params.order)
        .replace(':user_id', params.user_id);
    url += '?start_time=' + queryObj.start_time;
    url += '&end_time=' + queryObj.end_time;
    if (queryObj) {
        if (queryObj.id) {
            url += '&id=' + queryObj.id;
        }
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, null);
};

// 合同详情
exports.getContractDetail = (req, res) => {
    let params = req.params;
    let url = restApis.getContractDetail.replace(':num', params.num);
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, null);
};