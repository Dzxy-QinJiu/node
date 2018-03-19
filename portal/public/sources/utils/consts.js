/**
 * Created by wangliping on 2017/9/8.
 */
//用户类型的下拉选项
export const userTypeList = [
    {name: Intl.get("user.online.all.type", "全部类型"), value: ""},
    {name: Intl.get("user.signed.user", "签约用户"), value: "正式用户"},
    {name: Intl.get("common.trial.user", "试用用户"), value: "试用用户"},
    {name: Intl.get("user.online.free", "赠送用户"), value: "special"},
    {name: Intl.get("user.online.train", "培训用户"), value: "training"},
    {name: Intl.get("user.online.employee", "员工用户"), value: "internal"},
];
// 用户是否过期的下拉选项
export const filterTypeList = [
    {name: Intl.get("common.all", "全部"), value: ""},
    {name: Intl.get("user.overdue", "过期"), value: "1"},
    {name: Intl.get("user.overdue.not", "未过期"), value: "0"}
];
//到期后的处理类型
export const OVER_DRAFT_TYPES = {
    UN_CHANGED: 0,//到期不变
    STOP_USE: 1,//到期停用
    DEGRADE: 2//降级
};
export const ALL_LOG_INFO = Intl.get("user.log.all", "全部日志");
export const AUDIT_LOG = Intl.get("user.log.audit.log", "审计日志");
export const HEARTBEAT_LOG = Intl.get("user.log.heartbeat.service", "心跳服务");
export const ROLE_AUTH_LOG = Intl.get("user.log.role.auth", "角色权限");
// 审计日志的下拉加载
export const logTypeList = [
    {name: ALL_LOG_INFO, value: ALL_LOG_INFO},
    {name: AUDIT_LOG, value: AUDIT_LOG},
    {name: HEARTBEAT_LOG, value: '心跳服务'},
    {name: ROLE_AUTH_LOG, value: '角色权限'}
];

//客户名验证的正则表达式
export const nameRegex = /^[\sa-zA-Z0-9_\-()（）.\u4e00-\u9fa5]{1,50}$/;
//电话号码的校验
//普通的电话号码
export const commonPhoneRegex = /^1[34578]\d{9}$/;
// 区号
export const areaPhoneRegex = /^(0\d{2,3}-?)?[02-9]\d{6,7}$/;
// 400 客服电话
export const hotlinePhoneRegex = /^400-?\d{3}-?\d{4}$/;

export const SYSTEM_NOTICE_TYPES = {
    OFFSITE_LOGIN: "illegalLocation",//异地登录
    DISABLE_CUSTOMER_LOGIN: "appIllegal",//停用客户登录
    FOCUS_CUSTOMER_LOGIN: "concerCustomerLogin"//关注客户登录
};

//系统消息对应的几种类型
export const SYSTEM_NOTICE_TYPE_MAP = {
    "appIllegal": Intl.get("ketao.frontpage.illeagl.login", "停用客户登录"),
    "concerCustomerLogin": Intl.get("ketao.frontpage.focus.customer.login", "关注客户登录"),
    "illegalLocation": Intl.get("ketao.frontpage.illegal.location.login", "异地登录")
};

export const NO_SELECT_FULL_OPTIONS = [
    {value: "not_remind", name: Intl.get("crm.not.alert", "不提醒")},
    {value: "ahead_5min", name: Intl.get("crm.ahead.n.min", "提前{n}分钟", {"n": 5})},
    {value: "ahead_10min", name: Intl.get("crm.ahead.n.min", "提前{n}分钟", {"n": 10})},
    {value: "ahead_15min", name: Intl.get("crm.ahead.n.min", "提前{n}分钟", {"n": 15})},
    {value: "ahead_30min", name: Intl.get("crm.ahead.n.min", "提前{n}分钟", {"n": 30})},
    {value: "ahead_1h", name: Intl.get("crm.ahead.n.hour", "提前{n}小时", {"n": 1})}];
