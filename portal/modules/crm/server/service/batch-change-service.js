var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

//获取当前用户下属销售团队列表
exports.getGroupList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/group/child_groups',
            req: req,
            res: res
        }, null);
};

//客户批量操作
exports.doBatch = function(req,res) {
    let url = `/rest/customer/v3/customer/batch/${req.params.auth_type}/customer?type=${req.query.type}`;
    return restUtil.authRest.put({
        url: url,
        req: req,
        res: res
    } , req.body);
};

//获取推荐标签
exports.getRecommendTags = function(req, res) {
    var type = req.params.type;
    return restUtil.authRest.post(
        {
            url: `/rest/customer/v3/customer/term/${type}/field/labels`,
            req: req,
            res: res
        }, null);
};

//获取行业列表
exports.getIndustries = function(req,res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/realm/config/industry?page_size=1000',
            req: req,
            res: res
        });
};