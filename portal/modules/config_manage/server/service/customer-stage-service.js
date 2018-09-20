/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/20.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

const CustomerStageRestApis = {
    cutomerStage: '/rest/customer/v2/customer/customer_conf'
};

//获取客户阶段列表
exports.getCustomerStage = function(req, res) {
    return restUtil.authRest.get({
        url: CustomerStageRestApis.cutomerStage,
        req: req,
        res: res
    }, null);
};
//添加客户阶段
exports.addCustomerStage = function(req, res, obj) {
    return restUtil.authRest.post({
        url: CustomerStageRestApis.cutomerStage,
        req: req,
        res: res
    }, [obj.product]);
};
//删除客户阶段
exports.deleteCustomerStage = function(req, res, stage) {
    return restUtil.authRest.del({
        url: CustomerStageRestApis.cutomerStage + '/' + encodeURI(stage),
        req: req,
        res: res
    }, null);
};
