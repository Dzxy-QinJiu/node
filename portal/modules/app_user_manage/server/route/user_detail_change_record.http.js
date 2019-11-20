/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
module.exports = {
    module: 'app_user_manage/server/action/user_detail_change_record_controller',
    routes: [{
        'method': 'get',
        'path': '/rest/user/record',
        'handler': 'getUserDetailChangeRecord',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'BASE_QUERY_PERMISSION_MEMBER'
        ]
    },]
};