/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var ReportSendApplyService = require('../service/report-send-apply-service');
const multiparty = require('multiparty');
const fs = require('fs');
const _ = require('lodash');
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

exports.uploadReportSend = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        // 获取上传文件的临时路径
        let tmpPath = files['reportsend'][0].path;
        // 获取文件名
        var filename = files['reportsend'][0].originalFilename;
        // 文件内容为空的处理
        let file_size = files['reportsend'][0].size;
        if(file_size === 0) {
            res.json(false);
            return;
        }
        var idArr = [];
        _.forEach(fields,(item) => {
            idArr = _.concat(idArr,item);
        });
        // 文件不为空的处理
        var formData = {
            doc: {
                value: fs.createReadStream(tmpPath),
                options: {
                    filename: filename
                }
            },
            id: idArr.join('')
        };

        //调用上传请求服务
        ReportSendApplyService.uploadReportSend(req, res,formData ).on('success', function(data) {
            res.json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
    });


};