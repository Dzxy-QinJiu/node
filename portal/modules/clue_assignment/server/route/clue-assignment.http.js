/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng 2019/09/11.
 */
require('../action/clue-assignment-controller');
module.exports = {
    module: 'clue_assignment/server/action/clue-assignment-controller',
    routes: [{//保存线索分配策略
        method: 'post',
        path: '/rest/rule/sales_auto/lead',
        handler: 'saveClueAssignmentStrategy',
        passport: {
            needLogin: true
        }
    }, {//修改线索分配策略
        method: 'put',
        path: '/rest/rule/sales_auto/lead',
        handler: 'editClueAssignmentStrategy',
        passport: {
            needLogin: true
        }
    }, {//修改线索分配策略
        method: 'delete',
        path: '/rest/rule/sales_auto/lead/:id',
        handler: 'deleteClueAssignmentStrategy',
        passport: {
            needLogin: true
        }
    },{//获取线索分配策略列表
        method: 'post',
        path: '/rest/rule/sales_auto/lead/:page_size',
        handler: 'getClueAssignmentStrategies',
        passport: {
            needLogin: true
        }
    }]
};