export const SELECT_FULL_OPTIONS = [
    {value: "not_remind", name: Intl.get("crm.not.alert", "不提醒")},
    {value: "thatday_10", name: Intl.get("crm.today.10.clock", "当天上午10点")},
    {value: "ahead_1day_10", name: Intl.get("crm.n.day.10.clock", "{n}天前上午10点", {"n": 1})},
    {value: "ahead_2day_10", name: Intl.get("crm.n.day.10.clock", "{n}天前上午10点", {"n": 2})},
    {value: "ahead_3day_10", name: Intl.get("crm.n.day.10.clock", "{n}天前上午10点", {"n": 3})},
];
export const clueSourceArray = [Intl.get("crm.sales.clue.baidu", "百度搜索"), Intl.get("crm.sales.clue.weibo", "微博推广"), Intl.get("crm.sales.clue.customer.recommend", "客户推荐")];//线索来源
export const accessChannelArray = [Intl.get("crm.sales.clue.phone", "400电话"), Intl.get("crm.sales.clue.qq", "营销QQ")];//接入渠道
//销售团队中角色对应的颜色值（参照echart的颜色列表）
export const COLOR_LIST = [
    "#33a3dc",
    "#93b730",
    "#ddd326",
    "#ffbe2e",
    "#b6d9f7",
    "#0ebfe9",
    "#f8d289",
    "#db0908",
    "#f88916",
    "#4dafde",
    "#f05050",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
    "#795548",
    "#9e9e9e",
    "#607d8b"
];
//不同列表的类型
export const ALL_LISTS_TYPE = {
    SCHEDULE_TODAY: "schedule_today",//今日计划联系日程列表
    WILL_EXPIRED_SCHEDULE_TODAY: "will_expired_schedule_today",//今日到期的日程
    WILL_EXPIRED_TRY_CUSTOMER: "will_expired_try_customer",//即将到期的试用用户
    WILL_EXPIRED_ASSIGN_CUSTOMER: "will_expired_assign_customer",//即将到期的签约用户
    APP_ILLEAGE_LOGIN: "appIllegal",// 停用后登录
    CONCERNED_CUSTOMER_LOGIN: "concerCustomerLogin",//关注客户登录
    RECENT_LOGIN_CUSTOMER: "recent_login_customer",//最近登录的客户
    REPEAT_CUSTOMER: "repeat_customer",//重复客户
};
export const ALL_CUSTOMER_LISTS_TYPE = [
    {value: ALL_LISTS_TYPE.SCHEDULE_TODAY, name: Intl.get("sales.frontpage.will.contact.today", "今日待联系")},//今日计划联系日程列表
    {value: ALL_LISTS_TYPE.WILL_EXPIRED_SCHEDULE_TODAY, name: Intl.get("sales.frontpage.expired.not.contact", "超期未联系")},//今日到期的日程
    {value: ALL_LISTS_TYPE.WILL_EXPIRED_TRY_CUSTOMER, name: Intl.get("sales.frontpage.will.expired.try.user", "即将到期的试用客户")},//即将到期的试用用户
    {value: ALL_LISTS_TYPE.WILL_EXPIRED_ASSIGN_CUSTOMER, name: Intl.get("sales.frontpage.will.expired.assgined.user", "即将到期的签约客户")},//即将到期的签约用户
    {value: ALL_LISTS_TYPE.APP_ILLEAGE_LOGIN, name: Intl.get("sales.frontpage.login.after.stop", "停用后登录")},// 停用后登录
    {value: ALL_LISTS_TYPE.CONCERNED_CUSTOMER_LOGIN, name: Intl.get("ketao.frontpage.focus.customer.login", "关注客户登录")},//关注客户登录
    {value: ALL_LISTS_TYPE.RECENT_LOGIN_CUSTOMER, name: Intl.get("sales.frontpage.login.recently", "近X日登录的客户")},//近X日登录的客户
    {value: ALL_LISTS_TYPE.REPEAT_CUSTOMER, name: Intl.get("sales.frontpage.has.repeat.customer", "您有重复的客户")},//重复客户
];

//处理 或者未处理
//不同列表的类型
export const STATUS = {UNHANDLED: "unhandled", HANDLED: "handled"};