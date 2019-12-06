/**
 * 说明：统计分析-客户分析 的路由配置
 */

module.exports = {
    //定义controller
    module: 'oplate_customer_analysis/server/action/oplate-customer-analysis.action',
    //定义路由信息
    routes: [{
        //http方法
        'method': 'get',
        //路径 获取 统计总数
        'path': '/rest/analysis/customer/summary',
        //action中的方法
        'handler': 'getSummaryNumbers',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
        //需要权限
        'privileges': [
            // 'OPLATE_CUSTOMER_ANALYSIS_ZONE'
        ]
    },{
        //http方法
        'method': 'get',
        //路径 获取具体统计数据
        'path': '/rest/analysis/customer/:customerType/:customerProperty',
        //action中的方法
        'handler': 'getAnalysisData',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
        //需要权限
        'privileges': [
            // 'OPLATE_CUSTOMER_ANALYSIS_ZONE'
        ]
    },{
        //http方法
        'method': 'get',
        //路径 获取当前登录用户在团队树中的位置
        'path': '/rest/group_position',
        //action中的方法
        'handler': 'getGroupPosition',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
    }]
};