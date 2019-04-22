module.exports = {
    //日期格式
    DATE_FORMAT: 'YYYY-MM-DD',
    //时间格式
    TIME_FORMAT: 'HH:mm:ss',
    //小时:分钟的时间格式
    HOUR_MUNITE_FORMAT: 'HH:mm',
    //不带秒的时间格式
    TIME_FORMAT_WITHOUT_SECOND_FORMAT: 'HH:mm',
    //日期时间格式
    DATE_TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
    //不带秒的日期时间格式
    DATE_TIME_WITHOUT_SECOND_FORMAT: 'YYYY-MM-DD HH:mm',
    //只有年的日期格式
    DATE_TIME_YEAR_FORMAT: 'YYYY',
    //只包含年和月的日期格式
    DATE_YEAR_MONTH_FORMAT: 'YYYY-MM',
    //只包含月和日的日期格式
    DATE_MONTH_DAY_FORMAT: 'MM-DD',
    // 时间格式为：MM-DD HH:mm
    DATE_MONTH_DAY_HOUR_MIN_FORMAT: 'MM-DD HH:mm',
    //一天的时间的毫秒数
    ONE_DAY_TIME_RANGE: 24 * 60 * 60 * 1000,
    //一小时的毫秒数
    ONE_HOUR_TIME_RANGE: 60 * 60 * 1000,
    //组织列表中的类型判断
    CATEGORY_TYPE: {
        ORGANIZATION: '0',//组织
        DEPARTMENT: '1',//部门
        TEAM: '2'//团队
    },
    PAGE_ID: {
        //用户审计日志
        USER_AUDIT_LOG: 'audit-log',
        //销售首页页面
        SALES_HOME: 'sales-home',
        //线索客户
        CLUE_CUSTOMER: 'clue-customer'
    },
    //存储已经点击过的功能
    STORE_NEW_FUNCTION: {
        //日程管理模块
        SCHEDULE_MANAGEMENT: {'name': 'schedule-management','routePath': 'schedule_management'}
    },
    //存储个人配置中的信息
    STORE_PERSONNAL_SETTING: {
        WEBSITE_CONFIG: 'websiteConfig',
        RECENT_LOGIN_USER_SELECTED_APP_ID: 'recent-login-user-selected-app-id',
        CONCERN_CUSTOMER_TOP_FLAG: 'concern_customer_top_flag',//关注客户置顶的标识
        SETTING_CLIENT_NOTICE_IGNORE: 'setting_client_notice_ignore',//是否点击过不再提示配置坐席号的提示
    },
    MAP_COLOR: ['rgba(56, 89, 147, 1)','rgba(56, 89, 147, 0.8)','rgba(56, 89, 147, 0.6)','rgba(56, 89, 147, 0.4)','rgba(56, 89, 147, 0.2)'],
    MAP_PROVINCE: {
        '安徽': 'anhui', '澳门': 'aomen', '北京': 'beijing', '重庆': 'chongqing', '福建': 'fujian',
        '甘肃': 'gansu', '广东': 'guangdong', '广西': 'guangxi', '贵州': 'guizhou', '海南': 'hainan',
        '河北': 'hebei', '黑龙江': 'heilongjiang', '河南': 'henan', '湖北': 'hubei', '湖南': 'hunan',
        '江苏': 'jiangsu', '江西': 'jiangxi', '吉林': 'jilin', '辽宁': 'liaoning', '内蒙古': 'neimenggu',
        '宁夏': 'ningxia', '青海': 'qinghai', '山东': 'shandong', '上海': 'shanghai', '陕西': 'shanxi1',
        '山西': 'shanxi', '四川': 'sichuan', '台湾': 'taiwan', '天津': 'tianjin', '香港': 'xianggang',
        '新疆': 'xinjiang', '西藏': 'xizang', '云南': 'yunnan', '浙江': 'zhejiang'
    },
    //页面布局常量
    LAYOUT: {
        TOP_NAV: 64,
        PADDING_BOTTOM: 16
    },
    //角色常量
    ROLE_CONSTANS: {
        //运营人员
        OPERATION_PERSON: 'operations',
        //销售
        SALES: 'sales',
        //舆情秘书
        SECRETARY: 'salesmanager',
        //销售负责人
        SALES_LEADER: 'salesleader',
        //组织管理员
        REALM_ADMIN: 'realm_manager',
        //组织所有者
        REALM_OWNER: 'realm_owner',
        //合同管理员
        CONTRACT_ADMIN: 'contract_manager',
        //财务
        ACCOUNTANT: 'accountant'
    },
    FINISH_INITIALED_PHONE: ''
};
