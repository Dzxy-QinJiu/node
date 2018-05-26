/**
 * 说明：统计分析-客户分析的service文件
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);

//定义url
var urls = {
    // 获取 统计总数
    getSummaryNumbers: '/rest/analysis/customer/v1/summary',
    // 获取具体统计数据
    getAnalysisData: '/rest/analysis/customer/v1/',
    // 获取当前登录用户在团队树中的位置
    getGroupPosition: '/rest/base/v1/group/position/',
    v2: {
        // 获取 统计总数
        getSummaryNumbers: '/rest/analysis/customer/v2/summary',
        getAllSummaryNumbers: '/rest/analysis/customer/v2/manager/summary',
        // 获取具体统计数据
        getAnalysisData: '/rest/analysis/customer/v2/',
        getAllAnalysisData: '/rest/analysis/customer/v2/manager/'
    }
};
//导出url
exports.urls = urls;

// 获取 统计总数
exports.getSummaryNumbers = function(req, res, queryParams) {
    let url = urls.getSummaryNumbers;
    if (queryParams.urltype == 'v2') {
        delete queryParams.urltype;
        if (queryParams.dataType == "all") {
            url = urls.v2.getAllSummaryNumbers;
        } else {
            url = urls.v2.getSummaryNumbers;
        }
        delete queryParams.dataType;
    }
    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, queryParams);
};

// 获取具体统计数据
exports.getAnalysisData = function(req, res, queryParams) {
    let url = urls.getAnalysisData;
    if (queryParams.urltype == 'v2') {
        delete queryParams.urltype;
        if (queryParams.dataType == "all") {
            url = urls.v2.getAllAnalysisData;
        } else {
            url = urls.v2.getAnalysisData;
        }
        delete queryParams.dataType;
    }
    return restUtil.authRest.get(
        {
            url: url + req.params.customerType + "/" + req.params.customerProperty,
            req: req,
            res: res
        }, queryParams);
};

// 获取当前登录用户在团队树中的位置
exports.getGroupPosition = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.getGroupPosition,
            req: req,
            res: res
        }, null);
};


