var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var restApis = {
    //日程管理相关路径
    scheduleApis: "/rest/base/v1/schedule/",
};
exports.restUrls = restApis;
//获取日程管理列表
exports.getScheduleList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: `${restApis.scheduleApis}list`,
            req: req,
            res: res
        }, req.query);
};

//增加日程管理
exports.addSchedule = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.scheduleApis + req.body.scheduleType,
            req: req,
            res: res
        }, req.body);
};

//编辑日程管理
exports.editSchedule = function(req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.scheduleApis + req.params.scheduleId,
            req: req,
            res: res
        }, req.body);
};

//删除日程管理
exports.deleteSchedule = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.scheduleApis + req.body.id,
            req: req,
            res: res
        }, null);
};

//修改日程管理状态
exports.handleScheduleStatus = function(req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.scheduleApis + "handle/" + req.params.scheduleId + '/' + req.params.status,
            req: req,
            res: res
        }, null);
};
