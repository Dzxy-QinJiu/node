/**
 * author:周连毅
 * 说明：统计分析-安全域分析-当前安全域行业分析 的路由文件
 */
module.exports = {
    module: "oplate_bd_analysis_realm_industry/server/action/realm-industry-controller",
    routes: [{
        //http的get方法
        "method": "get",
        //http请求路径
        "path": "/rest/analysis/realm-industry",
        //controller中的处理方法
        "handler": "getRealmIndustryAnalysisData",
        //是否需要登录认证
        "passport": {
            "needLogin": true
        },
        //访问需要的权限
        "privileges": [
            "OPLATE_BD_ANALYSIS_REALM_INDUSTRY"
        ]
    }]
};