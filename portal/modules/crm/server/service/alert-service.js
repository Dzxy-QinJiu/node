var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);

var url = "/rest/customer/v2/customer/alert/";

//获取提醒列表
exports.getAlertList = function (req, res) {
    var customer_id = req.query.customer_id;
    var status = req.query.status;
    var page_size = req.query.page_size;
    return restUtil.authRest.get(
        {
            url: url + customer_id + "/" + status + "/" + page_size,
            req: req,
            res: res
        }, null);
};

//添加提醒
exports.addAlert = function (req, res) {
    var data = req.body;
    return restUtil.authRest.post(
        {
            url: url,
            req: req,
            res: res
        }, data);
};

//编辑提醒
exports.editAlert = function (req, res) {
    var data = req.body;
    return restUtil.authRest.put(
        {
            url: url,
            req: req,
            res: res
        }, data);
};

//删除提醒
exports.deleteAlert = function (req, res) {
    var data = req.body;
    return restUtil.authRest.del(
        {
            url: url + data.id,
            req: req,
            res: res
        }, data);
};

