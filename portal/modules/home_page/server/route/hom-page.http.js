/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
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
        'privileges': []
    }, {
        // 获取我的工作类型列表
        'method': 'get',
        'path': '/rest/home_page/my_work_types',
        'handler': 'getMyWorkTypes',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //修改我的工作状态
        'method': 'put',
        'path': '/rest/home_page/my_work/status',
        'handler': 'handleMyWorkStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': ['ORGANIZATION_BASE_PERMISSION']
    }, {
        // 获取业绩排名
        'method': 'get',
        'path': '/rest/contract/performance/:type',
        'handler': 'getContractPerformance',
        'passport': {
            'needLogin': true
        },
        'privileges': ['CURTAO_SALES_REPORTS_MANAGER', 'CURTAO_SALES_REPORTS_COMMON']
    }, {//获取通话时长数据
        'method': 'get',
        'path': '/rest/call/time/data',
        'handler': 'getCallTimeData',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        //获取联系的客户数
        'method': 'get',
        'path': '/rest/contact/customer/count/:type',
        'handler': 'getContactCustomerCount',
        'passport': {
            'needLogin': true
        },
        'privileges': ['CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL']
    }]
};