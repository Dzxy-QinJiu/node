/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');

const homePageRestUrls = {
    getMyWorkList: '/rest/base/v1/notice/dailyjob',
    getMyWorkTypes: '/rest/base/v1/realm/dailyjob/types',
    handleMyWorkStatus: '/rest/base/v1/notice/dailyjob/status',
    getContractPerformance: '/rest/analysis/contract/contract/v2/:type/performance',
    getCallTimeData: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/total/ranking',
    queryCustomer: '/rest/customer/v3/customer/range/:type/1/1/id/descend',
    getMyInterestData: '/rest/customer/v3/interested',
    updateMyInterestStatus: '/rest/customer/v3/interested/:id',
};

//获取我的工作列表
exports.getMyWorkList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getMyWorkList,
            req: req,
            res: res
        }, req.query);
};

//获取我的工作类型
exports.getMyWorkTypes = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getMyWorkTypes,
            req: req,
            res: res
        });
};

//处理我的工作状态
exports.handleMyWorkStatus = function(req, res) {
    return restUtil.authRest.put(
        {
            url: homePageRestUrls.handleMyWorkStatus,
            req: req,
            res: res
        }, req.body);
};
//获取业绩排名
exports.getContractPerformance = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getContractPerformance.replace(':type', req.params.type),
            req: req,
            res: res
        }, req.query);
};
//获取通话时长数据
exports.getCallTimeData = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getCallTimeData,
            req: req,
            res: res
        }, req.query, {
            success: (eventEmitter, data) => {
                let salesPhoneList = _.get(data, 'result.call_view_total_list', []);
                eventEmitter.emit('success', salesPhoneList);
            }
        });
};
//获取已连续客户数
exports.getContactCustomerCount = function(req, res) {
    return restUtil.authRest.post(
        {
            url: homePageRestUrls.queryCustomer.replace(':type', req.params.type),
            req: req,
            res: res
        }, req.query);
};
//获取我关注的数据
exports.getMyInterestData = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getMyInterestData,
            req: req,
            res: res
        }, req.query);
};
//我关注的数据的处理
exports.updateMyInterestStatus = function(req, res) {
    return restUtil.authRest.put(
        {
            url: homePageRestUrls.updateMyInterestStatus.replace(':id', req.body.id),
            req: req,
            res: res
        });
};