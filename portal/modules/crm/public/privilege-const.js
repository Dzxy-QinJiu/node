/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/11/19.
 */
const privilegeConst = {
    //客户--start
    //添加客户
    CUSTOMER_ADD: 'CUSTOMER_ADD',
    //销售更新客户
    CUSTOMER_UPDATE: 'CUSTOMER_UPDATE',
    //管理员更新客户
    CUSTOMER_MANAGER_UPDATE_ALL: 'CUSTOMER_MANAGER_UPDATE_ALL',
    //销售查询客户
    CRM_LIST_CUSTOMERS: 'CRM_LIST_CUSTOMERS',
    //管理员查询客户
    CUSTOMER_ALL: 'CUSTOMER_ALL',
    //删除客户
    CRM_DELETE_CUSTOMER: 'CRM_DELETE_CUSTOMER',
    //动态
    CUSTOMER_DYNAMIC: 'customer_dynamic',
    //销售查询回收站
    CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD: 'CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD',
    //管理员查询回收站
    CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD: 'CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD',
    //添加联合跟进人的权限
    CRM_ASSERT_CUSTOMER_SALES: ' CRM_ASSERT_CUSTOMER_SALES',
    //客户--end

    //联系人--start
    //添加联系人
    CRM_ADD_CONTACT: 'CRM_ADD_CONTACT',
    //更新联系人
    CRM_EDIT_CONTACT: 'CRM_EDIT_CONTACT',
    //删除联系人
    CRM_DELETE_CONTACT: 'CRM_DELETE_CONTACT',
    //销售查询联系人
    CRM_USER_LIST_CONTACTS: 'CRM_USER_LIST_CONTACTS',
    //管理员查询联系人
    CRM_MANAGER_LIST_CONTACTS: 'CRM_MANAGER_LIST_CONTACTS',
    //联系人--end

    //合同--start
    //合同基础权限
    CRM_CONTRACT_COMMON_BASE: 'CRM_CONTRACT_COMMON_BASE',
    //查询合同
    CRM_CONTRACT_QUERY: 'CRM_CONTRACT_QUERY',
    //合同--end

    //客户池--start
    //客户池管理权限
    CUSTOMER_POOL_MANAGE: 'CUSTOMER_POOL_MANAGE',
    //客户池规则配置权限
    CUSTOMER_POOL_CONFIG: 'CUSTOMER_POOL_CONFIG',
    //客户池---end

    //销售流程--start
    //获取销售流程
    CRM_GET_SALES_PROCESS: 'CRM_GET_SALES_PROCESS',
    //获取通过团队销售流程
    CRM_GET_SALES_PROCESS_BY_TEAM: 'CRM_GET_SALES_PROCESS_BY_TEAM',
    //销售流程--end

    //跟进记录--start
    //跟进记录添加
    CURTAO_CRM_TRACE_ADD: 'CURTAO_CRM_TRACE_ADD',
    //跟进记录更新
    CUSTOMER_TRACE_UPDATE: 'CUSTOMER_TRACE_UPDATE',
    //管理员查询
    CURTAO_CRM_TRACE_QUERY_ALL: 'CURTAO_CRM_TRACE_QUERY_ALL',
    //销售查询
    CURTAO_CRM_TRACE_QUERY_SELF: 'CURTAO_CRM_TRACE_QUERY_SELF',
    //拨打电话
    PHONE_ACCESS_CALL_OU: 'PHONE_ACCESS_CALL_OU',
    //跟进记录--end

    //日程管理--start
    MEMBER_SCHEDULE_MANAGE: 'MEMBER_SCHEDULE_MANAGE',
    //日程管理--end

    //客户批量变更--start
    //团队基础查询权限
    BASE_QUERY_PERMISSION_TEAM: 'BASE_QUERY_PERMISSION_TEAM',
    //客户批量变更--end

    //我的关注--start
    CRM_INTERESTED_CUSTOMER_INFO: 'CRM_INTERESTED_CUSTOMER_INFO',
    //我的关注--end

    //其他--start
    //用户查询
    APP_USER_QUERY: 'APP_USER_QUERY',
    //组织基础查询权限
    BASE_QUERY_PERMISSION_ORGANIZATION: 'BASE_QUERY_PERMISSION_ORGANIZATION',
    //组织配置
    ORGANIZATION_CONFIG: 'ORGANIZATION_CONFIG',
    //线索添加
    CURTAO_CRM_LEAD_ADD: 'CURTAO_CRM_LEAD_ADD',
    //申请新用户和变更用户
    USER_APPLY_APPROVE: 'USER_APPLY_APPROVE',
    //其他--end
};
export default privilegeConst;