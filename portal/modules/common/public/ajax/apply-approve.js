/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
var trans = $.ajaxTrans();
trans.register('candidateList', {url: '/rest/get/apply/next/candidate', type: 'get'});
trans.register('transferNextCandidate', {url: '/rest/add/apply/new/candidate', type: 'post'});
trans.register('transferUserApplyNextCandidate', {url: '/rest/add/userapply/new/candidate', type: 'post'});
trans.register('getMyUserApplyWorkList', {url: '/rest/get/userapply/worklist', type: 'get'});
exports.getNextCandidate = function(reqParams) {
    return trans.getAjax('candidateList', reqParams);
};
exports.transferNextCandidate = function(reqParams) {
    return trans.getAjax('transferNextCandidate', reqParams);
};
//转出用户申请的审批
exports.transferUserApplyNextCandidate = function(reqParams) {
    return trans.getAjax('transferUserApplyNextCandidate', reqParams);
};
exports.getMyUserApplyWorkList = function(reqParams) {
    return trans.getAjax('getMyUserApplyWorkList', reqParams);
};