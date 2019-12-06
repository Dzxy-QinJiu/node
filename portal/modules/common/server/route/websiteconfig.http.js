/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/6.
 */
import privilegeConst_common from '../../public/privilege-const';
module.exports = {
    module: 'common/server/action/web-site-config',
    routes: [{
        'method': 'get',
        'path': '/get/user/website/config',
        'handler': 'getWebsiteConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_MEMBER]
    }]
};