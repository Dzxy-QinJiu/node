/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var UserChangeRecordApis = {
    //获取用户详细变更记录
    getUserChangeRecord: '/rest/base/v1/user/timeline',
};
exports.urls = UserChangeRecordApis;
// 获取用户详细变更记录
exports.getUserChangeRecord = function(req, res, obj){
    return restUtil.authRest.get({
        url: UserChangeRecordApis.getUserChangeRecord,
        req: req,
        res: res
    }, obj);
};