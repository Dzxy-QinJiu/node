module.exports = {
    module: "common/server/action/app",
    routes: [{
        //根据当前用户数据权限，获取应用列表
        "method": "get",
        "path": "/rest/global/grant_applications",
        "handler": "getGrantApplications",
        "passport": {
            "needLogin": true
        },
        "privileges":[]
    },{
        //根据当前用户数据权限，获取“我的应用”列表
        "method": "get",
        "path": "/rest/global/my_applications",
        "handler": "getMyApplications",
        "passport": {
            "needLogin": true
        },
        "privileges":[]
    }]
};