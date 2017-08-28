/**
 * author:周连毅
 * 说明：统计分析-用户分析-用户构成 的路由配置
 */

module.exports = {
    //定义controller
    module: "notification/server/action/notification.action",
    //定义路由信息
    routes: [{
        //http方法
        "method": "get",
        //获取申请消息列表
        "path": "/rest/notification/applyfor",
        //action中的方法
        "handler": "getApplyForMessageList",
        //是否需要登录
        "passport": {
            "needLogin": true
        },
        //需要权限
        "privileges": []
    },{
        //http方法
        "method": "put",
        //清除未读数
        "path": "/rest/notification/unread_num/:type",
        //action中的方法
        "handler": "clearUnreadNum",
        //是否需要登录
        "passport": {
            "needLogin": true
        },
        //需要权限
        "privileges": []
    },{
        //http方法
        "method": "get",
        //获取申请消息、客户提醒未读数
        "path": "/rest/notification/unread_num",
        //action中的方法
        "handler": "getUnreadCount",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //获取客户提醒列表
        "path": "/rest/notification/customer",
        //action中的方法
        "handler": "getCustomerMessageList",
        //是否需要登录
        "passport": {
            "needLogin": true
        },
        //需要权限
        "privileges": []
    }]
};