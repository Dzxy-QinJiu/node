/**
 * Created by wangliping on 2016/9/6
 * * 请求路径 - app
 */
require('../action/sales-home-controller');

module.exports = {
    module: 'sales_home_page/server/action/sales-home-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/sales/customer',
        'handler': 'getSalesCustomer',
        'passport': {
            'needLogin': true
        },
        'privileges': ['SALES_CUSTOMER_LIST']
    }, {//获取销售对应的通话状态
        'method': 'get',
        'path': '/rest/sales/call_status',
        'handler': 'getSalesCallStatus',
        'passport': {
            'needLogin': true
        },
        'privileges': ['CRM_USER_PHONE_STATUS']
    }, {
        'method': 'get',
        'path': '/rest/sales/phone',
        'handler': 'getSalesPhone',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/sales/user',
        'handler': 'getSalesUser',
        'passport': {
            'needLogin': true
        },
        'privileges': ['SALES_USER_LIST']
    }, {
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
            'GET_EXPIRE_USER_STATISTIC'
        ]
    }, {
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
        'method': 'post',
        'path': '/rest/setWebsiteConfig',
        'handler': 'setWebsiteConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_WEBSITE_CONFIG'
        ]
    },
    {
        'method': 'post',
        'path': '/rest/call_record/:type/:start_time/:end_time/:page_size/:sort_field/:sort_order',
        'handler': 'getCallBack',
        'passport': {
            'needLogin': true
        }
    }
    ]
};