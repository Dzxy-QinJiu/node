var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);

//获取销售人员列表
exports.getSalesmanList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: "/rest/base/v1/group/childgroupusers",
            req: req,
            res: res
        }, req.query);
};

