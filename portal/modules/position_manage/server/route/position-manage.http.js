// 座席号管理
'use strict';
module.exports = {
    module: 'position_manage/server/action/position-manage-controller',
    routes: [{
        // 批量添加座席号
        'method': 'post',
        'path': '/rest/add/phoneorder',
        'handler': 'addPhoneOrder',
        'passport': {
            'needLogin': true
        }
    }, {
        // 获取电话座席号列表
        'method': 'get',
        'path': '/rest/get/phoneorder',
        'handler': 'getPhoneOrderList',
        'passport': {
            'needLogin': true
        }
    }, {
        // 获取未绑定座席号的成员列表
        'method': 'get',
        'path': '/rest/get/unbind/member/list',
        'handler': 'getUnbindMemberList',
        'passport': {
            'needLogin': true
        }
    }, {
        // 修改座席号
        'method': 'put',
        'path': '/rest/update/phoneorder',
        'handler': 'updatePhoneOrder',
        'passport': {
            'needLogin': true
        }
    }, {
        // 成员绑定座席号
        'method': 'put',
        'path': '/rest/bind/phoneorder',
        'handler': 'memberBindPhoneOrder',
        'passport': {
            'needLogin': true
        }
    }]
};
