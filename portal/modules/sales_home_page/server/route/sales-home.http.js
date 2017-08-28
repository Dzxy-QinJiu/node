/**
 * Created by wangliping on 2016/9/6
 * * 请求路径 - app
 */
require("../action/sales-home-controller");

module.exports = {
    module: "sales_home_page/server/action/sales-home-controller",
    routes: [{
        "method": "get",
        "path": "/rest/sales/customer",
        "handler": "getSalesCustomer",
        "passport": {
            "needLogin": true
        },
        "privileges": ["SALES_CUSTOMER_LIST"]
    }, {
        "method": "get",
        "path": "/rest/crm/sales_team_tree",
        "handler": "getSalesTeamTree",
        "passport": {
            "needLogin": true
        },
        "privileges": []
    }, {
        "method": "get",
        "path": '/rest/sales/phone/:type',
        "handler": "getSalesPhone",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        "path": '/rest/sales/user',
        "handler": "getSalesUser",
        "passport": {
            "needLogin": true
        },
        "privileges": ["SALES_USER_LIST"]
    }, {
        "method": "get",
        "path": '/rest/sales/contract',
        "handler": "getSalesContract",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "SALES_CONTRACT_LIST"
        ]
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
    }]
};