/**
 * Created by hzl on 2019/11/19.
 */
export default {
    /**
     * 用户管理权限，用于
     * 添加用户
     * 批量改密码
     * 批量改用户所属客户
     * 批量添加授权
     * 批量修改授权类型
     * 批量修改授权状态
     * 批量修改授权周期
     * 批量延期
     * 批量修改角色
     * 用户批量操作
     * 应用用户修改
     * 用户导入
     * */
    // 应该APP_USER_MANAGE 管理员旧权限：USER_BATCH_OPERATE， 销售旧权限：GRANT_DELAY_APPLY
    USER_MANAGE: 'APP_USER_MANAGE',
    /**
     * 用户查询
     * 查看账号下的客户
     * 查看用户
     * 个人信息
     * 用户名前缀查询用户
     * 异常登录信息
     * */
    USER_QUERY: 'APP_USER_QUERY',
    // 审计日志
    USER_AUDIT_LOG_LIST: 'USER_AUDIT_LOG_LIST',
    // 用户分析查询所有角色查询
    CRM_USER_ANALYSIS_ALL_ROLE_QUERY: 'CRM_USER_ANALYSIS_ALL_ROLE_QUERY',
    // 线索权限
    CREATE_CLUE: 'CURTAO_CRM_LEAD_ADD',
    // 日志分析管理员权限
    USER_ANALYSIS_MANAGER: 'USER_ANALYSIS_MANAGER',
    // 日志分析普通人员权限
    USER_ANALYSIS_COMMON: 'USER_ANALYSIS_COMMON'
};
