//批量操作权限
let privilegeConst = {
    //获取全部和客户电话的列表（所有的，包括不在团队里的数据）的权限
    CURTAO_CRM_TRACE_QUERY_ALL: 'CURTAO_CRM_TRACE_QUERY_ALL',
    //获取全部和客户电话的列表（团队）
    //搜索电话号码号码时，提供推荐列表
    CURTAO_CRM_TRACE_QUERY_SELF: 'CURTAO_CRM_TRACE_QUERY_SELF',
    //获取全部和客户电话的列表（团队）的权限
    //统计114或无效通话记录
    //获取通话数量和通话时长趋势图统计(团队)
    //分别返回团队的通话数量和通话时长
    //获取电话的接通情况
    CURTAO_CRM_CALLRECORD_STATISTICS: 'CURTAO_CRM_CALLRECORD_STATISTICS',
    //跟进记录更新
    CUSTOMER_TRACE_UPDATE: 'CUSTOMER_TRACE_UPDATE',
    //获取我的团队以及下属团队成员列表
    BASE_QUERY_PERMISSION_TEAM: 'BASE_QUERY_PERMISSION_TEAM'
};
export default privilegeConst;