module.exports = {
    //日期格式
    DATE_FORMAT: "YYYY-MM-DD",
    //时间格式
    TIME_FORMAT: "HH:mm:ss",
    //不带秒的时间格式
    TIME_FORMAT_WITHOUT_SECOND_FORMAT:"HH:mm",
    //日期时间格式
    DATE_TIME_FORMAT: "YYYY-MM-DD HH:mm:ss",
    //不带秒的日期时间格式
    DATE_TIME_WITHOUT_SECOND_FORMAT: "YYYY-MM-DD HH:mm",
    //只包含年和月的日期格式
    DATE_YEAR_MONTH_FORMAT: "YYYY-MM",
    //只包含月和日的日期格式
    DATE_MONTH_DAY_FORMAT: "MM-DD",
    //一天的时间的毫秒数
    ONE_DAY_TIME_RANGE: 24 * 60 * 60 * 1000,
    //组织列表中的类型判断
    CATEGORY_TYPE: {
        ORGANIZATION: "0",//组织
        DEPARTMENT: "1",//部门
        TEAM: "2"//团队
    },
    PAGE_ID: {
        //用户审计日志
        USER_AUDIT_LOG: "audit-log",
        //销售首页页面
        SALES_HOME:"sales-home",
        //线索客户
        CLUE_CUSTOMER: "clue-customer"
    },
    //存储已经点击过的功能
    STORE_NEW_FUNCTION:{
        //日程管理模块
        SCHEDULE_MANAGEMENT: {"name":"schedule-management","routePath":"schedule_management"}
    }
};