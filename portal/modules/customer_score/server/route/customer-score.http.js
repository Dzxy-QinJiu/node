
module.exports = {
    module: 'customer_score/server/action/customer-score-controller',
    routes: [
        { // 获取客户评分等级
            method: 'get',
            path: '/rest/customer/score/rules',
            handler: 'getCustomerScoreRules',
            passport: {
                needLogin: true
            }
        }, { // 获取客户评分等级
            method: 'get',
            path: '/rest/customer/score/level',
            handler: 'getCustomerScoreLevel',
            passport: {
                needLogin: true
            }
        }, { // 获取客户评分等级
            method: 'get',
            path: '/rest/customer/score/indicator',
            handler: 'getCustomerScoreIndicator',
            passport: {
                needLogin: true
            }
        }, { // 保存客户规则
            method: 'post',
            path: '/rest/save/customer/rules',
            handler: 'saveCustomerRules',
            passport: {
                needLogin: true
            }
        }
    ]
};