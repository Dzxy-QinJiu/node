/**
 * Created by zhangshujuan on 2018/2/27.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var salesObj = require('../dto/salesObj');
var Promise = require('bluebird');
var EventEmitter = require('events').EventEmitter;
var restApis = {
    //获取销售-电话列表
    getSalesPhone: '/rest/callrecord/v2/callrecord/query/:type/call_record/view',
    queryContactCustomer: '/rest/customer/v2/customer/range',//查询客户
    //过期或者即将到期的客户
    getExpiredCustomers: '/rest/analysis/customer/v2/statistic/:type/expire/customer',
    //查询线索 用户查询
    querySalesClue: '/rest/clue/v1/query/user',
};
exports.restUrls = restApis;
exports.getSalesClueList = function(req, res) {
    let queryObj = {};
    queryObj.query = JSON.parse(req.body.salesClueTypeFilter);
    if (req.body.unexist_fields){
        queryObj.unexist_fields = JSON.parse(req.body.unexist_fields);
    }
    let baseUrl = restApis.querySalesClue;
    baseUrl = baseUrl + '/' + req.params.pageSize + '/' + req.params.sortField + '/' + req.params.sortOrder;
    if (req.body.lastClueId) {
        baseUrl += '?id=' + req.body.lastClueId;
    }
    return restUtil.authRest.post(
        {
            url: baseUrl,
            req: req,
            res: res
        }, queryObj);
};

//获取销售-电话列表
exports.getSalesPhone = function(req, res, reqData, type) {
    return restUtil.authRest.get(
        {
            url: restApis.getSalesPhone.replace(':type', type),
            req: req,
            res: res
        }, reqData, {
            success: function(eventEmitter, data) {
                //处理数据
                var salesPhone = salesObj.toFrontSalesPhone(data);
                eventEmitter.emit('success', salesPhone);
            }
        });
};

// 获取今天联系的客户
exports.queryContactCustomer = function(req, res) {
    var url = restApis.queryContactCustomer;
    var queryObj = {};
    queryObj.rang_params = JSON.parse(req.body.rangParams);
    return restUtil.authRest.post({
        url: url + '/' + req.params.pageSize + '/' + req.params.sortFeild + '/' + req.params.sortOrder,
        req: req,
        res: res
    }, queryObj);
};

//获取过期或即将到期的客户
exports.getExpireCustomer = function(req, res) {
    var url = restApis.getExpiredCustomers;
    return restUtil.authRest.get({
        url: url.replace(':type', req.params.type),
        req: req,
        res: res
    }, req.body);
};
