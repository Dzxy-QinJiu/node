var restLogger = require("../../../../lib/utils/logger").getLogger("rest");
var restUtil = require("ant-auth-request").restUtil(restLogger);

//座席号管理url抽取
var urls = {
    addPhoneOrder : "/rest/base/v1/realm/member/phoneorder", // 添加坐席号
    getPhoneOrderList: "/rest/base/v1/realm/member/phoneorders", // 获取座席号列表
    getUnbindMemberList: "/rest/base/v1/realm/phoneorder/unbound/members", // 获取未绑定座席号的成员列表
    updatePhoneOrder: '/rest/base/v1/realm/phoneorder/update', // 修改座席号
    memberBindPhoneOrder: '/rest/base/v1/realm/phoneorder/binding' // 成员绑定座席号
};
// 添加坐席号
exports.addPhoneOrder = function (req, res, reqBody) {
    return restUtil.authRest.post(
        {
            url: urls.addPhoneOrder,
            req: req,
            res: res
        }, reqBody);
};
// 获取电话座席号列表
exports.getPhoneOrderList = function(req, res, reqQuery) {
    return restUtil.authRest.get(
        {
            url: urls.getPhoneOrderList,
            req: req,
            res: res
        }, reqQuery);
};
// 获取未绑定座席号的成员列表
exports.getUnbindMemberList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: urls.getUnbindMemberList+"?realm=" + req.query.realm,
            req: req,
            res: res
        });
};
// 修改座席号
exports.updatePhoneOrder = function(req, res, phoneOrder) {
    return restUtil.authRest.put(
        {
            url: urls.updatePhoneOrder,
            req: req,
            res: res
        }, phoneOrder);
};
// 成员绑定座席号
exports.memberBindPhoneOrder = function(req, res, member) {
    return restUtil.authRest.put(
        {
            url: urls.memberBindPhoneOrder,
            req: req,
            res: res
        }, member);
};