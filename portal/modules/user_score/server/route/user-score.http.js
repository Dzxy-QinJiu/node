
module.exports = {
    module: 'user_score/server/action/user-score-controller',
    routes: [
        { // 获取用戶评分规则
            method: 'get',
            path: '/rest/user/score/indicator',
            handler: 'getUserScoreIndicator',
            passport: {
                needLogin: true
            }
        }, { // 获取用户参与度
            method: 'get',
            path: '/rest/get/user/engagement/rule',
            handler: 'getUserEngagementRule',
            passport: {
                needLogin: true
            }
        },{ // 保存用户参与度
            method: 'post',
            path: '/rest/save/user/engagement/rule',
            handler: 'saveUserEngagementRule',
            passport: {
                needLogin: true
            }
        },
        { // 获取用户评分等级
            method: 'get',
            path: '/rest/get/user/score/rules',
            handler: 'getUserScoreLists',
            passport: {
                needLogin: true
            }
        }, { // 保存用户评分
            method: 'post',
            path: '/rest/save/user/score/rules',
            handler: 'saveUserScoreLists',
            passport: {
                needLogin: true
            }
        }, { // 修改参与度的状态
            method: 'put',
            path: '/rest/update/user/score/status',
            handler: 'updateEngagementStatus',
            passport: {
                needLogin: true
            }
        }
    ]
};