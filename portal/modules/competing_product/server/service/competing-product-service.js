'use strict';
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

const CompetingProductRestApis = {
    CompetingProduct: '/rest/customer/v2/customer/competing_product'
};

//获取竞品列表
exports.getCompetingProduct = function(req, res) {
    return restUtil.authRest.get({
        url: CompetingProductRestApis.CompetingProduct,
        req: req,
        res: res
    }, null);
};
//添加竞品
exports.addCompetingProduct = function(req, res, obj) {
    return restUtil.authRest.post({
        url: CompetingProductRestApis.CompetingProduct,
        req: req,
        res: res
    }, [obj.product]);
};
//删除竞品
exports.deleteCompetingProduct = function(req, res, product) {
    return restUtil.authRest.del({
        url: CompetingProductRestApis.CompetingProduct + '/' + encodeURI(product),
        req: req,
        res: res
    }, null);
};