
module.exports = {
    module: "app_user_manage/server/action/third_app_detail.action",
    routes: [{
        "method": "post",
        "path": "/rest/thirdapp/add",
        "handler": "addApp",//添加app
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "THIRD_PARTY_MANAGE"
        ]
    },{
        "method": "put",
        "path": "/rest/thirdapp/edit",
        "handler": "editApp",//修改app
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "THIRD_PARTY_MANAGE"
        ]
    },{
        "method": "put",
        "path": "/rest/thirdapp/status",//修改app状态
        "handler": "changeAppStatus",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "THIRD_PARTY_MANAGE"
        ]
    },{
        "method": "get",
        "path": "/rest/thirdapp/query",//查询app详情
        "handler": "getAppDetail",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "THIRD_PARTY_MANAGE"
        ]
    },{
        "method": "get", // 获取用户绑定的第三方平台列表
        "path": "/rest/user/third/party/app/config/:user_id",
        "handler": "getAppConfigList",
        "passport": {
            "needLogin": true
        }
    },{
        "method": "get", // 获取用户绑定的第三方平台列表
        "path": "/rest/thirdapp/getPlatforms",
        "handler": "getPlatforms",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "THIRD_PARTY_MANAGE"
        ]
    }]
};