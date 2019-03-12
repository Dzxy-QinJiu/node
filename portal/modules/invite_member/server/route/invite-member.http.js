/**
 * Created by hzl on 2019/3/8.
 */

/**
 * Created by hzl on 2019/2/28.
 */

module.exports = {
    module: 'invite_member/server/action/invite-member-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/invite/member',
        'handler': 'inviteMember',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_INVITE_APPLY'
        ]
    },{
        'method': 'get',
        'path': '/rest/invite_member/name/check/:name',
        'handler': 'checkOnlyName',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_INVITE_APPLY'
        ]
    },{
        'method': 'get',
        'path': '/rest/invite_member/username/check/:username',
        'handler': 'checkOnlyUserName',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_INVITE_APPLY'
        ]
    }, {
        'method': 'get',
        'path': '/rest/invite_member/email/check/:email',
        'handler': 'checkOnlyEmail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'MEMBER_INVITE_APPLY'
        ]
    }]
};