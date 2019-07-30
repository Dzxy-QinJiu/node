module.exports = {
    module: 'crm/server/action/batch-change-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/crm/child_groups',
            handler: 'getGroupList',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'put',
            path: '/rest/crm/batch/:auth_type',
            handler: 'doBatch',
            passport: {
                needLogin: true
            },
            privileges: ['CUSTOMER_UPDATE', 'CUSTOMER_MANAGER_UPDATE_ALL']
        },
        {
            method: 'get',
            path: '/rest/crm/get_recommend_tags/:type',
            handler: 'getRecommendTags',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm/industries',
            handler: 'getIndustries',
            passport: {
                needLogin: true
            }
        }
    ]
};
