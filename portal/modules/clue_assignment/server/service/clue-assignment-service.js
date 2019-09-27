/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng 2019/09/11.
 */
'use strict';
let restLogger = require('../../../../lib/utils/logger').getLogger('rest');
let restUtil = require('ant-auth-request').restUtil(restLogger);
let _ = require('lodash');

const restApis = {
    //保存线索分配策略
    saveClueAssignmentStrategy: '/rest/rule/sales_auto/lead',
    //编辑线索分配策略
    editClueAssignmentStrategy: '/rest/rule/sales_auto/lead',
    //删除线索分配策略
    deleteClueAssignmentStrategy: '/rest/rule/sales_auto/lead/:id',
    //获取线索分配策略列表
    getClueAssignmentStrategies: '/rest/rule/sales_auto/lead/:page_size'
};

//保存线索分配策略
exports.saveClueAssignmentStrategy = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.saveClueAssignmentStrategy,
            req: req,
            res: res
        }, req.body);
};
//编辑线索分配策略
exports.editClueAssignmentStrategy = function(req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.editClueAssignmentStrategy,
            req: req,
            res: res
        }, req.body);
};
//删除线索分配策略
exports.deleteClueAssignmentStrategy = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.deleteClueAssignmentStrategy.replace(':id',req.params.id),
            req: req,
            res: res
        }, req.body);
};
//获取线索分配策略列表
exports.getClueAssignmentStrategies = function(req, res) {
    let body = _.get(req, 'body.requestBody', {});
    let sortId = _.get(req, 'body.sortId', '');
    let url = restApis.getClueAssignmentStrategies.replace(':page_size', req.params.page_size);
    if(!_.isEmpty(sortId)) {
        url += (`?sort_id=${sortId}`);
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, body);
};