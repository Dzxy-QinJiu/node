/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var UserAbnormalLoginApis = {
    //获取用户异常登录列表
    getUserAbnormalLogin: "/rest/base/v1/user/login/exception/list",
    ignoreAbnormalLogin: "/rest/base/v1/user/exception/ignore/:id"
};
exports.urls = UserAbnormalLoginApis;
// 获取用户异常登录列表
exports.getUserAbnormalLogin = function(req, res, obj){
    return restUtil.authRest.get({
        url: UserAbnormalLoginApis.getUserAbnormalLogin,
        req: req,
        res: res
    }, obj);
};

// 忽略异常登录地
exports.ignoreAbnormalLogin =  (req, res, id) => {
    return restUtil.authRest.post({
        url: UserAbnormalLoginApis.ignoreAbnormalLogin.replace(":id", id),
        req: req,
        res: res,
    }, null);
};
