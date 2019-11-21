/**
 * Created by zhangshujuan on 2018/2/27.
 */
require('../action/sales-home-controller');
var commonSalesHomePrivilegeConst = require('../../public/privilege-const');
var crmPrivilegeConst = require('../../../crm/public/privilege-const');

module.exports = {
    module: 'common_sales_home_page/server/action/sales-home-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/commonsales/phone',
        'handler': 'getSalesPhone',
        'passport': {
            'needLogin': true
        },
        privileges: [commonSalesHomePrivilegeConst.CURTAO_CRM_CALLRECORD_STATISTICS]
    },{
        'method': 'post',
        'path': '/rest/contact_customer/:type/:pageSize/:pageNum/:sortFeild/:sortOrder',
        'handler': 'queryContactCustomer',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            crmPrivilegeConst.CRM_LIST_CUSTOMERS,
            crmPrivilegeConst.CUSTOMER_ALL
        ]
    },{
        'method': 'post',
        'path': '/rest/get_expire_customer/:type',
        'handler': 'getExpireCustomer',
        'passport': {
            'needLogin': true
        },
        privileges: [
            commonSalesHomePrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
            commonSalesHomePrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL
        ]
    }, {//获取线索客户
        method: 'post',
        path: '/rest/saleshome/v2/range/clue/:type/:pageSize/:sortField/:sortOrder',
        handler: 'getSalesClueList',
        passport: {
            needLogin: true
        },
        privileges: [
            commonSalesHomePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL,
            commonSalesHomePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF
        ]
    }]
};