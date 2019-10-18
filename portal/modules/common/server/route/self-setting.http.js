/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/20.
 */
module.exports = {
    module: 'common/server/action/self-setting',
    routes: [
        {
            method: 'post',
            path: '/rest/add/self_setting/work_flow',
            handler: 'addSelfSettingWorkFlow',
            passport: {
                needLogin: true
            },
        }, {
            method: 'put',
            path: '/rest/put/self_setting/work_flow',
            handler: 'editSelfSettingWorkFlow',
            passport: {
                needLogin: true
            },
        }, {
            method: 'delete',
            path: '/rest/delete/self_setting/work_flow/:id',
            handler: 'deleteSelfSettingWorkFlow',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/put/self_setting/work_flow/rules/:id',
            handler: 'saveSelfSettingWorkFlowRules',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/add/self_setting/apply',
            handler: 'addSelfSettingApply',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/approve/self_setting/apply',
            handler: 'approveSelfSettingApply',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/self_setting/work_flow',
            handler: 'getSelfSettingWorkFlow',
            passport: {
                needLogin: true
            },
        }
    ]
};