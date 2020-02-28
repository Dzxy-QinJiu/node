/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
module.exports = {
    module: 'business-apply/server/action/business-apply-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/get/all/business_apply/list',
            handler: 'getAllBusinessApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/self/business_apply/list',
            handler: 'getSelfBusinessApplyList',
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
            method: 'get',
            path: '/rest/apply/detail/byId',
            handler: 'getApplyDetailById',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/business_trip/submitApply',
            handler: 'approveApplyPassOrReject',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/apply/status/byId',
            handler: 'getApplyStatusById',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/cancel/apply/approve',
            handler: 'cancelApplyApprove',
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
        }
    ]
};