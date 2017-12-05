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
            path: '/rest/crm/batch',
            handler: 'doBatch',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            method: 'get',
            path: '/rest/crm/get_recommend_tags/:pageSize/:num/:type',
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
