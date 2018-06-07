/**
 * author:周连毅
 * 说明：统计分析-用户分析 的路由配置
 */
require('../action/operation-report-action');
module.exports = {
    //定义controller
    module: 'operation_report/server/action/operation-report-action',
    //定义路由信息
    routes: [{
        //http方法
        'method': 'get',
        //各应用登录情况
        'path': '/operation_report/login_user/app',
        //action中的方法
        'handler': 'getAppLoginUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //各应用签约用户数
        'path': '/operation_report/signed_user/app',
        //action中的方法
        'handler': 'getAppSignedUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //各应用新开账号统计
        'path': '/operation_report/trial_user/app',
        //action中的方法
        'handler': 'getAppNewTrialUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各应用延期用户的统计
        'path': '/operation_report/delay_user/app',
        //action中的方法
        'handler': 'getAppNewDelayUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //各应用登录对比
        'path': '/operation_report/login/comparison',
        //action中的方法
        'handler': 'getAppLoginComparison',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //各应用到期用户登录对比
        'path': '/operation_report/expired/login/comparison',
        //action中的方法
        'handler': 'getAppExpiredLoginComparison',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取近四周周登录总时长超过1小时的用户数对比
        'path': '/operation_report/weekly/login/total_time',
        //action中的方法
        'handler': 'getAppWeeklyLoginTotalTime',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //近四周用户活跃度
        'path': '/operation_report/user/active',
        //action中的方法
        'handler': 'getUserActive',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //近用户日活跃度
        'path': '/operation_report/user/daily/active',
        //action中的方法
        'handler': 'getUserDailyActive',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //近四周新开用户的对比
        'path': '/operation_report/new_user/app',
        //action中的方法
        'handler': 'getAppNewUserComparison',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //近四周新增延期用户的对比
        'path': '/operation_report/delay_user/comparison',
        //action中的方法
        'handler': 'getAppNewDelayUserComparison',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //近四周签约用户登录对比
        'path': '/operation_report/formal_user/login/app',
        //action中的方法
        'handler': 'getAppFormalUserLoginComparison',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门签约用户的登录表格数据
        'path': '/operation_report/team/signed_user/login',
        //action中的方法
        'handler': 'getTeamSignedLoginUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各应用用户登录的部门分布表格数据
        'path': '/operation_report/team/user_login',
        //action中的方法
        'handler': 'getTeamLoginUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门到期用户的登录表格数据
        'path': '/operation_report/team/expired_user/login',
        //action中的方法
        'handler': 'getTeamExpiredLoginUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门到期用户的登录时长表格数据
        'path': '/operation_report/team/expired_user/login_time',
        //action中的方法
        'handler': 'getTeamExpiredUserLoginTime',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取到期用户的周登录时长超1小时的各应用的用户数
        'path': '/operation_report/expired_user/exceed/login_time',
        //action中的方法
        'handler': 'getExpiredUserExceedLoginTime',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门新开试用账号的统计表格
        'path': '/operation_report/team/trial_user',
        //action中的方法
        'handler': 'getTeamNewTrialUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门新增延期用户的统计表格
        'path': '/operation_report/team/delay_user',
        //action中的方法
        'handler': 'getTeamNewDelayUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门新开试用账号登录的统计表格
        'path': '/operation_report/team/trial_user/login',
        //action中的方法
        'handler': 'getTeamNewTrialLoginUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门新增延期用户登录的统计表格
        'path': '/operation_report/team/delay_user/login',
        //action中的方法
        'handler': 'getTeamNewDelayLoginUser',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门登录超过x小时的统计表格数据
        'path': '/operation_report/team/exceed/login_time',
        //action中的方法
        'handler': 'getTeamExceedLoginTime',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }, {
        //http方法
        'method': 'get',
        //获取各部门登录超过x小时的延期用户统计表格数据
        'path': '/operation_report/team/delay_user/login_time',
        //action中的方法
        'handler': 'getTeamDelayUserLoginTime',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }
    ]
};