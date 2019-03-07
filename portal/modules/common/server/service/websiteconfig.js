/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/6.
 */
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
//获取个人配置信息
exports.getWebsiteConfig = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/user/website/config',
            req: req,
            res: res
        }, null);
};