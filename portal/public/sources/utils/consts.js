/**
 * Created by wangliping on 2017/9/8.
 */

import {regex} from 'ant-utils';

//用户类型的下拉选项
export const userTypeList = [
    {name: Intl.get('user.online.all.type', '全部类型'), value: ''},
    {name: Intl.get('user.signed.user', '签约用户'), value: '正式用户'},
    {name: Intl.get('common.trial.user', '试用用户'), value: '试用用户'},
    {name: Intl.get('user.online.free', '赠送用户'), value: 'special'},
    {name: Intl.get('user.online.train', '培训用户'), value: 'training'},
    {name: Intl.get('user.online.employee', '员工用户'), value: 'internal'},
];
//用户类型常量(数据库中的值)
export const USER_TYPE_VALUE_MAP = {
    TRIAL_USER: '试用用户', //试用
    SIGN_USER: '正式用户', //签约
    PRESENT_USER: 'special', //赠送
    TRAINING_USER: 'training',//培训
    EMPLOYEE_USER: 'internal'//员工
};

//用户类型文本的map
export const USER_TYPE_TEXT_MAP = {
    TRIAL_USER: Intl.get('common.trial', '试用'),
    SIGN_USER: Intl.get('common.official', '签约'),
    PRESENT_USER: Intl.get('user.type.presented', '赠送'),
    TRAINING_USER: Intl.get('user.type.train', '培训'),
    EMPLOYEE_USER: Intl.get('user.type.employee', '员工')
};

// 用户是否过期的下拉选项
export const filterTypeList = [
    {name: Intl.get('user.online.all.status', '全部状态'), value: ''},
    {name: Intl.get('user.overdue', '过期'), value: '1'},
    {name: Intl.get('user.overdue.not', '未过期'), value: '0'}
];
//到期后的处理类型
export const OVER_DRAFT_TYPES = {
    UN_CHANGED: 0,//到期不变
    STOP_USE: 1,//到期停用
    DEGRADE: 2//降级
};
export const ALL_LOG_INFO = Intl.get('user.log.all', '全部日志');
export const AUDIT_LOG = Intl.get('user.log.audit.log', '审计日志');
export const HEARTBEAT_LOG = Intl.get('user.log.heartbeat.service', '心跳服务');
export const ROLE_AUTH_LOG = Intl.get('user.log.role.auth', '角色权限');
// 审计日志的下拉加载
export const logTypeList = [
    {name: ALL_LOG_INFO, value: ALL_LOG_INFO},
    {name: AUDIT_LOG, value: AUDIT_LOG},
    {name: HEARTBEAT_LOG, value: '心跳服务'},
    {name: ROLE_AUTH_LOG, value: '角色权限'}
];

export const SYSTEM_NOTICE_TYPES = {
    OFFSITE_LOGIN: 'illegalLocation',//异地登录
    DISABLE_CUSTOMER_LOGIN: 'appIllegal',//停用客户登录
    FOCUS_CUSTOMER_LOGIN: 'concerCustomerLogin',//关注客户登录
    LOGIN_FAILED: 'loginFailed',//登录失败
};
export const APPLY_APPROVE_TYPES = {
    CUSTOMER_VISIT: 'customer_visit',//后端传到前端的出差申请的类型
    CUSTOMERVISIT: 'customervisit',//向后端传参数的出差申请类型
    BUSINESS_OPPORTUNITIES: 'business_opportunities',//获取全部销售机会申请前端传给后端的类型，后端传到前端的销售机会的类型
    BUSINESSOPPORTUNITIES: 'businessopportunities',//向后端传参数的销售机会类型
    PERSONAL_LEAVE: 'personal_leave',//获取全部请假申请前端传给后端的类型，后端传到前端请假的类型
    LEAVE: 'leave',//向后端传参数的请假类型
    MEMBER_INVITE: 'member_invite', // 向后端传参数成员申请类型
    UNHANDLECUSTOMERVISIT: 'unhandleCustomerVisit',//未处理的出差申请数量
    UNHANDLEBUSINESSOPPORTUNITIES: 'unhandleBusinessOpportunities',//未处理的销售机会申请数量
    UNHANDLEPERSONALLEAVE: 'unhandlePersonalLeave',//未处理的请假申请数量
    UNHANDLEREPORTSEND: 'unhandleReportSend',//未处理的请假申请数量
    UNHANDLEDOCUMENTWRITE: 'unhandleDocumentWrite',//未处理的请假申请数量
    UNHANDLEMEMBERINIVTE: 'unhandleMemberInivte', // 未处理的成员申请数量
    UNHANDLE_USER_APPLY: 'approve',//待处理的用户申请
    REPORT: 'report',//向后端传获取全部申请舆情报送的类型及后端返回的类型
    DOCUMENT: 'document',//文件撰写的类型
    OPINIONREPORT: 'opinionreport',//向后端传获取待我审批的舆情报送的类型
    DOCUMENTWRITING: 'documentwriting',//向后端传的文件撰写的类型
    DOCUMENT_WRITING: 'document_writing',//前端未读回复中文件撰写类型
    OPINION_REPORT: 'opinion_report',
};

