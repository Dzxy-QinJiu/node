/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
//用户在线统计api
var UserOnlineAnalysisApis = {
    //获取各个应用在线统计基本情况
    getOnlineAnalysisSummary : "/rest/analysis/v1/online/summary",
    //获取浏览器统计情况
    getBrowserAnalysis : "/rest/analysis/v1/online/browser",
    //获取地域统计情况
    getZoneAnalysis : "/rest/analysis/v1/online/zone"
};
//导出用户在线统计的api
exports.urls = UserOnlineAnalysisApis;
//获取各个应用在线统计基本情况
exports.getOnlineAnalysisSummary = function(req , res , page , pageSize) {
    return restUtil.authRest.get(
        {
            url: UserOnlineAnalysisApis.getOnlineAnalysisSummary + '/' + pageSize + '/' + page,
            req: req,
            res: res
        });
};
//获取浏览器信息
exports.getBrowserAnalysis = function(req, res , appId) {
    return restUtil.authRest.get(
        {
            url: UserOnlineAnalysisApis.getBrowserAnalysis + '/' + appId,
            req: req,
            res: res
        });
};
//获取地域信息
exports.getZoneAnalysis = function(req, res , appId) {
    return restUtil.authRest.get(
        {
            url: UserOnlineAnalysisApis.getZoneAnalysis + '/' + appId,
            req: req,
            res: res
        });
};