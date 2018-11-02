module.exports = {
    module: 'deal_manage/server/action/deal-manage-controller',
    routes: [{
        method: 'post',
        path: '/rest/deal/:type/:page_size/:sort_field/:sort_order',
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
        privileges: []
    }]
};