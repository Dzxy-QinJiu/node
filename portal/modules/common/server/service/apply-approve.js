/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
//上传超时时长
var uploadTimeOut = 5 * 60 * 1000;
let restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const EventEmitter = require('events').EventEmitter;
var restApis = {
    //添加外出申请
    addBusinessWhileApply: '/rest/base/v1/workflow/businesstripawhile',
    //通过或者驳回申请
    approveBusinessWhileApplyPassOrReject: '/rest/base/v1/workflow/businesstripawhile/approve',
    //修改外出申请的时间
    updateBusinessWhileCustomerTime: '/rest/base/v1/workflow/businesstripawhile/:id',
    //校验二级域名是否存在
    checkDomainExist: '/rest/customer/v3/customer/sub/domains',
    //添加销售机会申请
    addSalesOpportunityApply: '/rest/base/v1/workflow/businessopportunities',
    //通过或者驳回申请
    approveSalesOpportunityApplyPassOrReject: '/rest/base/v1/workflow/businessopportunities/approve',
    //添加出差申请
    addBusinessApply: '/rest/base/v1/workflow/businesstrip',
    //通过或者驳回出差申请
    approveBusinessApplyPassOrReject: '/rest/base/v1/workflow/businesstrip/approve',
    //修改出差申请的拜访时间
    updateVisitCustomerTime: '/rest/base/v1/workflow/businesstrip/:id',
    //添加请假申请
    addLeaveApply: '/rest/base/v1/workflow/leave',
    //通过或者驳回申请
    approveLeaveApplyPassOrReject: '/rest/base/v1/workflow/leave/approve',
    //添加舆情报送申请
    addReportSendApply: '/rest/base/v1/workflow/report/apply',
    //通过或者驳回申请
    approveOpinionreportApplyPassOrReject: '/rest/base/v1/workflow/opinionreport/approve',
    //添加文件撰写申请
    addDocumentWriteApply: '/rest/base/v1/workflow/document/apply',
    //文件撰写的通过或者驳回
    approveDocumentApplyPassOrReject: '/rest/base/v1/workflow/document/approve',
    //添加数据导出申请
    addDataServiceApply: '/rest/base/v1/workflow/eefung/dataservice/apply',
    //数据导出申请审批
    approveDataServiceApply: '/rest/base/v1/workflow/eefung/dataservice/approve',
    //数据导出申请文件的下载
    downLoadDataServiceFile: '/rest/base/v1/workflow/file/download',
    //上传文件
    uploadReportFile: '/rest/base/v1/workflow/file/upload',
    //下载相关文件
    downLoadReportFile: '/rest/base/v1/workflow/file/download',
    //删除相关文件
    delReportFile: '/rest/base/v1/workflow/file/delete',
    //清空所有未读
    clearAllUnread: '/rest/base/v1/workflow/comments/notice/unread/clear',
    //判断该审批是否是在最后一个节点
    checkApplyFinalTask: '/rest/base/v1/workflow/task/finished',
    //自定义流程的审批
    approveSelfSettingApply: '/rest/base/v1/workflow/customiz/approve',
};
exports.restUrls = restApis;
exports.getNextCandidate = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/next/candidates',
            req: req,
            res: res
        }, req.query);
};
exports.addNewCandidate = function(req, res) {
    return restUtil.authRest.post(
        {
            url: '/rest/base/v1/workflow/taskcandidateusers',
            req: req,
            res: res
        }, req.body);
};
exports.addUserApplyNewCandidate = function(req, res) {
    return restUtil.authRest.post(
        {
            url: '/rest/base/v1/message/apply/taskcandidateusers',
            req: req,
            res: res
        }, req.body);
};
//我审批过的申请列表
exports.getApplyListApprovedByMe = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/applylist/self/approved',
            req: req,
            res: res
        }, req.query);
};
//查询某个审批现在的节点位置
exports.getApplyTaskNode = function(req, res) {
    return restUtil.authRest.get(
        {
            url: '/rest/base/v1/workflow/task',
            req: req,
            res: res
        }, req.query);
};
//添加外出申请
exports.addBusinessWhileApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addBusinessWhileApply,
            req: req,
            res: res
        }, req.body);
};
function checkApplyFinalTask(req, res, applyId) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.get({
            url: restApis.checkApplyFinalTask + `?id=${applyId}`,
            req: req,
            res: res
        }, null, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}
