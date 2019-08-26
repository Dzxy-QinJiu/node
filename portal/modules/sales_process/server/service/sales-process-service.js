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
    changeCustomerStageOrder: commonUrl + '/stages', // 变更客户阶段顺序
    getCustomerStageSaleBehavior: commonUrl + '/stage/activity', // 获取客户阶段的销售行为
    addCustomerStageSaleBehavior: commonUrl + '/stage/:sales_process_id/:stage_id/sales_activities', // 添加客户阶段的销售行为
    getCustomerStageAutoConditions: commonUrl + '/stage/autoconditions', // 获取客户阶段的自动变更条件
    editCustomerStageAutoConditions: commonUrl + '/stage/:sales_process_id/:stage_id/auto_conditions', // 编辑客户阶段的自动变更条件（添加或是更新）
    changeAutoConditionsStatus: commonUrl + '/stage/:sales_process_id/:stage_id/auto_condition/:status' // 启/停用自动化条件
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
    let property = 'name'; // 修改名称
    let bodyParam = req.body;
    if (bodyParam.description) { // 修改描述
        property = 'description';
    } else if (bodyParam.status){ // 修改状态
        property = 'status';
    } else if (bodyParam.process_relate_entities ) { // 修改客户阶段适合范围
        property = 'process_relate_entities';
    }
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.updateSalesProcess.replace(':property', property),
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

// 删除客户阶段
exports.deleteCustomerStage = (req, res) => {
    let id = _.get(req, 'params.id');
    return restUtil.authRest.del(
        {
            url: salesProcessRestApis.deleteCustomerStage.replace(':id', id),
            req: req,
            res: res
        }, null);
};

// 变更客户阶段顺序
exports.changeCustomerStageOrder = (req, res) => {
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.changeCustomerStageOrder,
            req: req,
            res: res
        }, req.body);
};

// 获取客户阶段的销售行为
exports.getCustomerStageSaleBehavior = (req, res) => {
    return restUtil.authRest.get(
        {
            url: salesProcessRestApis.getCustomerStageSaleBehavior,
            req: req,
            res: res
        }, null);
};

// 添加客户阶段
exports.addCustomerStageSaleBehavior = (req, res) => {
    let processId = _.get(req, 'params.processId');
    let stageId = _.get(req, 'params.stageId');
    return restUtil.authRest.post(
        {
            url: salesProcessRestApis.addCustomerStageSaleBehavior.
                replace(':sales_process_id', processId).replace(':stage_id', stageId),
            req: req,
            res: res
        }, req.body);
};

// 获取客户阶段的自动变更条件
exports.getCustomerStageAutoConditions = (req, res) => {
    return restUtil.authRest.get(
        {
            url: salesProcessRestApis.getCustomerStageAutoConditions,
            req: req,
            res: res
        }, null);
};

// 编辑客户阶段的自动变更条件（添加或是更新）
exports.editCustomerStageAutoConditions = (req, res) => {
    const processId = _.get(req, 'params.processId');
    const stageId = _.get(req, 'params.stageId');
    return restUtil.authRest.post(
        {
            url: salesProcessRestApis.editCustomerStageAutoConditions.
                replace(':sales_process_id', processId).replace(':stage_id', stageId),
            req: req,
            res: res
        }, req.body);
};

// 启/停用自动化条件
exports.changeAutoConditionsStatus = (req, res) => {
    const processId = _.get(req, 'params.processId');
    const stageId = _.get(req, 'params.stageId');
    const status = _.get(req, 'params.status');
    return restUtil.authRest.put(
        {
            url: salesProcessRestApis.changeAutoConditionsStatus.
                replace(':sales_process_id', processId).replace(':stage_id', stageId).replace(':status', status),
            req: req,
            res: res
        }, req.body);
};