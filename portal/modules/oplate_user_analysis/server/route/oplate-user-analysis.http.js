/**
 * author:周连毅
 * 说明：统计分析-用户分析 的路由配置
 */

module.exports = {
    //定义controller
    module: "oplate_user_analysis/server/action/oplate-user-analysis.action",
    //定义路由信息
    routes: [{
        //http方法
        "method": "get",
        //路径 获取 统计数字（总用户、新增用户、过期用户、新增过期用户）
        "path": "/rest/analysis/user/summary",
        //action中的方法
        "handler": "getSummaryNumbers",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取总用户的用户统计
        "path": "/rest/analysis/user/total/summary",
        //action中的方法
        "handler": "getTotalSummary",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增用户的用户统计
        "path": "/rest/analysis/user/added/summary",
        //action中的方法
        "handler": "getAddedSummary",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取过期用户的用户统计
        "path": "/rest/analysis/user/expired/summary",
        //action中的方法
        "handler": "getExpiredSummary",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增过期用户的用户统计
        "path": "/rest/analysis/user/added_expired/summary",
        //action中的方法
        "handler": "getAddedExpiredSummary",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取总用户的团队统计
        "path": "/rest/analysis/user/total/team",
        //action中的方法
        "handler": "getTotalTeam",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增用户的团队统计
        "path": "/rest/analysis/user/added/team",
        //action中的方法
        "handler": "getAddedTeam",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取过期用户的团队统计
        "path": "/rest/analysis/user/expired/team",
        //action中的方法
        "handler": "getExpiredTeam",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增过期用户的团队统计
        "path": "/rest/analysis/user/added_expired/team",
        //action中的方法
        "handler": "getAddedExpiredTeam",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取总用户的地域统计
        "path": "/rest/analysis/user/total/zone",
        //action中的方法
        "handler": "getTotalZone",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增用户的地域统计
        "path": "/rest/analysis/user/added/zone",
        //action中的方法
        "handler": "getAddedZone",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取过期用户的地域统计
        "path": "/rest/analysis/user/expired/zone",
        //action中的方法
        "handler": "getExpiredZone",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增过期用户的地域统计
        "path": "/rest/analysis/user/added_expired/zone",
        //action中的方法
        "handler": "getAddedExpiredZone",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取总用户的行业统计
        "path": "/rest/analysis/user/total/industry",
        //action中的方法
        "handler": "getTotalIndustry",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增用户的行业统计
        "path": "/rest/analysis/user/added/industry",
        //action中的方法
        "handler": "getAddedIndustry",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取过期用户的行业统计
        "path": "/rest/analysis/user/expired/industry",
        //action中的方法
        "handler": "getExpiredIndustry",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增过期用户的行业统计
        "path": "/rest/analysis/user/added_expired/industry",
        //action中的方法
        "handler": "getAddedExpiredIndustry",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 活取用户活跃度
        // dataRange表示 日活、周活、月活
        // dataType 表示 总用户、新增用户、新增过期用户
        "path": "/rest/analysis/user/activeness/:dataType/:dataRange",
        //action中的方法
        "handler": "getActiveNess",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 用户活跃时间段
        "path": "/rest/analysis/user/activetime",
        //action中的方法
        "handler": "getActiveTime",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取全部成员
        "path": "/rest/analysis/user/total/member",
        //action中的方法
        "handler": "getTotalMember",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增成员
        "path": "/rest/analysis/user/added/member",
        //action中的方法
        "handler": "getAddedMember",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取过期成员
        "path": "/rest/analysis/user/expired/member",
        //action中的方法
        "handler": "getExpiredMember",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 获取新增过期成员
        "path": "/rest/analysis/user/added_expired/member",
        //action中的方法
        "handler": "getAddedExpiredMember",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 用户登录时长统计
        "path": "/rest/analysis/user/:dataType/login_long/:hours",
        //action中的方法
        "handler": "getLoginLong",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    },{
        //http方法
        "method": "get",
        //路径 用户留存接口
        "path": "/rest/analysis/user/retention",
        //action中的方法
        "handler": "getRetention",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 用户类型统计
        "path": "/rest/analysis/user/:analysis_type/type",
        "handler": "getUserTypeStatistics",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 用户类型统计（新增用户类型）
        "path": "/rest/new/user/:analysis_type/type",
        "handler": "getAddedUserTypeStatistics",
        //是否需要登录
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 应用的启停用状态统计
        "path": "/rest/analysis/app/:analysis_type/status",
        "handler": "getAppStatus",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 全部应用下的，团队统计
        "path": "/rest/analysis/user/v1/apps/:analysis_type/team",
        "handler": "getAppsTeam",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 全部应用下的，行业统计
        "path": "/rest/analysis/user/v1/apps/:analysis_type/industry",
        "handler": "getAppsIndustry",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 全部应用下的，地域统计
        "path": "/rest/analysis/user/v1/apps/:analysis_type/zone",
        "handler": "getAppsZone",
        "passport": {
            "needLogin": true
        }
    }, {
        "method": "get",
        //路径 获取应用下载的统计
        "path": "/rest/app/download/statistics",
        "handler": "getAppsDownloadStatistics",
        "passport": {
            "needLogin": true
        }
    }]
};