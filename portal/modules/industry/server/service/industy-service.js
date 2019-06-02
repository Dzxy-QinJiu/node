'use strict';

const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

const IndustryRestApis = {
    //行业列表
    Industries: '/rest/base/v1/realm/config/industry'
};

exports.urls = IndustryRestApis;

//获取行业列表
exports.getIndustries = function(req, res, obj) {
    return restUtil.authRest.get({
        url: IndustryRestApis.Industries,
        req: req,
        res: res
    },{
        page_size: obj.page_size
    });
};
//添加行业信息
exports.addIndustries = function(req, res, obj) {
    return restUtil.authRest.post({
        url: IndustryRestApis.Industries,
        req: req,
        res: res
    },obj);
};
//删除行业信息
exports.deleteIndustries = function(req, res, delete_id) {
    return restUtil.authRest.del({
        url: IndustryRestApis.Industries + '/' + delete_id,
        req: req,
        res: res
    },null);
};