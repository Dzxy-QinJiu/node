var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
var restApis = {
    //日程管理相关路径
    scheduleApis: "/rest/base/v1/schedule/",
};
exports.restUrls = restApis;
var _ = require("underscore");
//获取日程管理列表
exports.getScheduleList = function (req, res) {
    var url = restApis.scheduleApis;
    if (req.query && req.query.page_size){
        url = url + "list" + "?page_size="  + req.query.page_size;
        if (req.query && req.query.customer_id){
            url = url + "&customer_id=" + req.query.customer_id;
        }
        if (req.query && req.query.start_time){
            url = url + "&start_time=" + req.query.start_time;
        }
        if (req.query && req.query.end_time){
            url = url + "&end_time=" + req.query.end_time;
        }
        if (req.query && req.query.sort_field){
            url = url + "&sort_field=" + req.query.sort_field;
        }
        if (req.query && req.query.order){
            url = url + "&order=" + req.query.order;
        }
        if (req.query && (_.isBoolean(req.query.status) || req.query.status)){
            url = url + "&status=" + req.query.status;
        }
        if (req.query && req.query.id){
            url = url + "&id=" + req.query.id;
        }
        if (req.query && req.query.type){
            url = url + "&type=" + req.query.type;
        }
    }

    return restUtil.authRest.get(
        {
            url: url,
            req: req,
            res: res
        }, null);
};
//修改日程管理状态
exports.handleScheduleStatus = function (req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.scheduleApis + "handle/" + req.params.scheduleId + '/' + req.params.status,
            req: req,
            res: res
        }, null);
};















//增加日程管理
exports.addSchedule = function (req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.scheduleApis + req.body.scheduleType,
            req: req,
            res: res
        }, req.body);
};

//编辑日程管理
exports.editSchedule = function (req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.scheduleApis + req.params.scheduleId,
            req: req,
            res: res
        }, req.body);
};

//删除日程管理
exports.deleteSchedule = function (req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.scheduleApis + req.body.id,
            req: req,
            res: res
        }, null);
};