//系统消息对应的几种类型
export const SYSTEM_NOTICE_TYPE_MAP = {
    'appIllegal': Intl.get('ketao.frontpage.illeagl.login', '停用客户登录'),
    'concerCustomerLogin': Intl.get('ketao.frontpage.focus.customer.login', '关注客户登录'),
    'loginFailed': Intl.get('notification.login.failed', '登录失败'),
    'illegalLocation': Intl.get('ketao.frontpage.illegal.location.login', '异地登录')
};

export const NO_SELECT_FULL_OPTIONS = [
    {value: 'not_remind', name: Intl.get('crm.not.alert', '不提醒')},
    {value: 'ahead_5min', name: Intl.get('crm.ahead.n.min', '提前{n}分钟', {'n': 5})},
    {value: 'ahead_10min', name: Intl.get('crm.ahead.n.min', '提前{n}分钟', {'n': 10})},
    {value: 'ahead_15min', name: Intl.get('crm.ahead.n.min', '提前{n}分钟', {'n': 15})},
    {value: 'ahead_30min', name: Intl.get('crm.ahead.n.min', '提前{n}分钟', {'n': 30})},
    {value: 'ahead_1h', name: Intl.get('crm.ahead.n.hour', '提前{n}小时', {'n': 1})}];
export const SELECT_FULL_OPTIONS = [
    {value: 'not_remind', name: Intl.get('crm.not.alert', '不提醒')},
    {value: 'thatday_10', name: Intl.get('crm.today.10.clock', '当天上午10点')},
    {value: 'ahead_1day_10', name: Intl.get('crm.n.day.10.clock', '{n}天前上午10点', {'n': 1})},
    {value: 'ahead_2day_10', name: Intl.get('crm.n.day.10.clock', '{n}天前上午10点', {'n': 2})},
    {value: 'ahead_3day_10', name: Intl.get('crm.n.day.10.clock', '{n}天前上午10点', {'n': 3})},
];

// 用户类型的国际化
export const USER_TYPE_GLOBAL = {
    'trial': Intl.get('common.trial', '试用'),
    'official': Intl.get('common.official', '签约'),
    'presented': Intl.get('user.type.presented', '赠送'),
    'train': Intl.get('user.type.train', '培训'),
    'employee': Intl.get('user.type.employee', '员工')

};

