/**
 * Created by zhangshujuan on 2018/2/27.
 */
require("../action/sales-home-controller");
module.exports = {
    module: "sales_home_page/server/action/sales-home-controller",
    routes: [{
        "method": "get",
        "path": '/rest/sales/phone/:type',
        "handler": "getSalesPhone",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        "path": "/rest/expireuser",
        "handler": "getExpireUser",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "GET_EXPIRE_USER_STATISTIC"
        ]
    },{
        "method": "post",
        "path": "/rest/contact_customer/:pageSize/:sortFeild/:sortOrder",
        "handler": "queryContactCustomer",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            'CRM_LIST_CUSTOMERS'
        ]
    }, {
        "method": "post",
        "path": "/rest/get_recent_login_customer/:type",
        "handler": "getRecentLoginCustomer",
        "passport": {
            "needLogin": true
        },
    },{
        "method": "post",
        "path": "/rest/get_recent_login_customer_count/:type",
        "handler": "getRecentLoginCustomerCount",
        "passport": {
            "needLogin": true
        },
    },{
        "method": "post",
        "path": "/rest/get_will_expire_customer/:type",
        "handler": "getWillExpireCustomer",
        "passport": {
            "needLogin": true
        },
    },{
        "method": "post",
        "path": "/rest/get_new_distribute_customer",
        "handler": "getNewDistributeCustomers",
        "passport": {
            "needLogin": true
        },
    }]
};