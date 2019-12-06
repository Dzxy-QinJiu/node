/**
 * url定义
 */
var urls = {
    getCustomerSuggest: '/rest/customer/v3/customer/range/manager/10/1/start_time/descend',
    //获取客户开通的用户列表
    getCrmUserList: '/rest/base/v1/user/customer/users',
};
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var customerDto = require('../dto/customer');
var _ = require('lodash');
var transformUtils = require('../utils/transform-fields');
exports.getCustomerSuggest = function(req, res, q, fields) {
    return restUtil.authRest.post({
        url: urls.getCustomerSuggest,
        req: req,
        res: res
    }, {
        query: {
            name: q
        }
    }, {
        success: function(emitter, obj) {
            if (!_.isArray(obj.result)) {
                obj.result = [];
            }
            var responseList = obj.result.map(function(originCustomer) {
                return new customerDto.CustomerSuggest(originCustomer);
            });
            responseList = transformUtils.transformFields(responseList, fields);
            emitter.emit('success', responseList);
        }
    });
};
//获取客户的用户列表
exports.getCrmUserList = function(req, res, queryObj) {
    return restUtil.authRest.get(
        {
            url: urls.getCrmUserList,
            req: req,
            res: res
        }, queryObj);
};
