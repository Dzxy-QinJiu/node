module.exports = {
    module: "common/server/action/organization",
    routes: [{
        //获取组织列表
        "method": "get",
        "path": "/rest/global/organization_list",
        "handler": "getOrganizationList",
        "passport": {
            "needLogin": true
        },
        "privileges":[]
    },{
        //获取组织列表
        "method": "put",
        "path": "/rest/global/organization/:user_id/:group_id",
        "handler": "changeOrganization",
        "passport": {
            "needLogin": true
        },
        "privileges":[]
    }]
};