// 时间选择的国际化
export const TIME_RANGE_GLOBAL = {
    'week': Intl.get('common.time.unit.week', '周'),
    'half': Intl.get('user.time.half.month', '半个月'),
    'one': Intl.get('user.time.one.month', '1个月'),
    'six': Intl.get('user.time.six.month', '6个月'),
    'twelve': Intl.get('user.time.twelve.month', '12个月'),
    'forever': Intl.get('common.time.forever', '永久')
};
export const clueSourceArray = [Intl.get('crm.sales.clue.baidu', '百度搜索'), Intl.get('crm.sales.clue.weibo', '微博推广'), Intl.get('crm.sales.clue.customer.recommend', '客户推荐')];//线索来源
export const accessChannelArray = [Intl.get('crm.sales.clue.phone', '400电话'), Intl.get('crm.sales.clue.qq', '营销QQ')];//接入渠道
export const clueClassifyArray = [Intl.get('sales.home.customer', '客户'), Intl.get('clue.customer.classify.agend', '代理商'), Intl.get('clue.customer.classify.search', '学术研究')];//线索分类
//销售团队中角色对应的颜色值（参照echart的颜色列表）
export const COLOR_LIST = [
    '#33a3dc',
    '#93b730',
    '#ddd326',
    '#ffbe2e',
    '#b6d9f7',
    '#0ebfe9',
    '#f8d289',
    '#db0908',
    '#f88916',
    '#4dafde',
    '#f05050',
    '#f44336',
    '#e91e63',
    '#9c27b0',
    '#673ab7',
    '#3f51b5',
    '#2196f3',
    '#03a9f4',
    '#00bcd4',
    '#009688',
    '#4caf50',
    '#8bc34a',
    '#cddc39',
    '#ffeb3b',
    '#ffc107',
    '#ff9800',
    '#ff5722',
    '#795548',
    '#9e9e9e',
    '#607d8b'
];
//不同列表的类型
export const ALL_LISTS_TYPE = {
    SCHEDULE_TODAY: 'schedule_today',//今日计划联系日程列表
    WILL_EXPIRED_SCHEDULE_TODAY: 'will_expired_schedule_today',//今日到期的日程
    WILL_EXPIRED_TRY_CUSTOMER: 'will_expired_try_customer',//即将到期的试用用户
    HAS_EXPIRED_TRY_CUSTOMER: 'has_expired_try_customer',//过去十天已经到期的试用用户
    WILL_EXPIRED_ASSIGN_CUSTOMER: 'will_expired_assign_customer',//即将到期的签约用户
    APP_ILLEAGE_LOGIN: 'appIllegal',// 停用后登录
    CONCERNED_CUSTOMER_LOGIN: 'concerCustomerLogin',//关注客户登录
    RECENT_LOGIN_CUSTOMER: 'recent_login_customer',//最近登录的客户
    REPEAT_CUSTOMER: 'repeat_customer',//重复客户
    NEW_DISTRIBUTE_CUSTOMER: 'new_distribute_customer',//新分配的客户
    HAS_NO_CONNECTED_PHONE: 'has_no_connected_phone',//你有未接听的来电
    LOGIN_FAILED: 'loginFailed',//登录失败
    SALES_CLUE: 'sales_clue',//销售线索

};
export const ALL_CUSTOMER_LISTS_TYPE = [
    {value: ALL_LISTS_TYPE.SCHEDULE_TODAY, name: Intl.get('sales.frontpage.will.contact.today', '今日待联系')},//今日计划联系日程列表
    {value: ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY, name: Intl.get('sales.frontpage.expired.not.contact', '超期未联系')},//今日到期的日程
    {
        value: ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER,
        name: Intl.get('sales.frontpage.will.expired.try.user', '近{X}天将到期的试用客户', {X: Intl.get('user.num.ten', '十')})
    },//即将到期的试用用户
    {
        value: ALL_LISTS_TYPE.HAS_EXPIRED_TRY_CUSTOMER,
        name: Intl.get('sales.frontpage.has.expired.try.user', '近{X}天已过期的试用客户', {X: Intl.get('user.num.ten', '十')})
    },//已经到期的试用用户
    {
        value: ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER,
        name: Intl.get('sales.frontpage.will.expired.assgined.user', '近{X}将到期的签约客户', {X: Intl.get('user.time.half.year1', '半年')})
    },//即将到期的签约用户
    {value: ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN, name: Intl.get('sales.frontpage.login.after.stop', '停用后登录')},// 停用后登录
    {value: ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN, name: Intl.get('ketao.frontpage.focus.customer.login', '关注客户登录')},//关注客户登录
    {value: ALL_LISTS_TYPE.LOGIN_FAILED, name: Intl.get('notification.login.failed', '登录失败')},//登录失败
    {
        value: ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER,
        name: Intl.get('sales.frontpage.login.recently', '近{X}日登录的客户', {X: Intl.get('user.num.seven', '七')})
    },//近7日登录的客户
    {value: ALL_LISTS_TYPE.REPEAT_CUSTOMER, name: Intl.get('sales.frontpage.has.repeat.customer', '您有重复的客户')},//重复客户
    {
        value: ALL_LISTS_TYPE.NEW_DISTRIBUTE_CUSTOMER,
        name: Intl.get('sales.frontpage.new.distribute.customer', '新分配但未联系的客户')
    },
    {
        value: ALL_LISTS_TYPE.HAS_NO_CONNECTED_PHONE,
        name: Intl.get('sales.frontpage.has.no.conneted', '您有电话未接听')
    },
    {
        value: ALL_LISTS_TYPE.SALES_CLUE,
        name: Intl.get('sales.home.sales.clue', '待处理的线索')

    }
];

