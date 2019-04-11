var _ = require('lodash');

// 通话分析中的数据的转换
exports.toFrontCallAnalysis = function(data) {
    var callInfo = {};
    if (data && _.isObject(data)) {
        callInfo.salesPhoneList = [];
        if (_.isArray(data.result) && data.result.length > 0) {
            callInfo.salesPhoneList = data.result.map( (salesObj) => {
                return {
                    name: salesObj.name,//销售或者团队名称
                    totalTime: salesObj.total_time || 0,//总时长
                    totalAnswer: salesObj.total_num || 0,//总接通数
                    averageTime: parseInt(salesObj.average_time || 0),//日均时长
                    averageAnswer: parseInt(salesObj.average_num || 0),//日均接通数
                    callinCount: salesObj.total_callin || 0,//呼入次数
                    callinSuccess: salesObj.total_callin_success || 0,//成功呼入
                    callinRate: salesObj.callin_rate || 0,//呼入接通率
                    calloutCount: salesObj.total_callout || 0,//呼出次数
                    calloutSuccess: salesObj.total_callout_success || 0,//成功呼出
                    calloutRate: salesObj.callout_rate || 0,//呼出接通率
                    effectiveCount: salesObj.total_effective,//有效接通数
                    effectiveTime: salesObj.total_effective_time,//有效通话时长
                };
            });
        }
    }
    return callInfo;
};