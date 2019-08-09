/**
 * Created by hzl on 2019/8/2.
 */
'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const commonUrl = '/rest/customer/v3/salesprocess';
const _ = require('lodash');

const salesProcessRestApis = {
    getSalesProcess: commonUrl, // 获取销售流程
    addSalesProcess: commonUrl, // 添加销售流程
    updateSalesProcess: commonUrl + '/:property', // 更新销售流程
    deleteSalesProcess: commonUrl + '/:id', // 删除销售流程
    getCustomerStageBySaleProcessId: commonUrl + '/stage/:sales_process_id', // 根据销售流程id获取客户阶段
    addCustomerStage: commonUrl + '/stage/:sales_process_id', // 添加客户阶段
    editCustomerStage: commonUrl + '/stage/:sales_process_id', // 编辑客户阶段
    deleteCustomerStage: commonUrl + '/stage/:id', // 删除客户阶段
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
    let id = _.get(req, 'params.id');
    return restUtil.authRest.del(
        {
            url: salesProcessRestApis.deleteSalesProcess.replace(':id', id),
            req: req,
            res: res
        }, null);
};

// 根据销售流程id获取客户阶段
exports.getCustomerStageBySaleProcessId = (req, res) => {
    let id = _.get(req, 'params.id');
    return restUtil.authRest.get(
        {
            url: salesProcessRestApis.getCustomerStageBySaleProcessId.replace(':sales_process_id', id),
            req: req,
            res: res
        }, null);
};

// 添加客户阶段
exports.addCustomerStage = (req, res) => {
    let id = _.get(req, 'params.id');
    return restUtil.authRest.post(
        {
            url: salesProcessRestApis.addCustomerStage.replace(':sales_process_id', id),
            req: req,
            res: res
        }, req.body);
};

// 编辑客户阶段
exports.editCustomerStage = (req, res) => {
    let id = _.get(req, 'params.id');
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.editCustomerStage.replace(':sales_process_id', id),
            req: req,
            res: res
        }, req.body);
};

// 变更客户阶段顺序
exports.deleteCustomerStage = (req, res) => {
    let id = _.get(req, 'params.id');
    return restUtil.authRest.del(
        {
            url: salesProcessRestApis.deleteCustomerStage.replace(':id', id),
            req: req,
            res: res
        }, null);
};