//处理 或者未处理
//不同列表的类型
export const STATUS = {UNHANDLED: 'unhandled', HANDLED: 'handled'};
export const CALL_TYPE_OPTION = {
    ALL: 'all',
    PHONE: 'phone,curtao_phone',
    APP: 'app'
};

// 合同类型
export const CategoryList = [
    {value: '产品合同', name: Intl.get('contract.6', '产品合同')},
    {value: '项目合同', name: Intl.get('contract.7', '项目合同')},
    {value: '服务合同', name: Intl.get('contract.8', '服务合同')}
];

// 合同签约类型
export const ContractLabel = [
    {value: 'new', name: Intl.get('crm.contract.new.sign', '新签')},
    {value: 'extension', name: Intl.get('contract.163', '续约')},
];

export const LITERAL_CONSTANT = {
    ALL: Intl.get('common.all', '全部'),
    TEAM: Intl.get('user.user.team', '团队'),
    MEMBER: Intl.get('member.member', '成员')
};
export const FIRSR_SELECT_DATA = [LITERAL_CONSTANT.TEAM, LITERAL_CONSTANT.MEMBER];

//常用筛选范围
export const FILTER_RANGE = {
    ALL: {
        name: '全部可见',
        value: 'all'
    },
    TEAM: {
        name: '团队可见',
        value: 'team'
    },
    USER: {
        name: '自己可见',
        value: 'user'
    }
};

//常用筛选范围
export const FILTER_RANGE_OPTIONS = [
    FILTER_RANGE.USER,
    FILTER_RANGE.TEAM,
    FILTER_RANGE.ALL
];

//其他类型筛选中的选项
export const OTHER_FILTER_ITEMS = {
    NEVER_CONTACT: 'never_contact',
    THIRTY_UNCONTACT: 'thirty_uncontact',
    FIFTEEN_UNCONTACT: 'fifteen_uncontact',
    SEVEN_UNCONTACT: 'seven_uncontact',
    THIRTY_NO_CONNECTION: 'thirty_no_connection',//近30天拨打未接通的客户
    THIRTY_NO_CALL: 'thirty_no_call',//超30天未打过电话
    UNDISTRIBUTED: 'undistributed',//未分配的客户
    NO_CONTACT_WAY: 'no_contact_way',//无联系方式的客户
    LAST_CALL_NO_RECORD: 'last_call_no_record',//最后联系但未写跟进记录的客户
    THIRTY_NO_LAST_TRACE: 'thirty_no_last_trace',//近30天未写跟进记录的客户
    FIFTEEN_NO_LAST_TRACE: 'fifteen_no_last_trace',//近15天未写跟进记录的客户
    SEVEN_NO_LAST_TRACE: 'seven_no_last_trace',//近7天未写跟进记录的客户
    INTEREST_MEMBER_IDS: 'interest_member_ids',//被关注的客户
    MY_INTERST: 'my_interest',//我关注的客户
    MULTI_ORDER: 'multi_order',//多个订单的客户
    AVAILABILITY: 'availability',//有效客户
    SEVEN_LOGIN: 'seven_login',//一周内登录
    MONTH_LOGIN: 'month_login',//一个月内登录
    TEAM_CUSTOMER: 'team_customer',//团队客户
    THIS_WEEK_CONTACTED: 'this_week_contacted'//本周联系过的客户
};

export const DAY_TIME = {
    THIRTY_DAY: 30 * oplateConsts.ONE_DAY_TIME_RANGE,//30天
    FIFTEEN_DAY: 15 * oplateConsts.ONE_DAY_TIME_RANGE,//15天
    SEVEN_DAY: 7 * oplateConsts.ONE_DAY_TIME_RANGE//7天
};

