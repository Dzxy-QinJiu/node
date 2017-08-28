var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);

//获取当前用户下属销售团队列表
exports.getGroupList = function (req, res) {
    return restUtil.authRest.get(
        {
            url: "/rest/base/v1/group/child_groups",
            req: req,
            res: res
        }, null);
};

//客户批量操作
exports.doBatch = function (req,res) {
    return restUtil.authRest.put({
        url : "/rest/customer/v2/customer/batch/customer?type=" + req.query.type,
        req : req,
        res : res
    } , req.body);
};

//获取推荐标签
exports.getRecommendTags = function (req, res) {
    var pageSize = req.params.pageSize;
    var num = req.params.num;
    return restUtil.authRest.get(
        {
            url: "/rest/customer/v2/customer/label/proposal/" + pageSize + "/" + num,
            req: req,
            res: res
        }, null);
};

//获取行业列表
exports.getIndustries = function(req,res) {
    return restUtil.authRest.get(
        {
            url: "/rest/base/v1/realm/config/industry?page_size=1000",
            req: req,
            res: res
        });
};