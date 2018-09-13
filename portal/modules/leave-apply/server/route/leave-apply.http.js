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
            path: '/rest/get/all/leave_apply/list',
            handler: 'getAllLeaveApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/self/leave_apply/list',
            handler: 'getSelfLeaveApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/worklist/leave_apply/list',
            handler: 'getWorklistLeaveApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/add/apply/list',
            handler: 'addLeaveApply',
            passport: {
                needLogin: true
            },
        }
    ]
};