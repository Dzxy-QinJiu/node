/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
// 跟进记录
var crmPrivilegeConst = require('../../public/privilege-const').default;

module.exports = {
    module: 'crm/server/action/customer-trace-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/customer/trace_type',//todo 这个后期需要移除，没有权限
            handler: 'getExtraTraceType',
            passport: {
                needLogin: true
            },
        },{
            method: 'post',
            path: '/rest/customer/get_customer_trace_list',
            handler: 'getCustomerTraceList',
            passport: {
                needLogin: true
            },
            privileges: [

            ]
        },{
            method: 'get',
            path: '/rest/customer/trace/statistic',
            handler: 'getCustomerTraceStatistic',
            passport: {
                needLogin: true
            },
            privileges: ['CURTAO_CRM_CALLRECORD_STATISTICS']
        },{
            method: 'post',
            path: '/rest/customer/add_customer_trace_list',
            handler: 'addCustomerTraceList',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CURTAO_CRM_TRACE_ADD]
        },{
            method: 'put',
            path: '/rest/customer/update_customer_trace_list',
            handler: 'updateCustomerTraceList',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_TRACE_UPDATE]
        },{
            method: 'get',
            path: '/record/*',
            handler: 'getPhoneRecordAudio',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.PHONE_ACCESS_CALL_OU]
        },{
            method: 'post',
            path: '/wechat/customer/visit',
            handler: 'visitCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CURTAO_CRM_TRACE_ADD]
        }]
};