/**
 * Created by zhangshujuan on 2018/2/27.
 */
require('../action/sales-home-controller');
module.exports = {
    module: 'common_sales_home_page/server/action/sales-home-controller',
    routes: [{
        'method': 'get',
        'path': '/rest/commonsales/phone/:type',
        'handler': 'getSalesPhone',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'post',
        'path': '/rest/contact_customer/:pageSize/:pageNum/:sortFeild/:sortOrder',
        'handler': 'queryContactCustomer',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_LIST_CUSTOMERS'
        ]
    },{
        'method': 'post',
        'path': '/rest/get_expire_customer/:type',
        'handler': 'getExpireCustomer',
        'passport': {
            'needLogin': true
        },
    }, {//获取线索客户
        method: 'post',
        path: '/rest/saleshome/v2/range/clue/:pageSize/:sortField/:sortOrder',
        handler: 'getSalesClueList',
        passport: {
            needLogin: true
        }
    }]
};