function approveApplyPassOrReject(req, res, url) {
    return new Promise((resolve, reject) => {
        return restUtil.authRest.post({
            url: url,
            req: req,
            res: res
        }, req.body, {
            success: (emitter, data) => {
                resolve(data);
            },
            error: (eventEmitter, errorDesc) => {
                reject(errorDesc);
            }
        });
    });
}
function approveResultAndCheckLastNode(req,res,url){
    let emitter = new EventEmitter();
    approveApplyPassOrReject(req, res, url).then((approveFlag) => {
        //如果是驳回，或者撤销申请，不需要再查是否是最后一个节点了
        if(req.body.agree === 'pass'){
            checkApplyFinalTask(req, res, req.body.id).then((isFinalTask) => {
                emitter.emit('success', {approveFlag: approveFlag, isFinalTask: isFinalTask});
            }).catch((errorObj) => {
                emitter.emit('success', {approveFlag: approveFlag, isFinalTask: false});
            });
        }else{
            emitter.emit('success', {approveFlag: approveFlag, isFinalTask: true});
        }

    }).catch(() => {
        emitter.emit('error', {approveFlag: false, isFinalTask: false});
    });
    return emitter;
}

//批准或驳回审批
exports.approveBusinessWhileApplyPassOrReject = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveBusinessWhileApplyPassOrReject);
};
//批准或驳回审批
exports.approveBusinessApplyPassOrReject = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveBusinessApplyPassOrReject);
};
//自定义流程的申请审批
exports.approveSelfSettingApply = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveSelfSettingApply);
};
exports.updateBusinessWhileCustomerTime = function(req, res) {
    let bodyData = req.body;
    let applyId = bodyData.applyId;
    delete bodyData.applyId;
    return restUtil.authRest.put({
        url: restApis.updateBusinessWhileCustomerTime.replace(':id', applyId),
        req: req,
        res: res
    }, bodyData);
};
//校验二级域名是否存在
exports.checkDomainExist = (req, res) => {
    return restUtil.authRest.get(
        {
            url: restApis.checkDomainExist,
            req: req,
            res: res
        }, req.query);
};
//添加销售机会申请
exports.addSalesOpportunityApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addSalesOpportunityApply,
            req: req,
            res: res
        }, req.body);
};
//添加出差申请
exports.addBusinessApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addBusinessApply,
            req: req,
            res: res
        }, req.body);
};
//添加数据导出申请
exports.addDataServiceApply = function(req, res,formData) {
    return restUtil.authRest.post(
        {
            url: restApis.addDataServiceApply,
            req: req,
            res: res,
            formData: formData,
            timeout: uploadTimeOut,
        }, null);
};
//修改拜访客户的实际
exports.updateVisitCustomerTime = function(req, res) {
    let bodyData = req.body;
    let applyId = bodyData.applyId;
    delete bodyData.applyId;
    return restUtil.authRest.put({
        url: restApis.updateVisitCustomerTime.replace(':id', applyId),
        req: req,
        res: res
    }, bodyData);
};
//添加请假申请
exports.addLeaveApply = function(req, res) {
    return restUtil.authRest.post(
        {
            url: restApis.addLeaveApply,
            req: req,
            res: res
        }, req.body);
};
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
    return approveResultAndCheckLastNode(req,res,restApis.approveOpinionreportApplyPassOrReject);
};
exports.approveDocumentWriteApplyPassOrReject = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveDocumentApplyPassOrReject);
};
exports.approveDataServiceApply = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveDataServiceApply);
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
exports.downLoadDataServiceFile = function(req, res) {
    var fileObj = JSON.parse(req.params.fileObj);
    return restUtil.authRest.get({
        url: restApis.downLoadDataServiceFile + `?file_dir_id=${fileObj.file_dir_id}&file_id=${fileObj.file_id}&file_name=${encodeURI(fileObj.file_name)}`,
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
//批准或驳回审批
exports.approveLeaveApplyPassOrReject = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveLeaveApplyPassOrReject);
};
//批准或驳回审批
exports.approveSalesOpportunityApplyPassOrReject = function(req, res) {
    return approveResultAndCheckLastNode(req,res,restApis.approveSalesOpportunityApplyPassOrReject);
};
exports.clearAllUnread = function(req, res) {
    return restUtil.authRest.put(
        {
            url: restApis.clearAllUnread,
            req: req,
            res: res
        }, null);
};

