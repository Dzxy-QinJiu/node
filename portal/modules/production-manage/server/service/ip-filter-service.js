/**
 * Created by hzl on 2019/10/17.
 * IP配置的service
 */

'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const IpFilterRestApis = {
    IpFilterUrl: '/rest/base/v1/realm/config/ip' // IP路径（获取、添加和删除）
};

exports.urls = IpFilterRestApis;

// 获取IP
exports.getIpList = (req, res) => {
    return restUtil.authRest.get({
        url: IpFilterRestApis.IpFilterUrl,
        req: req,
        res: res
    }, req.query);
};

// 添加IP
exports.addIp = (req, res) => {
    return restUtil.authRest.post({
        url: IpFilterRestApis.IpFilterUrl,
        req: req,
        res: res
    }, req.body);
};

// 删除IP
exports.deleteIp = (req, res) => {
    return restUtil.authRest.del({
        url: IpFilterRestApis.IpFilterUrl + '/' + req.params.id,
        req: req,
        res: res
    }, null);
};
