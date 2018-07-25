'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);
const contractDto = require('../dto/contract');

const restApis = {
    // 根据客户id获取合同信息
    getContractByCustomerId: '/rest/contract/v2/contract/range/:page_size/:sort_field/:order',
    // 添加/更新 合同的url
    urlContract: '/rest/contract/v1/contract/:type'
};

exports.getContractByCustomerId = (req, res) => {
    let url = restApis.getContractByCustomerId;
    let params = req.params;
    return restUtil.authRest.post(
        {
            url: url.replace(':page_size', params.page_size).
                replace(':sort_field', params.sort_field).
                replace(':order', params.order),
            req: req,
            res: res
        }, JSON.parse(req.body.rangParams),{
            success: (eventEmitter, data) => {
                let list = [];
                //处理数据
                if (data && data.list && data.list.length) {
                    list = contractDto.toRestObject(data.list);
                }
                eventEmitter.emit('success', {list: list, total: data.total});
            },
            error: (eventEmitter, errorObj) => {
                eventEmitter.emit('error', errorObj.message);
            }
        });
};

// 添加合同
exports.addContract = (req, res) => {
    let url = restApis.urlContract;
    let params = req.params;
    return restUtil.authRest.post(
        {
            url: url.replace(':type', params.type),
            req: req,
            res: res
        }, req.body);
};