/**
 * 客服电话配置的路径
 * */
require('../action/tele-config-controller');

module.exports = {
    module: 'config_manage/server/action/tele-config-controller',
    routes: [
        {
            // 添加客服电话
            "method": "post",
            "path": "/rest/addTele",
            "handler": "addTele",
            "passport": {
                "needLogin": true
            },
            "privileges": [
                "CUSTOMER_INVALID_PHONE_ADD" // 添加客服电话权限
            ]
        }, {
            // 获取客服电话
            "method": "get",
            "path": "/rest/getTele",
            "handler": "getTele",
            "passport": {
                "needLogin": true
            },
            "privileges": [
                "CUSTOMER_INVALID_PHONE_GET" // 获取客服电话权限
            ]
        }, {
            // 删除客服电话
            "method": "delete",
            "path": "/rest/delTele",
            "handler": "delTele",
            "passport": {
                "needLogin": true
            },
            "privileges": [
                "CUSTOMER_INVALID_PHONE_DELETE" // 删除客服电话权限
            ]
        }
    ]
};