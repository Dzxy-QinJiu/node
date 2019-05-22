/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/20.
 */
module.exports = {
    module: 'apply_approve_manage/server/action/apply_approve_manage_controller',
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
            method: 'put',
            path: '/rest/put/self_setting/work_flow/rules',
            handler: 'saveSelfSettingWorkFlowRules',
            passport: {
                needLogin: true
            },
        }
    ]
};