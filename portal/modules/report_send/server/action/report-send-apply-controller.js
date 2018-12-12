/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var ReportSendApplyService = require('../service/report-send-apply-service');
function handleNodata(data) {
    if (!data){
        data = {
            list: [],
            total: 0
        };
    }
    return data;
}
exports.addReportSendApply = function(req, res) {
    ReportSendApplyService.addReportSendApply(req, res).on('success', function(data) {
        data = handleNodata(data);
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.approveReportSendApplyPassOrReject = function(req, res) {
    ReportSendApplyService.approveReportSendApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};