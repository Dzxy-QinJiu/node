/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/6.
 */
var websiteConfigService = require('../service/websiteconfig');
exports.getWebsiteConfig = function(req, res) {
    websiteConfigService.getWebsiteConfig(req,res).on('success', function(data) {
        res.status(200).json(data || []);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};