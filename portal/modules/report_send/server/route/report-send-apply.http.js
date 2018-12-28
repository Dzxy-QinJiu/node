/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
module.exports = {
    module: 'report_send/server/action/report-send-apply-controller',
    routes: [
        {
            method: 'post',
            path: '/rest/add/opinionreport/list',
            handler: 'addReportSendApply',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/opinionreport/submitApply',
            handler: 'approveReportSendApplyPassOrReject',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/documentwrite/submitApply',
            handler: 'approveDocumentWriteApplyPassOrReject',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'post',
            path: '/rest/reportsend/upload',
            handler: 'uploadReportSend',
            passport: {
                'needLogin': true
            }
        },
        {
            method: 'get',
            path: '/rest/reportsend/download/:fileObj',
            handler: 'downLoadReportSend',
            passport: {
                'needLogin': true
            }
        },
        {
            method: 'delete',
            path: '/rest/applyapprove/delete',
            handler: 'deleteReportSend',
            passport: {
                'needLogin': true
            }
        }
    ]
};