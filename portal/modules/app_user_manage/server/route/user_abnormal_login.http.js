/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
module.exports = {
    module: 'app_user_manage/server/action/user_abnormal_login_controller',
    routes: [{
        'method': 'get',
        'path': '/rest/user/abnormal_login',
        'handler': 'getUserAbnormalLogin',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'APP_USER_QUERY'
        ]
    },{
        'method': 'post',
        'path': '/rest/user/abnormal/ignore',
        'handler': 'ignoreAbnormalLogin',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'APP_USER_QUERY'
        ]
    }
    ]
};