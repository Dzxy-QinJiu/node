/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
'use strict';
import privilegeConst_common from '../../public/privilege-const';

module.exports = {
    module: 'common/server/action/apply-approve',
    routes: [{
        'method': 'get',
        'path': '/rest/get/apply/next/candidate',
        'handler': 'getNextCandidate',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.WORKFLOW_BASE_PERMISSION]
    }, {
        'method': 'post',
        'path': '/rest/add/apply/new/candidate',
        'handler': 'addNewCandidate',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.WORKFLOW_BASE_PERMISSION]

    }, {
        'method': 'post',
        'path': '/rest/add/userapply/new/candidate',
        'handler': 'addUserApplyNewCandidate',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.USERAPPLY_BASE_PERMISSION]
    }, {
        'method': 'get',
        'path': '/rest/get/myapproved/apply/list',
        'handler': 'getApplyListApprovedByMe',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.WORKFLOW_BASE_PERMISSION]
    }, {
        'method': 'get',
        'path': '/rest/get/apply/node',
        'handler': 'getApplyTaskNode',
        'passport': {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/add/businesswhile/apply',
        handler: 'addBusinessWhileApply',
        passport: {
            needLogin: true
        }
    }, {
        method: 'post',
        path: '/rest/business_while/submitApply',
        handler: 'approveBusinessWhileApplyPassOrReject',
        passport: {
            needLogin: true
        },
    }, {
        method: 'put',
        path: '/rest/update/customer/business/while',
        handler: 'updateBusinessWhileCustomerTime',
        passport: {
            needLogin: true
        },
    }, {
        method: 'get',
        path: '/rest/check/domain/name',
        handler: 'checkDomainExist',
        passport: {
            needLogin: true
        }
    }, {
        method: 'post',
        path: '/rest/add/sales_opportunity_apply/list',
        handler: 'addSalesOpportunityApply',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/add/apply/list',
        handler: 'addBusinessApply',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/add/data_service/list',
        handler: 'addDataServiceApply',
        passport: {
            needLogin: true
        },
    }, {
        method: 'put',
        path: '/rest/update/customer/visit/range',
        handler: 'updateVisitCustomerTime',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/add/leave_apply/list',
        handler: 'addLeaveApply',
        passport: {
            needLogin: true
        },
    }, {
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
    },{
        method: 'post',
        path: '/rest/business_trip/submitApply',
        handler: 'approveBusinessApplyPassOrReject',
        passport: {
            needLogin: true
        },
    },{
        method: 'post',
        path: '/rest/leave_apply/submitApply',
        handler: 'approveLeaveApplyPassOrReject',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/reportsend/upload',
        handler: 'uploadReportSend',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/reportsend/download/:fileObj',
        handler: 'downLoadReportSend',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'delete',
        path: '/rest/applyapprove/delete',
        handler: 'deleteReportSend',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/sales_opportunity_apply/submitApply',
        handler: 'approveSalesOpportunityApplyPassOrReject',
        passport: {
            needLogin: true
        },
    }, {
        method: 'put',
        path: '/rest/clear/all/unread',
        handler: 'clearAllUnread',
        passport: {
            needLogin: true
        },
    },
    ]
};
