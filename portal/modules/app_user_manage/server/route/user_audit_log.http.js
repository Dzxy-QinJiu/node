/**
 * 获取用户登录相关的信息 获取用户登录统计图中登录时长、登录频次 权限需要替换
 * todo 需要把 USER_AUDIT_LOG_LIST 替换为 CRM_USER_ANALYSIS_ALL_ROLE_QUERY ，为了测试，先写为USER_AUDIT_LOG_LIST
 * **/
module.exports = {
    module: 'app_user_manage/server/action/user_audit_log_controller',
    routes: [{
        'method': 'post',
        'path': '/rest/user/log',
        'handler': 'getUserLogList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_AUDIT_LOG_LIST'
        ]
    },{
        'method': 'get',
        'path': '/rest/log/app/user_detail/:user_id',
        'handler': 'getSingleAuditLogList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'USER_AUDIT_LOG_LIST'
        ]
    },{ // 获取用户登录相关的信息（时长、次数、首次和最后一次登录时间）
        'method': 'get',
        'path': '/rest/user/login/info/:user_id',
        'handler': 'getUserLoginInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_USER_ANALYSIS_ALL_ROLE_QUERY'
        ]
    },{ // 获取用户登录统计图中登录时长、登录频次
        'method': 'get',
        'path': '/rest/user/login/chart/:user_id',
        'handler': 'getUserLoginChartInfo',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_USER_ANALYSIS_ALL_ROLE_QUERY'
        ]
    }, { // 获取用户的分数
        'method': 'get',
        'path': '/rest/login/user/score/:type',
        'handler': 'getLoginUserScore',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, { // 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
        'method': 'get',
        'path': '/rest/login/user/active/statistics/:user_id/:type',
        'handler': 'getLoginUserActiveStatistics',
        'passport': {
            'needLogin': true
        }
    }]
};