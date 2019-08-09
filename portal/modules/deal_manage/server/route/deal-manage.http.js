module.exports = {
    module: 'deal_manage/server/action/deal-manage-controller',
    routes: [{
        method: 'post',
        path: '/rest/deal/:type/:page_size/:page_num/:sort_field/:sort_order',
        handler: 'getDealList',
        passport: {
            needLogin: true
        },
        privileges: ['CRM_MANAGER_LIST_SALESOPPORTUNITY', 'CRM_USER_LIST_SALESOPPORTUNITY']
    }, {
        method: 'post',
        path: '/rest/deal',
        handler: 'addDeal',
        passport: {
            needLogin: true
        },
        privileges: ['SALESOPPORTUNITY_ADD']
    }, {
        method: 'put',
        path: '/rest/deal',
        handler: 'editDeal',
        passport: {
            needLogin: true
        },
        privileges: ['SALESOPPORTUNITY_UPDATE']
    }, {
        method: 'delete',
        path: '/rest/deal/:deal_id',
        handler: 'deleteDeal',
        passport: {
            needLogin: true
        },
        privileges: ['CRM_SALESOPPORTUNITY_DELETE']
    }, {
        method: 'get',
        path: '/rest/deal/:type/stage/total_budget',
        handler: 'getStageTotalBudget',
        passport: {
            needLogin: true
        },
        privileges: []
    }]
};