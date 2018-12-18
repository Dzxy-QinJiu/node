/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;
var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var _ = require('lodash');
var restApis = {
    //添加舆情报送申请
    addReportSendApply: '/rest/base/v1/workflow/opinionreport/:type',
    //通过或者驳回申请
    approveOpinionreportApplyPassOrReject: '/rest/base/v1/workflow/opinionreport/approve',
    //文件撰写的通过或者驳回
    approveDocumentApplyPassOrReject: '/rest/base/v1/workflow/document/approve',
    //上传文件
    uploadReportFile: '/rest/base/v1/workflow/upload',
    //下载相关文件
    downLoadReportFile: '/rest/base/v1/workflow/download',
    //删除相关文件
    delReportFile: '/rest/base/v1/workflow/delete'

};
exports.restUrls = restApis;
//添加请假申请
exports.addReportSendApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addReportSendApply.replace(':type',req.params.type),
            req: req,
            res: res
        }, req.body);
};
//批准或驳回审批
exports.approveReportSendApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveOpinionreportApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
exports.approveDocumentWriteApplyPassOrReject = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.approveDocumentApplyPassOrReject,
            req: req,
            res: res
        }, req.body);
};
//上传舆情上报文件
exports.uploadReportSend = function(req, res, formData,id,filename) {
    return restUtil.authRest.post({
        url: restApis.uploadReportFile + '?id=' + id + '&doc_name=' + encodeURI(filename) ,
        req: req,
        res: res,
        timeout: uploadTimeOut,
        formData: formData
    }, null);
};

exports.downLoadReportSend = function(req, res) {
    // var fileObj = JSON.parse(req.query.reqData);
    var fileObj = JSON.parse(req.params.fileObj);
    return restUtil.authRest.get({
        url: restApis.downLoadReportFile + `?file_dir_id=${fileObj.file_dir_id}&file_id=${fileObj.file_id}&file_name=${encodeURI(fileObj.file_name)}`,
        req: req,
        res: res,
        headers: {
            'Accept': 'application/octet-stream'
        },
        'pipe-download-file': true
    }, null);
};
//删除相关文件
exports.deleteReportSend = function(req, res) {
    return restUtil.authRest.del(
        {
            url: restApis.delReportFile,
            req: req,
            res: res
        }, req.query);
};
