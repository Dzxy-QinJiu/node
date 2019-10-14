/**
 * Created by hzl on 2019/10/14.
 */
'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

const commonUrl = '/rest/base/v1/realm/';

const ClueIntegrationRestApis = {
    getIntegrationList: commonUrl + 'integration/list',//获取线索集成列表
    createClueIntegration: commonUrl + 'salesleadcollector', //创建销售线索收集产品
    deleteClueIntegration: commonUrl + 'integration/service/:id', // 删除数据集成服务
    changeClueIntegration: commonUrl + 'integration/service' // 修改数据集成服务
};

exports.urls = ClueIntegrationRestApis;

//获取线索集成列表
exports.getIntegrationList = (req, res) => {
    return restUtil.authRest.get({
        url: ClueIntegrationRestApis.getIntegrationList,
        req: req,
        res: res
    },req.query);
};

// 创建销售线索收集产品
exports.createClueIntegration = (req, res) => {
    return restUtil.authRest.post({
        url: ClueIntegrationRestApis.createClueIntegration,
        req: req,
        res: res
    },req.body);
};

// 删除数据集成服务
exports.deleteClueIntegration = (req, res) => {
    let id = _.get(req.query, 'id');
    return restUtil.authRest.del({
        url: ClueIntegrationRestApis.deleteClueIntegration.replace(':id',id),
        req: req,
        res: res
    }, null);
};

// 修改数据集成服务
exports.changeClueIntegration = (req, res) => {
    return restUtil.authRest.put({
        url: ClueIntegrationRestApis.changeClueIntegration,
        req: req,
        res: res
    }, req.body);
};