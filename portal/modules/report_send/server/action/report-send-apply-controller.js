/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
var ReportSendApplyService = require('../service/report-send-apply-service');
const multiparty = require('multiparty');
const fs = require('fs');
const _ = require('lodash');
let BackendIntl = require('../../../../lib/utils/backend_intl');
exports.addReportSendApply = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        let receiveFiles = files['files'];
        let formData = {},newTmpPath = '';
        if (receiveFiles) {
            //可以是上传一个也可以是上传多个
            _.forEach(receiveFiles,(fileItem) => {
                let tmpPath = fileItem.path;
                newTmpPath = tmpPath;
                // 获取生成的文件名称
                var tempName = _.last(_.split(tmpPath, '\\'));
                // 获取文件名
                var filename = fileItem.originalFilename;
                newTmpPath = _.replace(newTmpPath, tempName, filename);
                fs.renameSync(tmpPath, newTmpPath);
                // 文件不为空的处理
                if (formData['files']){
                    formData['files'].push(fs.createReadStream(newTmpPath));
                }else {
                    formData['files'] = [fs.createReadStream(newTmpPath)];
                }
            });
        }
        _.forEach(fields, (value, key) => {
            formData[key] = _.get(value, '[0]');
        });
        try {
            //调用上传请求服务
            ReportSendApplyService.addReportSendApply(req, res, formData).on('success', function(data) {
                res.status(200).json(data);
            }).on('error', function(codeMessage) {
                res.status(500).json(codeMessage && codeMessage.message);
            });
        } catch (e) {
            if (newTmpPath){
                //删除文件
                fs.unlinkSync(newTmpPath);
            }
            console.log(JSON.stringify(e));
        }
    });

};

exports.approveReportSendApplyPassOrReject = function(req, res) {
    ReportSendApplyService.approveReportSendApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveDocumentWriteApplyPassOrReject = function(req, res) {
    ReportSendApplyService.approveDocumentWriteApplyPassOrReject(req, res).on('success', function(data) {
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
        let newTmpPath = tmpPath;
        // 获取生成的文件名称
        var tempName = _.last(_.split(tmpPath, '\\'));
        // 获取文件名
        var filename = files['reportsend'][0].originalFilename;
        newTmpPath = _.replace(newTmpPath, tempName, filename);
        //将文件路径重命名，避免多个人上传同一个文件的时候会发生rename错误的情况
        fs.rename(tmpPath, newTmpPath, (err) => {
            if (err) {
                res.json(false);
            } else {
                // 文件内容为空的处理
                let file_size = files['reportsend'][0].size;
                if (filename.indexOf(' ') >= 0) {
                    let backendIntl = new BackendIntl(req);
                    res.status(500).json(backendIntl.get('apply.approve.upload.no.container.space', '文件名称中不要含有空格！'));
                    return;
                }
                if (file_size === 0) {
                    res.json(false);
                    return;
                }
                var idArr = [];
                _.forEach(fields, (item) => {
                    idArr = _.concat(idArr, item);
                });
                // 文件不为空的处理
                let formData = {
                    docs: [fs.createReadStream(newTmpPath)]
                };
                //调用上传请求服务
                ReportSendApplyService.uploadReportSend(req, res, formData, idArr.join('')).on('success', function(data) {
                    res.json(data);
                }).on('error', function(err) {
                    res.status(500).json(err.message);
                });
            }
        });


    });
};
exports.downLoadReportSend = function(req, res) {
    ReportSendApplyService.downLoadReportSend(req, res).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.deleteReportSend = function(req, res) {
    ReportSendApplyService.deleteReportSend(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};