/**
 * 请求路径 - user
 */

module.exports = {
    module: "app_user_manage/server/action/app_user_manage.action",
    routes: [{
        "method": "get",
        "path": "/rest/appuser",
        "handler": "getAppUserList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "APP_USER_LIST"
        ]
    },
    {
        "method": "get",
        "path": "/rest/appuser/name/:name",
        "handler": "getUserByName",
        "passport": {
            "needLogin": true
        },
            "privileges": [
            "APP_USER_LIST"
        ]
    },
    {
        "method": "get",
        "path": "/rest/appuser/exist/:field/:value",
        "handler": "checkUserExist",
        "passport": {
            "needLogin": true
        },
            "privileges": []
    },
    {
        "method": "post",
        "path": "/rest/appuser",
        "handler": "addAppUser",
        "passport": {
            "needLogin": true
        },
            "privileges": [
            "APP_USER_ADD"
        ]
        }, {
        "method": "put",
        "path": "/rest/appuser",
        "handler": "editAppUser",
        "passport": {
            "needLogin": true
        },
        "privileges": []
    },
    {
        "method": "get",
        "path": "/rest/appuser/detail/:id",
        "handler": "getUserDetail",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "APP_USER_LIST"
        ]
    },
    {
        "method": "post",
        "path": "/rest/appuser/disable_apps",
        "handler": "disableAllApps",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_BATCH_OPERATE"
        ]
    },
    {
        "method": "put",
        "path": "/rest/appuser/batch",
        "handler": "batchUpdate",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "USER_BATCH_OPERATE"
        ]
    },
    {
        "method": "get",
        "path": "/rest/appuser/customer/:customer_id",
        "handler": "getCustomerUsers",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "APP_USER_LIST", //列出用户
            "CRM_LIST_CUSTOMERS" //列出客户
        ]
    }, 
    {
        "method": "get",
        "path": "/rest/appuser/apply/:status/:page_size/:page",
        "handler": "getApplyList",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "APP_USER_APPLY_LIST"//获取用户审批列表
        ]
    },
    {
        "method": "get",
        "path": "/rest/appuser/apply/:apply_id",
        "handler": "getApplyDetail",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "APP_USER_APPLY_LIST"//获取用户审批详情
        ]
    },
    {
        "method": "post",
        "path": "/rest/appuser/apply/:apply_id",
        "handler": "submitApply",
        "passport": {
            "needLogin": true
        },
        "privileges": [
            "APP_USER_APPLY_APPROVAL"//审批用户审批
        ]
    },
    {
        "method": "post",
        "path": "/rest/appuser/addapp",
        "handler": "addApp",
        "passport": {
           "needLogin": true
        },
        "privileges": [
           "APP_USER_ADD"//为用户添加应用
        ]
    },
    {
        "method": "post",
        "path": "/rest/appuser/editapp",
        "handler": "editApp",
        "passport": {
           "needLogin": true
        },
        "privileges": [
            "APP_USER_EDIT"//为用户修改应用
        ]
    }, 
    {
        "method": "post",
        "path": "/rest/base/v1/user/apply_grants",
        "handler": "applyUser",
        "passport": {
            "needLogin": true
        }
    },{
        "method": "post",
        "path": "/rest/user/apply_delay",
        "handler": "applyDelayUser",
        "passport": {
            "needLogin": true
        }
    },{
        "method": "post",
        "path": "/rest/user/batch_delay",
        "handler": "batchDelayUser",
        "passport": {
            "needLogin": true
        }
    },{
        "method":"put",
        "path":"/rest/user/appdetail",
        "handler":"editAppDetail",
        "passport": {
            "needLogin":true
        }
    },{
        "method":"post",
        "path":"/rest/user/apply/password",
        "handler":"applyChangePassword",
        "passport": {
            "needLogin":true
        }
    },{
        "method":"post",
        "path":"/rest/user/apply/status",
        "handler":"applyChangeStatus",
        "passport": {
            "needLogin":true
        }
    }, {
        "method": "get",
        "path": "/rest/appuser/replylist/:apply_id",
        "handler": "getReplyList",
        "passport": {
            "needLogin": true
        }
    },{
        "method": "post",
        "path": "/rest/appuser/add_reply",
        "handler": "addReply",
        "passport": {
            "needLogin": true
        }
    }, {
            "method": "get",
            "path": "/rest/get_team_lists",
            "handler": "getteamlists",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "put",
            "path": "/rest/appuser/backout_apply",
            "handler": "saleBackoutApply",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "get",
            "path": "/rest/apply/user_name/valid",
            "handler": "checkUserName",
            "passport": {
                "needLogin": true
            }
        }, { // 添加一个用户名，提示用户名信息
            "method": "get",
            "path": "/rest/add/one/user/suggest",
            "handler": "addOneUserSuggestName",
            "passport": {
                "needLogin": true
            }
        }, { // 获取安全域信息列表
            "method": "get",
            "path": "/rest/get/realm/list",
            "handler": "getRealmList",
            "passport": {
                "needLogin": true
            }
        }]
};