export const STAGE_OPTIONS = [
    {
        name: '',
        show_name: Intl.get('common.all', '全部')
    },
    {
        name: Intl.get('user.unknown', '未知'),
        show_name: Intl.get('user.unknown', '未知')
    }
];

export const UNKNOWN = Intl.get('user.unknown', '未知');

export const COMMON_OTHER_ITEM = 'otherSelectedItem';

//标签选项下的特殊标签
export const SPECIAL_LABEL = {
    NON_TAGGED_CUSTOMER: Intl.get('crm.tag.unknown', '未打标签的客户'),
    TURN_OUT: Intl.get('crm.qualified.roll.out', '转出'),
    CLUE: Intl.get('crm.sales.clue', '线索'),
    HAS_CALL_BACK: Intl.get('common.has.callback', '已回访'),
};
export const selectMenuList = [
    {
        key: 'all', value: Intl.get('user.apply.all', '全部申请'),
    },
    {
        key: 'ongoing', value: Intl.get('leave.apply.my.worklist.apply', '待我审批'),
    }
    , {
        key: 'pass', value: Intl.get('user.apply.pass', '已通过'),
    }
    , {
        key: 'reject', value: Intl.get('user.apply.reject', '已驳回'),
    },{
        key: 'cancel', value: Intl.get('user.apply.backout', '已撤销'),
    }];
//申请列表滚动条参数
export const APPLY_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA: 64 * 2,
    BOTTOM_DELTA: 50
};


//多应用申请审批类型
export const APPLY_TYPES = {
    DELAY: 'apply_grant_delay_multiapp',
    DISABLE: 'apply_grant_status_change_multiapp',
    APPLY_PWD_CHANGE: 'apply_pwd_change',//修改密码
    APPLY_STH_ELSE: 'apply_sth_else',//其他类型
    APPLY_GRANT_DELAY: 'apply_grant_delay',//延期申请
    APPLY_GRANT_STATUS_CHANGE: 'apply_grant_status_change'//申请开通状态
};

//多应用申请审批类型
export const APPLY_MULTI_TYPE_VALUES = [
    APPLY_TYPES.DELAY, APPLY_TYPES.DISABLE
];
//请假申请的请假类型
export const LEAVE_TYPE = [{
    name: Intl.get('leave.apply.personnal.leave','事假'), value: 'personal_leave'
},{
    name: Intl.get('leave.apply.sick.leave','病假'), value: 'sick_leave'
},{
    name: Intl.get('leave.apply.annual.leave', '年假'), value: 'annual_leave'
},{
    name: Intl.get('crm.186', '其他'), value: 'other_leave'
}];
export const DELAY_TIME_RANGE = {
    SUCCESS_RANGE: 1600,
    ERROR_RANGE: 3000,
    CLOSE_RANGE: 1500,
    BEGIN_AND_END_RANGE: 1 * 60 * 60 * 1000//一个小时的毫秒数
};

export const APPLY_STATUS = {
    READY_APPLY: Intl.get('leave.apply.apartment.apply', '上级主管'),
    ASSIGN_SALES_APPLY: Intl.get('leave.apply.general.apply','分配销售'),
};

//订单状态
export const DEAL_STATUS = {
    WIN: 'win',//赢单
    LOSE: 'lose'//丢单
};
//舆情报告类型
export const REPORT_TYPE = [{
    name: Intl.get('contract.13', '日报'), value: 'daily_report'
}, {
    name: Intl.get('contract.14', '周报'), value: 'weekly_report'
},
{
    name: Intl.get('contract.15', '月报'), value: 'monthly_report'
},
{
    name: Intl.get('apply.approve.quarty.report', '季报'), value: 'quarterly_report'
}, {
    name: Intl.get('contract.16', '年报'), value: 'annual_report'
},
{
    name: Intl.get('contract.17', '专报'), value: 'special_report'
}, {
    name: Intl.get('crm.186', '其他'), value: 'other_report'
},];
//文件撰写类型
export const DOCUMENT_TYPE = [
    {name: Intl.get('apply.approve.tender.documents', '招标文件'), value: 'tender_document'},
    {name: Intl.get('apply.approve.bide.documents', '投标文件'), value: 'bid_document'},
    {name: Intl.get('apply.approve.construction.plan', '建设方案'), value: 'build_document'},
    {name: Intl.get('apply.approve.other.plan', '其他文件'), value: 'other_document'},
];
//顶部导航的高度
export const TOP_NAV_HEIGHT = 64;
export const DIFF_TYPE_LOG_FILES = {
    SALE_UPLOAD: 'sale_upload',//销售添加申请时上传的文件
    SALE_UPLOAD_NEW: 'sale_upload_new',//销售在支持部人确认申请前添加的文件和销售添加申请后添加的文件
    APPROVER_UPLOAD: 'approver_upload'//支持部上传的文件
};
export const AM_AND_PM = {
    AM: 'AM',
    PM: 'PM'
};
//请假申请的类型
export const LEAVE_TIME_RANGE = [
    {name: Intl.get('apply.approve.leave.am','上午'),value: AM_AND_PM.AM},
    {name: Intl.get('apply.approve.leave.pm','下午'),value: AM_AND_PM.PM}
];

