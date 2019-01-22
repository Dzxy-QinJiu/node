/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
'use strict';

module.exports = {
    module: 'common/server/action/apply-approve',
    routes: [{
        'method': 'get',
        'path': '/rest/get/apply/next/candidate',
        'handler': 'getNextCandidate',
        'passport': {
            'needLogin': true
        }
    },{
        'method': 'post',
        'path': '/rest/add/apply/new/candidate',
        'handler': 'addNewCandidate',
        'passport': {
            'needLogin': true
        }
    }]};