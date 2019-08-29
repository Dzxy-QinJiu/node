module.exports = {
    module: 'crm/server/action/customer-pool-rule-controller',
    routes: [
        {
            'method': 'post',
            'path': '/rest/cpr/customer_label/:type',
            'handler': 'getCustomerLabel',
            'passport': {
                'needLogin': true
            }
        },
        {
            'method': 'get',
            'path': '/rest/cpr/customer_stage/:team_id',
            'handler': 'getCustomerStage',
            'passport': {
                'needLogin': true
            },
            privileges: ['CRM_GET_SALES_PROCESS_BY_TEAM']
        },
        { // 获取客户池配置
            'method': 'get',
            'path': '/rest/cpr/configs',
            'handler': 'getCustomerPoolConfigs',
            'passport': {
                'needLogin': true
            },
            privileges: ['CUSTOMER_POOL_MANAGE']
        },
        { // 添加客户池配置
            'method': 'post',
            'path': '/rest/cpr/config',
            'handler': 'addCustomerPoolConfig',
            'passport': {
                'needLogin': true
            },
            privileges: ['CUSTOMER_POOL_CONFIG']
        },
        { // 更新客户池配置
            'method': 'put',
            'path': '/rest/cpr/config',
            'handler': 'updateCustomerPoolConfig',
            'passport': {
                'needLogin': true
            },
            privileges: ['CUSTOMER_POOL_CONFIG']
        },
        { // 删除客户池配置
            'method': 'delete',
            'path': '/rest/cpr/config/:id',
            'handler': 'deleteCustomerPoolConfig',
            'passport': {
                'needLogin': true
            },
            privileges: ['CUSTOMER_POOL_CONFIG']
        },
    ]
};
