var crmPrivilegeConst = require('../../public/privilege-const').default;

module.exports = {
    module: 'crm/server/action/crm-controller',
    routes: [
        {
            'method': 'get',
            'path': '/rest/crm/download_template',
            'handler': 'getCrmTemplate',
            'passport': {
                'needLogin': true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        {//获取客户回收站中的客户列表
            method: 'post',
            path: '/rest/crm/recycle_bin/customer/:type',
            handler: 'getRecycleBinCustomers',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD,
                crmPrivilegeConst.CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD
            ]
        },
        {//恢复客户
            method: 'put',
            path: '/rest/crm/recovery/customer',
            handler: 'recoveryCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD,
                crmPrivilegeConst.CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD
            ]
        },
        {//删除回收站中的客户
            method: 'delete',
            path: '/rest/crm/customer_bak/:customer_id',
            handler: 'deleteCustomerBak',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD,
                crmPrivilegeConst.CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/customer_list',
            handler: 'getCustomerList',
            passport: {
                needLogin: true
            },
            privileges: []
        },
        {//获取系统标签列表
            method: 'get',
            path: '/rest/crm/immutable_labels/:type',
            handler: 'getSystemLabelsList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/competitor_list/:type',
            handler: 'getCompetitorList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/owner/:type',
            handler: 'getOwnerList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/stage_tag/:type',
            handler: 'getStageTagList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/repeat_customer',
            handler: 'getRepeatCustomerList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        }, {
            method: 'get',
            path: '/rest/crm/repeat_customer/:type/:customer_id',
            handler: 'getRepeatCustomerById',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/customer/:customer_id',
            handler: 'getCustomerById',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm/customer_only/check',
            handler: 'checkOnlyCustomer',
            passport: {
                needLogin: true
            },
            // privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        {
            method: 'post',
            path: '/rest/customer/range/:pageSize/:pageNum/:sortField/:sortOrder',
            handler: 'queryCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'post',
            path: '/rest/crm/add_customer',
            handler: 'addCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        { //小程序中使用
            method: 'put',
            path: '/rest/customer/editcustomer/entirety',
            handler: 'editCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        {
            method: 'post',
            path: '/rest/crm/add_customer_by_clue',
            handler: 'addCustomerByClue',
            passport: {
                needLogin: true
            },
            //TODO，待确定
            // privileges: ['LEAD_TRANSFER_MERGE_CUSTOMER', 'CUSTOMER_ADD']
        },
        {
            method: 'delete',
            path: '/rest/crm/delete_customer/:customer_id',
            handler: 'deleteCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CRM_DELETE_CUSTOMER]
        },
        {
            method: 'put',
            path: '/rest/crm/repeat_customer/delete',
            handler: 'deleteRepeatCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]
        }, {
            method: 'put',
            path: '/rest/crm/repeat_customer/merge',
            handler: 'mergeRepeatCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]
        },
        {
            method: 'put',
            path: '/rest/crm/update_customer',
            handler: 'updateCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]
        },
        {
            method: 'put',
            path: '/rest/crm/:type/transfer_customer',
            handler: 'transferCustomer',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]
        },
        {
            'method': 'get',
            'path': '/rest/crm/:pageSize/:pageNum',
            'handler': 'getCurCustomers',
            'passport': {
                'needLogin': true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm_dynamic/:customer_id',
            handler: 'getDynamicList',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_DYNAMIC]
        },
        {
            'method': 'post',
            'path': '/rest/crm/customers',
            'handler': 'uploadCustomers',
            'passport': {
                'needLogin': true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        {
            method: 'get',
            path: '/rest/crm_filter/industries/:type',
            handler: 'getFilterIndustries',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },
        {
            method: 'get',
            path: '/rest/crm_filter/:type/sales_role_list',
            handler: 'getFilterSalesRoleList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
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
            },
            privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        { // 拨打电话
            'method': 'post',
            'path': '/rest/call/out',
            'handler': 'callOut',
            'passport': {
                'needLogin': true
            },
            privileges: [crmPrivilegeConst.PHONE_ACCESS_CALL_OU]
        },
        {
            method: 'get',
            path: '/rest/crm/limit',
            handler: 'getCustomerLimit',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_ADD]
        },
        {
            method: 'get',
            path: '/rest/history/score',
            handler: 'getHistoryScoreList',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        }, {
            method: 'put',
            path: '/rest/crm/:type/customer_stage',
            handler: 'editCustomerStage',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]
        },{
            method: 'put',
            path: '/rest/crm/:type/team',
            handler: 'onlyEditCustomerTeam',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_UPDATE,
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
            ]

        },{//获取客户所属销售及联合跟进人
            method: 'get',
            path: '/rest/customer/sales/:customer_id',
            handler: 'getSalesByCustomerId',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        },{//修改客户的联合跟进人
            method: 'put',
            path: '/rest/crm/second_sales',
            handler: 'editSecondSales',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL,
                crmPrivilegeConst.CUSTOMER_UPDATE
            ]
        },{
            method: 'put',
            path: '/rest/customer/release',
            handler: 'releaseCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_POOL_MANAGE]
        }, {//获取客户池中的客户
            method: 'get',
            path: '/rest/customer_pool/customer',
            handler: 'getPoolCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_POOL_MANAGE]
        }, {//提取客户
            method: 'post',
            path: '/rest/customer_pool/customer',
            handler: 'extractCustomer',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_POOL_MANAGE]
        }, {//获取客户池中聚合的筛选项
            method: 'get',
            path: '/rest/customer_pool/filter/items',
            handler: 'getCustomerPoolFilterItems',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CUSTOMER_POOL_MANAGE]
        }, {// 通过团队id获取客户阶段（销售流程）
            method: 'get',
            path: '/rest/get/customer/stage/:teamId',
            handler: 'getCustomerStageByTeamId',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.CRM_GET_SALES_PROCESS]
        }, {// 验证是否有权限处理跟进人
            method: 'get',
            path: '/rest/customer/check/update/:customer_id',
            handler: 'checkCustomerUpdateUser',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        }, {// 是否有权限处理联合跟进人
            method: 'get',
            path: '/rest/customer/check/join/:customer_id',
            handler: 'checkCustomerJoinUser',
            passport: {
                needLogin: true
            },
            privileges: [
                crmPrivilegeConst.CRM_LIST_CUSTOMERS,
                crmPrivilegeConst.CUSTOMER_ALL
            ]
        }
    ]
};
