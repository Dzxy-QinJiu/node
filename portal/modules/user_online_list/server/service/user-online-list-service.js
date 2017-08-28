var restLogger = require("../../../../lib/utils/logger").getLogger("rest");
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);

//在线用户列表url抽取
var urls = {
    onlineUserList : "/rest/analysis/user/v1/online/list",
    onlineKickUser: '/rest/base/v1/user/grant/kickout'
};

//获取在线用户列表
exports.getOnlineUserList = function (req, res) {
    var pageSize = req.params.pageSize;
    var pageNum = req.params.pageNum;
    var condition = req.body;

    //预处理查询条件
    for (var item in condition) {
        if (condition[item] === "") {
            //值为空的去掉
            delete condition[item];
        }
    }

    return restUtil.authRest.post(
        {
            url: urls.onlineUserList + "/" + pageSize + "/" + pageNum,
            req: req,
            res: res
        }, condition, {
            success: function (eventEmitter, data) {
                eventEmitter.emit("success", data);
            }
        }
    );
};

//  踢出用户下线
exports.kickUser = function(req, res, ids){
    return restUtil.authRest.post(
        {
            url: urls.onlineKickUser,
            req: req,
            res: res
        }, ids);
};
