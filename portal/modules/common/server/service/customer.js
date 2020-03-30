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
        }, queryObj, {
            success: (emitter, result) => {
                // 处理已停用的产品，产品的状态是app_status字段，0 表示已停用
                let data = _.get(result, 'data', []);
                if (!_.isEmpty(data)) {
                    data = _.each(data, item => {
                        let apps = _.get(item, 'apps', []);
                        if (!_.isEmpty(apps)) {
                            apps = _.filter(apps, app => app.app_status);
                        }
                        item.apps = apps;
                    });
                }
                emitter.emit('success', result);
            },
            error: (emitter, errData) => {
                emitter.emit('error', errData);
            }
        });
};
