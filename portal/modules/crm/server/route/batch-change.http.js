var crmPrivilegeConst = require('../../public/privilege-const').default;

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
            privileges: [crmPrivilegeConst.BASE_QUERY_PERMISSION_TEAM]
        },
        {
            method: 'put',
            path: '/rest/crm/batch/:auth_type',
            handler: 'doBatch',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/get_recommend_tags/:type',
            handler: 'getRecommendTags',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_ALL,
                crmPrivilegeConst.CRM_LIST_CUSTOMERS
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/industries',
            handler: 'getIndustries',
            passport: {
                needLogin: true
            },
            privileges: ['BASE_QUERY_PERMISSION_ORGANIZATION']
        }
    ]
};
