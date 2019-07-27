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
    getCallTimeData: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
    queryCustomer: '/rest/customer/v3/customer/range/:type/1/1/id/descend',
    getMyInterestData: '/rest/customer/v3/interested/:page_num/:page_size',
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
                let salesPhoneList = _.map(_.get(data, 'result', []), function(salesObj) {
                    return {
                        salesName: salesObj.name,//销售名称
                        totalTime: salesObj.total_time,//总时长
                        totalAnswer: salesObj.total_num,//总接通数
                        averageTime: parseInt(salesObj.average_time),//日均时长
                        averageAnswer: parseInt(salesObj.average_num),//日均接通数
                        callinCount: salesObj.total_callin,//呼入次数
                        callinSuccess: salesObj.total_callin_success,//成功呼入
                        callinRate: salesObj.callin_rate,//呼入接通率
                        calloutCount: salesObj.total_callout,//呼出次数
                        calloutSuccess: salesObj.total_callout_success,//成功呼出
                        calloutRate: salesObj.callout_rate,//呼出接通率
                        effectiveCount: salesObj.total_effective,//有效接通数
                        effectiveTime: salesObj.total_effective_time,//有效通话时长
                    };
                });
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
            url: homePageRestUrls.getMyInterestData.replace(':page_num', req.query.page_num).replace(':page_size', req.query.page_size),
            req: req,
            res: res
        });
};
//我关注的数据的处理
exports.updateMyInterestStatus = function(req, res) {
    return restUtil.authRest.put(
        {
            url: homePageRestUrls.updateMyInterestStatus.replace(':id', req.query.id),
            req: req,
            res: res
        });
};