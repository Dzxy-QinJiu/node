/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前区域安全域分析 的路由配置
 */

module.exports = {
    //定义controller
    module: "oplate_bd_analysis_realm_zone/server/action/realm-zone-controller",
    //定义路由信息
    routes: [{
        //http方法
        "method": "get",
        //路径
        "path": "/rest/analysis/realm-zone",
        //action中的方法
        "handler": "getRealmZoneAnalysisData",
        //是否需要登录
        "passport": {
            "needLogin": true
        },
        //需要权限
        "privileges": [
            "OPLATE_BD_ANALYSIS_REALM_ZONE"
        ]
    }]
};