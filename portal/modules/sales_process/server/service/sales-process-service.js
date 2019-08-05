/**
 * Created by hzl on 2019/8/2.
 */
'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const commonUrl = '/rest/customer/v3/salesprocess';

const salesProcessRestApis = {
    getSalesProcess: commonUrl, // 获取销售流程
    addSalesProcess: commonUrl, // 添加销售流程
    updateSalesProcess: commonUrl + '/:property', // 更新销售流程
    deleteSalesProcess: commonUrl + '/:id', // 删除销售流程
};

exports.urls = salesProcessRestApis;

// 获取销售流程
exports.getSalesProcess = (req, res) => {
    return restUtil.authRest.get(
        {
            url: salesProcessRestApis.getSalesProcess,
            req: req,
            res: res
        }, null);
};

// 添加销售流程
exports.addSalesProcess = (req, res) => {
    return restUtil.authRest.post(
        {
            url: salesProcessRestApis.addSalesProcess,
            req: req,
            res: res
        }, req.body);
};

// 更新销售流程
exports.updateSalesProcess = (req, res) => {
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.updateSalesProcess,
            req: req,
            res: res
        }, req.body);
};

// 删除销售流程
exports.deleteSalesProcess = (req, res) => {
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.deleteSalesProcess.replace(':id', 'req.params'),
            req: req,
            res: res
        }, req.body);
};