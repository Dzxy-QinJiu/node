/**
 * Created by hzl on 2019/2/28.
 */

module.exports = {
    module: 'sales_home_page/server/action/invite-member-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/invite/member',
        'handler': 'inviteMember',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'get',
        'path': '/rest/invite_member/name/check',
        'handler': 'checkOnlyUserName',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CURTAO_INVITE_REGISTER'
        ]
    }, {
        'method': 'get',
        'path': '/rest/invite_member/email/check',
        'handler': 'checkOnlyEmail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CURTAO_INVITE_REGISTER'
        ]
    }]
};