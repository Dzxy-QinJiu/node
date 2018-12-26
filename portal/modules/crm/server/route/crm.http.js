var crmController = require('../action/crm-controller');

module.exports = {
    module: 'crm/server/action/crm-controller',
    routes: [
        {
            'method': 'get',
            'path': '/rest/crm/download_template',
            'handler': 'getCrmTemplate',
            'passport': {
                'needLogin': true
            }
        },
        {
            'method': 'get',
            'path': '/rest/crm/user_list',
            'handler': 'getCrmUserList',
            'passport': {
                'needLogin': true
            }
        },
        {//获取客户回收站中的客户列表
            method: 'post',
            path: '/rest/crm/recycle_bin/customer/:type',
            handler: 'getRecycleBinCustomers',
            passport: {
                needLogin: true
            },
            privileges: ['CRM_MANAGER_GET_CUSTOMER_BAK_OPERATOR_RECORD', 'CRM_USER_GET_CUSTOMER_BAK_OPERATOR_RECORD']
        },
        {
            method: 'get',
            path: '/rest/crm/customer_list',
            handler: 'getCustomerList',
            passport: {
                needLogin: true
            },
            privileges: [
                'CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL'
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/competitor_list/:type',
            handler: 'getCompetitorList',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm/owner_name/:type',
            handler: 'getOwnerNameList',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm/stage_tag/:type',
            handler: 'getStageTagList',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm/repeat_customer',
            handler: 'getRepeatCustomerList',
            passport: {
                needLogin: true
            },
            privileges: []
        }, {
            method: 'get',
            path: '/rest/crm/repeat_customer/:customerId',
            handler: 'getRepeatCustomerById',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            method: 'get',
            path: '/rest/crm/customer/:customer_id',
            handler: 'getCustomerById',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            method: 'get',
            path: '/rest/crm/customer_only/check',
            handler: 'checkOnlyCustomer',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            method: 'post',
            path: '/rest/customer/range/:pageSize/:pageNum/:sortField/:sortOrder',
            handler: 'queryCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                'CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL'
            ]
        },
        {
            method: 'post',
            path: '/rest/crm/add_customer',
            handler: 'addCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                'CUSTOMER_ADD'
            ]
        },
        {
            method: 'put',
            path: '/rest/customer/v2/editcustomer',
            handler: 'editCustomer',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'post',
            path: '/rest/crm/add_customer_by_clue',
            handler: 'addCustomerByClue',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'delete',
            path: '/rest/crm/delete_customer/:customer_id',
            handler: 'deleteCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                'CRM_DELETE_CUSTOMER'
            ]
        },
        {
            method: 'put',
            path: '/rest/crm/repeat_customer/delete',
            handler: 'deleteRepeatCustomer',
            passport: {
                needLogin: true
            },
            privileges: []
        }, {
            method: 'put',
            path: '/rest/crm/repeat_customer/merge',
            handler: 'mergeRepeatCustomer',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            method: 'put',
            path: '/rest/crm/update_customer',
            handler: 'updateCustomer',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            method: 'put',
            path: '/rest/crm/:type/transfer_customer',
            handler: 'transferCustomer',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {
            'method': 'get',
            'path': '/rest/crm/:pageSize/:pageNum',
            'handler': 'getCurCustomers',
            'passport': {
                'needLogin': true
            },
            'privileges': [
                'CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL'
            ]
        },
        {
            method: 'get',
            path: '/rest/crm_dynamic/:customer_id',
            handler: 'getDynamicList',
            passport: {
                needLogin: true
            },
            privileges: [
                'CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL'
            ]
        },
        {
            'method': 'post',
            'path': '/rest/crm/customers',
            'handler': 'uploadCustomers',
            'passport': {
                'needLogin': true
            }
        },
        {
            method: 'get',
            path: '/rest/crm_filter/industries',
            handler: 'getFilterIndustries',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm_filter/:type/sales_role_list',
            handler: 'getFilterSalesRoleList',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm_filter/provinces/:type',
            handler: 'getFilterProvinces',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/crm/administrative_level',
            handler: 'getAdministrativeLevel',
            passport: {
                needLogin: true
            }
        },
        { // 拨打电话
            'method': 'post',
            'path': '/rest/call/out',
            'handler': 'callOut',
            'passport': {
                'needLogin': true
            }
        },
        { // 获取电话座机号
            'method': 'get',
            'path': '/rest/call/phone/:user_id',
            'handler': 'getUserPhoneNumber',
            'passport': {
                'needLogin': true
            }
        },
        {
            method: 'get',
            path: '/rest/crm/limit',
            handler: 'getCustomerLimit',
            passport: {
                needLogin: true
            },
            privileges: [
                'CRM_CUSTOMER_LIMIT_FLAG'
            ]
        },
        {
            method: 'get',
            path: '/rest/history/score',
            handler: 'getHistoryScoreList',
            passport: {
                needLogin: true
            },
            privileges: [
                'CRM_CUSTOMER_SCORE_RECORD'
            ]
        }, {
            method: 'put',
            path: '/rest/crm/:type/customer_stage',
            handler: 'editCustomerStage',
            passport: {
                needLogin: true
            },
            privileges: ['CRM_USER_UPDATE_CUSTOMER_LABEL', 'CRM_MANAGER_UPDATE_CUSTOMER_LABEL']
        },{
            method: 'put',
            path: '/rest/crm/:type/team',
            handler: 'onlyEditCustomerTeam',
            passport: {
                needLogin: true
            },
            privileges: ['CRM_MANAGER_UPDATE_CUSTOMER_SALES_TEAM', 'CRM_USER_UPDATE_CUSTOMER_SALES_TEAM']

        }
    ]
};
