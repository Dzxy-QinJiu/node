/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by wangliping on 2016/12/15.
 */
'use strict';
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
//获取全部和客户电话的列表（团队）
const callRecordListUrl = '/rest/callrecord/v2/callrecord/query/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order';
//获取全部和客户电话的列表（所有的，包括不在团队里的数据）
const managerCallRcordListUrl = '/rest/callrecord/v2/callrecord/query/manager/trace/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order';
//查询无效电话列表（客服和114）
const invalidCallRecordListUrl = '/rest/callrecord/v2/callrecord/query/invalid_trace/:type/call_date/:start_time/:end_time/:page_size/:sort_field/:sort_order';
const restApis = {
    // 编辑通话记录中跟进内容
    editCallTraceContent: '/rest/callrecord/v2/callrecord/trace',
    // 搜索电话号码号码时，提供推荐列表
    getRecommendPhoneList: '/rest/callrecord/v2/callrecord/terms/:page_size'
};

//获取全部和客户电话的列表
exports.getCallRecordList = function(req, res, params, filterObj, queryObj) {
    let url = params.type === 'manager' ? managerCallRcordListUrl : callRecordListUrl;
    url = url.replace(':start_time', params.start_time)
        .replace(':end_time', params.end_time)
        .replace(':page_size', params.page_size)
        .replace(':sort_field', params.sort_field)
        .replace(':sort_order', params.sort_order);
    if (queryObj) {
        if (queryObj.id) {
            url += '?id=' + queryObj.id;
            url += '&filter_phone=' + queryObj.filter_phone;// 是否过滤114电话号码
            url += '&filter_invalid_phone=' + queryObj.filter_phone;//是否过滤无效的电话号码（客服电话）
        }
        else {
            url += '?filter_phone=' + queryObj.filter_phone;
            url += '&filter_invalid_phone=' + queryObj.filter_phone;//是否过滤无效的电话号码（客服电话）
        }       
    }

    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, filterObj);
};

//查询无效电话列表（客服和114）
exports.getInvalidCallRecordList = function(req, res, params, filterObj, queryObj) {
    let url = invalidCallRecordListUrl.replace(':start_time', params.start_time)
        .replace(':type', params.type)
        .replace(':end_time', params.end_time)
        .replace(':page_size', params.page_size)
        .replace(':sort_field', params.sort_field)
        .replace(':sort_order', params.sort_order);

    if (queryObj) {
        if (queryObj.id) {
            url += '?id=' + queryObj.id;
            url += '&phone_type=' + queryObj.phone_type;
        }
        else {
            url += '?phone_type=' + queryObj.phone_type;
        }
    }
    
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, filterObj);
};

// 编辑通话记录中跟进内容
exports.editCallTraceContent = function(req, res, queryObj) {
    return restUtil.authRest.put(
        {
            url: restApis.editCallTraceContent,
            req: req,
            res: res
        }, queryObj);
};

// 搜索电话号码号码时，提供推荐列表
exports.getRecommendPhoneList = function(req, res, filterPhoneObj, filterObj) {

    let url = restApis.getRecommendPhoneList.replace(':page_size', '10');
    if (filterPhoneObj && filterPhoneObj.filter_phone) {
        url += '?filter_phone=' + filterPhoneObj.filter_phone;
    }
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, filterObj);
};