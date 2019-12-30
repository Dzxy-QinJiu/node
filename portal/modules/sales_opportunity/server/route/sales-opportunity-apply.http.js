/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
module.exports = {
    module: 'sales_opportunity/server/action/sales-opportunity-apply-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/get/all/sales_opportunity_apply/list',
            handler: 'getAllSalesOpportunityApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/worklist/sales_opportunity_apply/list',
            handler: 'getWorklistSalesOpportunityApplyList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/add/sales_opportunity_apply/list',
            handler: 'addSalesOpportunityApply',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/sales_opportunity_apply/comment/list',
            handler: 'getSalesOpportunityApplyComments',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/add/sales_opportunity_apply/comment',
            handler: 'addSalesOpportunityApplyComments',
            passport: {
                needLogin: true
            },
        }, {
            method: 'post',
            path: '/rest/sales_opportunity_apply/submitApply',
            handler: 'approveSalesOpportunityApplyPassOrReject',
            passport: {
                needLogin: true
            },
        }, {
            method: 'get',
            path: '/rest/get/sales_opportunity_apply/status/byId',
            handler: 'getSalesOpportunityApplyStatusById',
            passport: {
                needLogin: true
            },
        }
    ]
};