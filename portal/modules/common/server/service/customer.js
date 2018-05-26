/**
 * url定义
 */
var urls = {
    getCustomerSuggest: "/rest/customer/v2/customer/query/100/id/descend"
};
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var customerDto = require("../dto/customer");
var _ = require("underscore");
var transformUtils = require("../utils/transform-fields");
exports.getCustomerSuggest = function(req,res,q,fields) {
    return restUtil.authRest.post({
        url: urls.getCustomerSuggest,
        req: req,
        res: res
    },{
        name: q
    },{
        success: function(emitter,obj) {
            if(!_.isArray(obj.result)) {
                obj.result = [];
            }
            var responseList = obj.result.map(function(originCustomer) {
                return new customerDto.CustomerSuggest(originCustomer);
            });
            responseList = transformUtils.transformFields(responseList , fields);
            emitter.emit("success" , responseList);
        }
    });
};