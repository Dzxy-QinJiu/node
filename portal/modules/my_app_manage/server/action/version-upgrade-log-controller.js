"use strict";

var  versionUpgradeLog = require("../service/version-upgrade-log-service");
var multiparty = require('multiparty');
var fs = require("fs");

// 获取版本升级内容列表
exports.getAppRecordsList = function (req, res) {
    var application_id = req.query.application_id;
    var page_size = req.query.page_size;
    var page_num = req.query.page_num;

    var queryObj = {
        application_id: application_id,
        page_size: page_size,
        page_num : page_num
    };
    versionUpgradeLog.getAppRecordsList(req, res, queryObj).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加版本升级日志的版本号和升级内容
exports.addAppVersion = function (req, res ) {
    versionUpgradeLog.addAppVersion(req, res, req.body).on("success", function (data) {
        res.status(200).json(true);
    }).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * 添加版本升级记录
 * */

exports.uploadVersionUpgrade = function(req, res){

    var form = new multiparty.Form();
    form.parse(req, function (err, fields, files) {
        if(files != undefined){
            // 获取上传文件的临时路径
            var tmpPath = files['apk'][0].path;
            // 获取文件名
            var filename = files['apk'][0].originalFilename;
            // 文件内容为空的处理
            var file_size = files['apk'][0].size;
            if(file_size == 0) {
                res.json(false);
                return;
            }
            // 文件不为空的处理
            var formData = {
                version: fields.version,
                content: fields.content,
                forced: fields.forced,
                application_id: fields.application_id,
                apk:{
                    value:fs.createReadStream(tmpPath),
                    options:{
                        filename: filename
                    }
                }
            };
            //调用上传请求服务
            versionUpgradeLog.uploadVersionUpgrade(req, res,formData)
                .on("success", function (data) {
                    res.status(200).json(data);
                    // 删除临时文件
                    fs.unlinkSync(tmpPath);
                })
                .on("error", function (err) {
                    res.status(500).json(false);
                    // 删除临时文件
                    fs.unlinkSync(tmpPath);
                });
        } else {
            res.status(500).json(false);
            return;
        }

    });
};

// 下载版本记录对应的apk文件
exports.getAppRecordFile = function (req, res) {
    var record_id = req.params.record_id;
    var obj = {
        record_id: record_id
    };
    versionUpgradeLog.getAppRecordFile(req, res, obj).on("error", function (codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || "apk文件下载失败");
    });
};

// 删除版本升级记录
exports.deleteAppVersionRecord = function(req, res){
    var record_id = req.params.record_id;
    versionUpgradeLog.deleteAppVersionRecord(req, res, record_id)
        .on("success", function (data) {
            res.status(200).json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        }
    );
    
};