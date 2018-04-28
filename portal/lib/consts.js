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
    },
    //存储个人配置中的信息
    STORE_PERSONNAL_SETTING:{
        WEBSITE_CONFIG: "websiteConfig",
        RECENT_LOGIN_USER_SELECTED_APP_ID:"recent-login-user-selected-app-id"
    },
    MAP_COLOR: ['rgba(56, 89, 147, 1)','rgba(56, 89, 147, 0.8)','rgba(56, 89, 147, 0.6)','rgba(56, 89, 147, 0.4)','rgba(56, 89, 147, 0.2)'],
    MAP_PROVINCE: [
        {'anhui': '安徽'}, {'aomen': '澳门'}, {'beijing': '北京'}, {'chongqing': '重庆'}, {'fujian': '福建'},
        {'gansu': '甘肃'}, {'guangdong': '广东'}, {'guangxi': '广西'}, {'guizhou': '贵州'}, {'hainan': '海南'},
        {'hebei': '河北'}, {'heilongjiang': '黑龙江'}, {'henan': '河南'}, {'hubei': '湖北'}, {'hunan': '湖南'},
        {'jiangsu': '江苏'}, {'jiangxi': '江西'}, {'jilin': '吉林'}, {'liaoning': '辽宁'}, {'neimenggu': '内蒙古'},
        {'ningxia': '宁夏'}, {'qinghai': '青海'}, {'shandong': '山东'}, {'shanghai': '上海'}, {'shanxi': '陕西'},
        {'shanxi1': '山西'}, {'sichuan': '四川'}, {'taiwan': '台湾'}, {'tianjin': '天津'}, {'xianggang': '香港'},
        {'xinjiang': '新疆'}, {'xizang': '西藏'}, {'yunnan': '云南'}, {'zhejiang': '浙江'}
    ]
};