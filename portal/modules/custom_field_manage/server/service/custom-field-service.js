/**
 * Created by hzl on 2020/5/15.
 */

'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const _ = require('lodash');

const commonUrl = '/rest/base/v1/realm/customizedvar';

const restApis = {
    getCustomFieldConfig: commonUrl + '/configs', // 获取自定义参数配置
    addCustomFieldConfig: commonUrl + '/config', // 添加自定义参数配置
    updateCustomFieldConfig: commonUrl + '/config', // 修改自定义参数配置
    deleteCustomFieldConfig: commonUrl + '/config/:id', // 删除自定义参数配置,
    addItemCustomField: commonUrl + '/config/item/:id', // 自定义参数配置增加一条配置
    updateItemCustomField: commonUrl + '/config/item/:id', // 自定义参数配置修改一条配置
    deleteItemCustomField: commonUrl + '/config/item/:id/:key', // 自定义参数配置删除一条配置

};

// 获取自定义参数配置
exports.getCustomFieldConfig = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.getCustomFieldConfig,
            req: req,
            res: res
        }, req.query);
};

// 添加自定义参数配置
exports.addCustomFieldConfig = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.addCustomFieldConfig,
            req: req,
            res: res
        }, req.body);
};

//  修改自定义参数配置
exports.updateCustomFieldConfig = (req, res) => {
    return restUtil.authRest.put(
        {
            url: restApis.updateCustomFieldConfig,
            req: req,
            res: res
        }, req.body);
};

// 删除自定义参数配置
exports.deleteCustomFieldConfig = (req, res) => {
    return restUtil.authRest.del(
        {
            url: restApis.deleteCustomFieldConfig.replace(':id', req.params.id),
            req: req,
            res: res
        }, null);
};

// 添加一条自定义参数配置
exports.addItemCustomField = (req, res) => {
    return restUtil.authRest.post(
        {
            url: restApis.addItemCustomField.replace(':id', req.params.id),
            req: req,
            res: res
        }, req.body);
};

//  修改自定义参数配置
exports.updateItemCustomField = (req, res) => {
    return restUtil.authRest.put(
        {
            url: restApis.updateItemCustomField.replace(':id', req.params.id),
            req: req,
            res: res
        }, req.body);
};

// 删除一条自定义参数配置
exports.deleteItemCustomField = (req, res) => {
    return restUtil.authRest.del(
        {
            url: restApis.deleteItemCustomField.replace(':id', req.params.id).replace(':key', req.params.key),
            req: req,
            res: res
        }, null);
};