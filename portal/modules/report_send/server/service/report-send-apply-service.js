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
    addReportSendApply: '/rest/base/v1/workflow/report/apply',
    //添加文件撰写申请
    addDocumentWriteApply: '/rest/base/v1/workflow/document/apply',
    //通过或者驳回申请
    approveOpinionreportApplyPassOrReject: '/rest/base/v1/workflow/opinionreport/approve',
    //文件撰写的通过或者驳回
    approveDocumentApplyPassOrReject: '/rest/base/v1/workflow/document/approve',
    //上传文件
    uploadReportFile: '/rest/base/v1/workflow/file/upload',
    //下载相关文件
    downLoadReportFile: '/rest/base/v1/workflow/file/download',
    //删除相关文件
    delReportFile: '/rest/base/v1/workflow/file/delete'

};
exports.restUrls = restApis;
//添加申请
exports.addReportSendApply = function(req, res,formData) {
    return restUtil.authRest.post(
        {
            url: restApis.addReportSendApply,
            req: req,
            res: res,
            formData: formData,
            timeout: uploadTimeOut,
        }, null);
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
exports.uploadReportSend = function(req, res, formData,id) {
    var url = restApis.uploadReportFile;
    if (id){
        url += `?id=${id}`;
    }
    return restUtil.authRest.post({
        url: url,
        req: req,
        res: res,
        timeout: uploadTimeOut,
        formData: formData
    }, null);
};

exports.downLoadReportSend = function(req, res) {
    var fileObj = JSON.parse(req.params.fileObj);
    return restUtil.authRest.get({
        url: restApis.downLoadReportFile + `?file_dir_id=${fileObj.file_dir_id}&file_id=${fileObj.file_id}&file_name=${encodeURI(fileObj.file_name)}`,
        req: req,
        res: res,
        'pipe-download-file': true
    }, null);
};
//删除相关文件
exports.deleteReportSend = function(req, res) {
    var fileObj = req.body;
    return restUtil.authRest.del(
        {
            url: restApis.delReportFile + `?id=${fileObj.id}` + `&upload_id=${fileObj.upload_id}`,
            req: req,
            res: res
        }, null);
};
