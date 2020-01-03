/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
module.exports = {
    module: 'leave-apply/server/action/leave-apply-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/get/all/apply_approve/list',
            handler: 'getAllLeaveApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/worklist/apply_approve/list',
            handler: 'getWorklistLeaveApplyList',
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
            method: 'get',
            path: '/rest/get/apply_approve/comment/list',
            handler: 'getLeaveApplyComments',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/add/apply_approve/comment',
            handler: 'addLeaveApplyComments',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/leave_apply/submitApply',
            handler: 'approveLeaveApplyPassOrReject',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/leave_apply/status/byId',
            handler: 'getLeaveApplyStatusById',
            passport: {
                needLogin: true
            },
        }
    ]
};