//集成类型
export const INTEGRATE_TYPES = {
    UEM: 'uem',//默认类型（客套-用户参与度）
    OPLATE: 'oplate',
    MATOMO: 'matomo',
    NORMAL: 'normal'//普通产品
};
//申请审批刷新待审批数的时间间隔
export const REFRESH_APPLY_RANGE = 1000;//1秒后刷新未读数
export const APPLY_TYPE_STATUS_CONST = {
    ONGOING: 'ongoing',
    PASS: 'pass',
    CANCEL: 'cancel',
    REJECT: 'reject',
    ALL: 'all',
    MYAPPROVED: 'myApproved'
};
//组织类型
export const ORGANIZATION_TYPE = {
    EEFUNG: '36v8tudu9Z', // 蚁坊
    CIVIW: '36duh3ok3i'//识微
};
export const APPLY_FINISH_STATUS = ['pass', 'reject', 'cancel'];
export const APPLY_USER_STATUS = {
    CANCELED_USER_APPLY: '3',//已撤销
    PASSED_USER_APPLY: '1',//已通过
    REJECTED_USER_APPLY: '2'//已驳回
};
//文件禁止上传的规则
export const FILES_TYPE_FORBIDDEN_RULES = [
    {value: ' ',messageTips: Intl.get('apply.approve.upload.no.container.space', '文件名称中不要含有空格！')}
];
//文件允许的上传规则
export const FILES_TYPE_ALLOW_RULES = [
    {valueArr: ['docx','doc','ppt','pptx','pdf','xls','xlsx','csv','png','bmp','jpg','txt','rar','zip'],messageTips: Intl.get('apply.approve.upload.error.file.type','文件格式不正确！')},
];
//两个值一个是文件的最小值一个是文件的最大值
export const REG_FILES_SIZE_RULES = [
    {minValue: 0, messageTips: Intl.get('apply.approve.upload.empty.file','不可上传空文件！')},
    {maxValue: 10 * 1024 * 1024, messageTips: Intl.get('apply.approve.upload.not.more.than50','文件大小不能超过10M!')},
];

export const XLS_FILES_TYPE_RULES = [
    {valueArr: ['xls'],messageTips: Intl.get('clue.import.file.type','只能导入{type}格式的文件！',{type: 'xls'})},
];

export const CSV_FILES_TYPE_RULES = [
    {valueArr: ['csv'],messageTips: Intl.get('clue.import.file.type','只能导入{type}格式的文件！',{type: 'csv'})},
];
export const FINAL_TASK = 'final_task';
export const DIFF_APPLY_TYPE_UNREAD_REPLY = {
    APPLY_UNREAD_REPLY: 'apply_unread_reply',
    DIFF_APPLY_UNREAD_REPLY: 'diff_apply_unread_reply'
};

// 用户分析中，时间选择类型
export const DATE_SELECT = [
    {name: Intl.get('user.login.last.year', '近一年'), value: 'year'},
    {name: Intl.get('user.login.last.month', '近一月'), value: 'month' },
    {name: Intl.get('user.login.last.week', '近一周'), value: 'week'}
];
//为配置坐席号的错误提示
export const PHONE_NOT_SETTING_TIP = '未绑定座席号!';
//上传文件是计算单个文件大小还是计算总文件大小
export const FILES_LIMIT = {
    TOTAL: 'total',
    SINGLE: 'single'
};