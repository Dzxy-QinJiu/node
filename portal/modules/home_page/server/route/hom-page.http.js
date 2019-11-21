/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
var homePagePrivilegeConst = require('../../public/privilege-const');
var crmPrivilegeConst = require('MOD_DIR/crm/public/privilege-const');
import analysisPrivilegeConst from '../../../analysis/public/privilege-const';

module.exports = {
    module: 'home_page/server/action/home-page-controller',
    routes: [{
        // 获取我的工作列表
        'method': 'get',
        'path': '/rest/home_page/my_works',
        'handler': 'getMyWorkList',
        'passport': {
            'needLogin': true
        },
        'privileges': [homePagePrivilegeConst.BASE_QUERY_PERMISSION_MEMBER]
    }, {
        // 获取我的工作类型列表
        'method': 'get',
        'path': '/rest/home_page/my_work_types',
        'handler': 'getMyWorkTypes',
        'passport': {
            'needLogin': true
        },
        'privileges': [homePagePrivilegeConst.BASE_QUERY_PERMISSION_MEMBER]
    }, {
        //修改我的工作状态
        'method': 'put',
        'path': '/rest/home_page/my_work/status',
        'handler': 'handleMyWorkStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': [homePagePrivilegeConst.BASE_OPERATE_PERMISSION]
    }, {
        // 获取业绩排名
        'method': 'get',
        'path': '/rest/contract/performance/:type',
        'handler': 'getContractPerformance',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            analysisPrivilegeConst.CRM_CONTRACT_SALES_REPORTS_COMMON,
            analysisPrivilegeConst.CRM_CONTRACT_SALES_REPORTS_MANAGER
        ]
    }, {//获取通话时长数据
        'method': 'get',
        'path': '/rest/call/time/data',
        'handler': 'getCallTimeData',
        'passport': {
            'needLogin': true
        },
        'privileges': [homePagePrivilegeConst.CURTAO_CRM_CALLRECORD_STATISTICS]
    }, {
        //获取联系的客户数
        'method': 'get',
        'path': '/rest/contact/customer/count/:type',
        'handler': 'getContactCustomerCount',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            crmPrivilegeConst.CUSTOMER_ALL,
            crmPrivilegeConst.CRM_LIST_CUSTOMERS
        ]
    }, {
        //获取我关注的数据
        'method': 'get',
        'path': '/rest/home_page/my_insterest',
        'handler': 'getMyInterestData',
        'passport': {
            'needLogin': true
        },
        'privileges': [crmPrivilegeConst.CRM_INTERESTED_CUSTOMER_INFO]
    }, {
        //修改我关注数据的状态
        'method': 'put',
        'path': '/rest/home_page/my_insterest/status',
        'handler': 'updateMyInterestStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': [crmPrivilegeConst.CRM_INTERESTED_CUSTOMER_INFO]
    }]
};