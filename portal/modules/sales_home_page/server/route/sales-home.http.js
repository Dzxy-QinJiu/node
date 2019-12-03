/**
 * Created by wangliping on 2016/9/6
 * * 请求路径 - app
 */
require('../action/sales-home-controller');
var shpPrivilegeConst = require('../../public/privilege-const').default;

module.exports = {
    module: 'sales_home_page/server/action/sales-home-controller',
    routes: [{
        //接口已删除
        'method': 'get',
        'path': '/rest/sales/customer',
        'handler': 'getSalesCustomer',
        'passport': {
            'needLogin': true
        },
        'privileges': ['SALES_CUSTOMER_LIST']
    }, {//获取销售对应的通话状态,已删
        'method': 'get',
        'path': '/rest/sales/call_status',
        'handler': 'getSalesCallStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': [shpPrivilegeConst.CRM_USER_PHONE_STATUS]
    }, {
        'method': 'get',
        'path': '/rest/sales/phone',
        'handler': 'getSalesPhone',
        'passport': {
            'needLogin': true
        },
        privileges: [
            shpPrivilegeConst.CURTAO_CRM_CALLRECORD_STATISTICS
        ]
    }, {
        //接口已删除
        'method': 'get',
        'path': '/rest/sales/user',
        'handler': 'getSalesUser',
        'passport': {
            'needLogin': true
        },
        'privileges': ['SALES_USER_LIST']
    }, {
        //接口已删除
        'method': 'get',
        'path': '/rest/sales/contract',
        'handler': 'getSalesContract',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'SALES_CONTRACT_LIST'
        ]
    }, {
        'method': 'get',
        'path': '/rest/expireuser',
        'handler': 'getExpireUser',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            shpPrivilegeConst.GET_USER_STATISTIC_VIEW
        ]
    }, {
        //移到common
        'method': 'get',
        'path': '/rest/getWebsiteConfig',
        'handler': 'getWebsiteConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_WEBSITE_CONFIG'
        ]
    }, {
        //移到common
        'method': 'post',
        'path': '/rest/setWebsiteConfig',
        'handler': 'setWebsiteConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_WEBSITE_CONFIG'
        ]
    }, {
        //移到通话记录中
        'method': 'post',
        'path': '/rest/call_record/:type/:start_time/:end_time/:page_size/:sort_field/:sort_order',
        'handler': 'getCallBack',
        'passport': {
            'needLogin': true
        }
    }, { //批准或驳回审批
        method: 'post',
        path: '/rest/member_apply/apply',
        handler: 'approveMemberApplyPassOrReject',
        passport: {
            needLogin: true
        },
        privileges: [shpPrivilegeConst.MEMBER_INVITE_APPLY]
    }    
    ]
};