/**
 * IP配置的路径
 * */
require('../action/realm-config-controller');

module.exports = {
    module: 'config_manage/server/action/realm-config-controller',
    routes: [
        {
            "method": "get",
            "path": "/rest/getRealmStrategy",
            "handler": "getRealmStrategy",
            "passport": {
                "needLogin": true
            },
            "privileges": [
                "GET_CONFIG_PWD_STRATEGY" // 获取安全域密码策略
            ]
        }, {
            "method": "post",
            "path": "/rest/setRealmStrategy",
            "handler": "setRealmStrategy",
            "passport": {
                "needLogin": true
            },
            "privileges": [
                "CREATE_CONFIG_PWD_STRATEGY" // 设置安全域密码策略
            ]
        }
    ]
};