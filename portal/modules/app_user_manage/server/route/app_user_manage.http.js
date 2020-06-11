/**
 * 请求路径 - user
 */
import appUserPrivilegeConst from '../../public/privilege-const';
import crmPrivilegeConst from '../../../crm/public/privilege-const';
import commonPrivilegeConst from '../../../common/public/privilege-const';

module.exports = {
    module: 'app_user_manage/server/action/app_user_manage.action',
    routes: [{
        'method': 'get',
        'path': '/rest/appuser',
        'handler': 'getAppUserList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_QUERY
        ]
    }, {
        'method': 'get',
        'path': '/rest/recent/login/users',
        'handler': 'getRecentLoginUsers',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/appuser/name/:name',
        'handler': 'getUserByName',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_QUERY
        ]
    }, {
        'method': 'get',
        'path': '/rest/appuser/exist/:field/:value',
        'handler': 'checkUserExist',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        'method': 'post',
        'path': '/rest/appuser',
        'handler': 'addAppUser',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_MANAGE
        ]
    }, {
        'method': 'put',
        'path': '/rest/appuser',
        'handler': 'editAppUser',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        'method': 'get',
        'path': '/rest/appuser/detail/:id',
        'handler': 'getUserDetail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_QUERY
        ]
    }, {
        'method': 'post',
        'path': '/rest/appuser/disable_apps',
        'handler': 'disableAllApps',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_MANAGE
        ]
    }, {
        'method': 'put',
        'path': '/rest/appuser/batch',
        'handler': 'batchUpdate',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_MANAGE
        ]
    }, {
        'method': 'get',
        'path': '/rest/appuser/customer/:customer_id',
        'handler': 'getCustomerUsers',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_QUERY, //列出用户
            crmPrivilegeConst.CRM_LIST_CUSTOMERS //列出客户
        ]
    }, { // 团队申请 列表
        'method': 'get',
        'path': '_list',
        'handler': 'getApplyList',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            commonPrivilegeConst.USERAPPLY_BASE_PERMISSION//获取用户审批列表
        ]
    }, {
        method: 'post',
        path: '/rest/cancel/apply/approve',
        handler: 'cancelApplyApprove',
        passport: {
            needLogin: true
        },
    }, {
        method: 'get',
        path: '/rest/get/worklist/approve/by/me',
        handler: 'getApplyListWillApprovedByMe',
        passport: {
            needLogin: true
        },
    }, {//todo 权限的修改
        // 获取 我申请的 列表
        'method': 'get',
        'path': '/rest/apply_list/start/self',
        'handler': 'getApplyListStartSelf',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            commonPrivilegeConst.USERAPPLY_BASE_PERMISSION
        ]
    }, {
        // 获取我审批的列表
        'method': 'get',
        'path': '/rest/apply_list/approve/my',
        'handler': 'getMyApplyLists',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            commonPrivilegeConst.USERAPPLY_BASE_PERMISSION
        ]
    },
        //     {
        //     'method': 'get',
        //     'path': '/rest/appuser/unread_reply',
        //     'handler': 'getUnreadReplyList',
        //     'passport': {
        //         'needLogin': true
        //     },
        //     'privileges': [
        //         commonPrivilegeConst.USERAPPLY_BASE_PERMISSION//获取未读回复列表
        //     ]
        // },
    {
        'method': 'get',
        'path': '/rest/workflow/unread_reply',
        'handler': 'getWorkFlowUnreadReplyList',
        'passport': {
            'needLogin': true
        },
    }, { // 获取申请详情
        'method': 'get',
        'path': '/rest/apply_approve/detail/by/id',
        'handler': 'getApplyDetail',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            commonPrivilegeConst.USERAPPLY_BASE_PERMISSION
        ]
    }, {
        'method': 'post',
        'path': '/rest/appuser/apply',
        'handler': 'submitApply',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/appuser/addapp',
        'handler': 'addApp',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_MANAGE//为用户添加应用
        ]
    }, {
        'method': 'post',
        'path': '/rest/appuser/editapp',
        'handler': 'editApp',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            appUserPrivilegeConst.USER_MANAGE//为用户修改应用
        ]
    }, {
        'method': 'post',
        'path': '/rest/base/v1/user/apply_grants',
        'handler': 'applyNewgrant',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/user/batch_delay',
        'handler': 'batchDelayUser',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': '/rest/user/appdetail',
        'handler': 'editAppDetail',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'post',
        'path': '/rest/user/apply/password',
        'handler': 'applyChangePasswordAndOther',
        'passport': {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/get/apply/comment/list',
        handler: 'getApplyComments',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/add/apply/comment',
        handler: 'addApplyComments',
        passport: {
            needLogin: true
        },
    }, {
        'method': 'get',
        'path': '/rest/get_team_lists',
        'handler': 'getteamlists',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'put',
        'path': '/rest/appuser/backout_apply',
        'handler': 'cancelApplyApprove',
        'passport': {
            'needLogin': true
        }
    }, {
        'method': 'get',
        'path': '/rest/apply/user_name/valid',
        'handler': 'checkUserName',
        'passport': {
            'needLogin': true
        }
    }, { // 添加一个用户名，提示用户名信息
        'method': 'get',
        'path': '/rest/add/one/user/suggest',
        'handler': 'addOneUserSuggestName',
        'passport': {
            'needLogin': true
        }
    }, { // 获取安全域信息列表
        'method': 'get',
        'path': '/rest/get/realm/list',
        'handler': 'getRealmList',
        'passport': {
            'needLogin': true
        }
    }, { // 导入用户模板文件
        'method': 'get',
        'path': '/rest/import/user/download_template',
        'handler': 'getUserTemplate',
        'passport': {
            'needLogin': true
        }
    }, { // 数据导出模板文件
        'method': 'get',
        'path': '/rest/data/service/download_template',
        'handler': 'getDataServiceTemplate',
        'passport': {
            'needLogin': true
        }
    }, { // 预览上传用户
        'method': 'post',
        'path': '/rest/user/upload/:app_id',
        'handler': 'uploadUser',
        'passport': {
            'needLogin': true
        }
    }, { // 确认上传用户
        'method': 'post',
        'path': '/rest/confirm/user/upload/:app_id',
        'handler': 'confirmUploadUser',
        'passport': {
            'needLogin': true
        }
    }]
};
