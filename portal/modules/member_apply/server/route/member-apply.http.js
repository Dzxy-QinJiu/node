/**
 * Created by hzl on 2019/3/5.
 */

module.exports = {
    module: 'member_apply/server/action/member-apply-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/get/all/apply_approve/list',
            handler: 'getAllMemberApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/worklist/apply_approve/list',
            handler: 'getWorklistMemberApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/apply_approve/detail/byId',
            handler: 'getMemberApplyDetailById',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/apply_approve/comment/list',
            handler: 'getMemberApplyComments',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/add/apply_approve/comment',
            handler: 'addMemberApplyComments',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/member_apply/submitApply',
            handler: 'approveMemberApplyPassOrReject',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/leave_apply/status/byId',
            handler: 'getMemberApplyStatusById',
            passport: {
                needLogin: true
            },
        },{
            method: 'get',
            path: '/rest/member_apply/name/check/:name',
            handler: 'checkOnlyName',
            passport: {
                'needLogin': true
            },
        }, {
            method: 'get',
            path: '/rest/member_apply/email/check/:email',
            handler: 'checkOnlyEmail',
            passport: {
                'needLogin': true
            },
        }
    ]
};
