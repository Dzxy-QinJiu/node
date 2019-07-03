/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
const restLogger = require('../../../../lib/utils/logger').getLogger('rest');
const restUtil = require('ant-auth-request').restUtil(restLogger);

const homePageRestUrls = {
    getMyWorkList: '/rest/base/v1/notice/dailyjob',
    getMyWorkTypes: '/rest/base/v1/realm/dailyjob/types'
};

//获取我的工作列表
exports.getMyWorkList = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getMyWorkList,
            req: req,
            res: res
        }, req.query);
};

//获取我的工作类型
exports.getMyWorkTypes = function(req, res) {
    return restUtil.authRest.get(
        {
            url: homePageRestUrls.getMyWorkTypes,
            req: req,
            res: res
        });
};