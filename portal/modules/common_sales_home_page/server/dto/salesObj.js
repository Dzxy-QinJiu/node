/**
 * Created by wangliping on 2016/2/22.
 * 应用实体
 */
var _ = require("underscore");
exports.toFrontSalesPhone = function(data) {
    var salesPhone = {};
    if (data && _.isObject(data)) {
        salesPhone.salesRole = data.type;
        salesPhone.salesPhoneList = [];
        if (_.isArray(data.list) && data.list.length > 0) {
            salesPhone.salesPhoneList = data.list.map(function(salesObj) {
                return {
                    totalTime: salesObj.total_time || 0,//总时长
                    calloutSuccess: salesObj.total_callout_success || 0,//成功呼出
                };
            });
        }
    }
    return salesPhone;
};

