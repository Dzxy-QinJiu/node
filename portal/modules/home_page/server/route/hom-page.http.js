/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/21.
 */
module.exports = {
    module: 'home_page/server/action/home-page-controller',
    routes: [{
        // 获取我的工作列表
        'method': 'get',
        'path': '/rest/home_page/my_works',
        'handler': 'getMyWorkList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }, {
        // 获取我的工作类型列表
        'method': 'get',
        'path': '/rest/home_page/my_work_types',
        'handler': 'getMyWorkTypes',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    }]
};