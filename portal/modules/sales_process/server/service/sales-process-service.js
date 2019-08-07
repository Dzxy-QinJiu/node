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
    getCustomerStageBySaleProcessId: commonUrl + '/stage/:sales_process_id', // 根据销售流程id获取客户阶段
    addCustomerStage: commonUrl + 'stage/:sales_process_id', // 添加客户阶段
    updateCustomerStage: commonUrl + 'stage/:sales_process_id', // 更新客户阶段
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

// 根据销售流程id获取客户阶段
exports.getCustomerStageBySaleProcessId = (req, res) => {
    return restUtil.authRest.get(
        {
            url: salesProcessRestApis.getCustomerStageBySaleProcessId.replace(':sales_process_id', 'req.params'),
            req: req,
            res: res
        }, null);
};

// 添加客户阶段
exports.addCustomerStage = (req, res) => {
    let sales_process_id = _.get(req.body, 'sales_process_id');
    return restUtil.authRest.post(
        {
            url: salesProcessRestApis.addCustomerStage.replace(':sales_process_id', sales_process_id),
            req: req,
            res: res
        }, req.body);
};

// 更新客户阶段
exports.updateCustomerStage = (req, res) => {
    let sales_process_id = _.get(req.body, 'sales_process_id');
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.updateCustomerStage.replace(':sales_process_id', sales_process_id),
            req: req,
            res: res
        }, req.body);
};