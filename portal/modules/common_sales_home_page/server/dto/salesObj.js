/**
 * Created by wangliping on 2016/2/22.
 * 应用实体
 */
var _ = require("underscore");
exports.toFrontSalesPhone = function (data) {
    var salesPhone = {};
    if (data && _.isObject(data)) {
        salesPhone.salesRole = data.type;
        salesPhone.salesPhoneList = [];
        if (_.isArray(data.list) && data.list.length > 0) {
            salesPhone.salesPhoneList = data.list.map(function (salesObj) {
                return {
                    salesName: salesObj.name,//销售名称
                    totalTime: salesObj.total_time,//总时长
                    totalAnswer: salesObj.total_num,//总接通数
                    averageTime: parseInt(salesObj.average_time),//日均时长
                    averageAnswer: parseInt(salesObj.average_num),//日均接通数
                    callinCount: salesObj.total_callin,//呼入次数
                    callinSuccess: salesObj.total_callin_success,//成功呼入
                    callinRate:salesObj.callin_rate,//呼入接通率
                    calloutCount: salesObj.total_callout,//呼出次数
                    calloutSuccess: salesObj.total_callout_success,//成功呼出
                    calloutRate:salesObj.callout_rate//呼出接通率
                }
            });
        }
    }
    return salesPhone;
};

