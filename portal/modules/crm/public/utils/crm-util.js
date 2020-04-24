import classNames from 'classnames';
import history from 'PUB_DIR/sources/history';
var userData = require('../../../../public/sources/user-data');
import crmPrivilegeConst from '../privilege-const';
import { checkVersionAndType } from 'PUB_DIR/sources/utils/common-method-util';
// 跟进记录类型常量
const CALL_RECORD_TYPE = {
    PHONE: 'phone',//呼叫中心 - effung的电话系统（讯时+usterisk）
    CURTAO_PHONE: 'curtao_phone',//呼叫中心 - 容联的电话系统（curtao默认通话系统）
    APP: 'app',//客套APP
    CALL_BACK: 'call_back',//回访
    VISIT: 'visit',//拜访
    DATA_REPORT: 'data_report',//舆情报送
    PUBLIC_OPINION_REPORT: 'public_opinion_report', //舆情报告
    OTHER: 'other'//其他
};
exports.CALL_RECORD_TYPE = CALL_RECORD_TYPE;
exports.TAB_KEYS = {
    OVERVIEW_TAB: '1',//概览页
    CONTACT_TAB: '2',//联系人
    TRACE_TAB: '3',//跟进记录
    USER_TAB: '4',//用户
    ORDER_TAB: '5',//订单
    CONTRACT_TAB: '6', // 合同
    DYNAMIC_TAB: '7',//动态
    SCHEDULE_TAB: '8'//日程
};
//将后端传来的字段拼接成句子
const processForTrace = function(item) {
    var traceObj = {
        traceDsc: '',
        iconClass: '',
        title: '',
        detail: ''
    };
    if (_.isObject(item)) {
        //渲染时间线
        //根据不同的类型
        if (item.type) {
            if (item.call_back === 'true') {
                traceObj.iconClass = 'icon-callback';
                traceObj.title = Intl.get('common.callback', '回访');
                traceObj.traceDsc = Intl.get('common.callback.customer', '回访客户');
            } else {
                switch (item.type) {
                    case CALL_RECORD_TYPE.VISIT:
                        traceObj.iconClass = 'icon-visit-briefcase';
                        traceObj.title = Intl.get('customer.visit', '拜访');
                        traceObj.traceDsc = Intl.get('customer.visit.customer', '拜访客户');
                        break;
                    case CALL_RECORD_TYPE.PHONE:
                        traceObj.iconClass = 'icon-contact-phone';
                        traceObj.title = Intl.get('common.phone.system', '电话系统');
                        traceObj.traceDsc = (!item.contact_name && !item.dst) ? Intl.get('customer.contact.customer', '联系客户') : item.contact_name || '';
                        break;
                    case CALL_RECORD_TYPE.CURTAO_PHONE:
                        traceObj.iconClass = 'icon-contact-phone';
                        traceObj.title = Intl.get('common.phone.system', '电话系统');
                        traceObj.traceDsc = (!item.contact_name && !item.dst) ? Intl.get('customer.contact.customer', '联系客户') : item.contact_name || '';
                        break;
                    case CALL_RECORD_TYPE.APP:
                        traceObj.iconClass = 'icon-contact-ketao-app';
                        traceObj.title = Intl.get('customer.ketao.app', '客套app');
                        traceObj.traceDsc = (!item.contact_name && !item.dst) ? Intl.get('customer.contact.customer', '联系客户') : item.contact_name || '';
                        break;
                    case CALL_RECORD_TYPE.DATA_REPORT:
                        traceObj.iconClass = 'icon-report-delivery';
                        traceObj.title = Intl.get('crm.trace.delivery.report', '舆情报送');
                        traceObj.traceDsc = Intl.get('crm.trace.delivery.report', '舆情报送');
                        break;
                    case CALL_RECORD_TYPE.PUBLIC_OPINION_REPORT:
                        traceObj.iconClass = '';
                        traceObj.title = '';
                        traceObj.traceDsc = '';
                        break;
                    case CALL_RECORD_TYPE.OTHER:
                        traceObj.iconClass = 'icon-trace-other';
                        traceObj.title = Intl.get('customer.other', '其他');
                        traceObj.traceDsc = Intl.get('customer.follow.customer', '跟进客户');
                        break;
                }
            }
        }
        traceObj.iconClass += ' iconfont';
        traceObj.detail = item.detail;
    }
    return traceObj;
};
//是否是线索标签
const isClueTag = function(tag){
    return tag === Intl.get('crm.sales.clue','线索');
};
//是否是试用合格后"转出"标签
exports.isTurnOutTag = function(tag){
    return tag === Intl.get('crm.qualified.roll.out','转出');
};
// 是否是已回访标签
exports.isHasCallBackTag = function(tag) {
    return tag === Intl.get('common.has.callback', '已回访');
};
const unmodifiableTags = [Intl.get('crm.sales.clue', '线索'), Intl.get('crm.qualified.roll.out', '转出'), Intl.get('common.has.callback', '已回访')];
//是否是不可修改的标签（线索、转出、已回访）
exports.isUnmodifiableTag = function(tag) {
    return _.indexOf(unmodifiableTags, tag) !== -1;
};

//获取客户标签背景色对应的类型
exports.getCrmLabelCls = function(customer_label) {
    const LABEL_TYPES = {
        INFO_TAG: '信息',
        INTENT_TAG: '意向',
        TRIAL_TAG: '试用',
        SIGN_TAG: '签约',
        LOSS_TAG: '流失',
        RE_CONTRACT: '续约'
    };
    let customerLabelCls = 'customer-label';
    if (customer_label) {
        customerLabelCls = classNames(customerLabelCls, {
            'info-tag-style': customer_label === LABEL_TYPES.INFO_TAG,
            'intent-tag-style': customer_label === LABEL_TYPES.INTENT_TAG,
            'trial-tag-style': customer_label === LABEL_TYPES.TRIAL_TAG,
            'sign-tag-style': customer_label === LABEL_TYPES.SIGN_TAG,
            'qualified-tag-style': customer_label === 1,//合格
            'history-qualified-tag-style': customer_label === 2,//曾经合格
            'loss-tag-style': customer_label === LABEL_TYPES.LOSS_TAG,
            're-contract-tag-style': customer_label === LABEL_TYPES.RE_CONTRACT,
        });
    }
    return customerLabelCls;
};

exports.UNKNOWN = Intl.get('user.unknown', '未知');
exports.UNKNOWN_KEY = 'unknown';

//行政级别
exports.administrativeLevels = [{id: '0',level: Intl.get('crm.Administrative.level.0', '部委级')},
    {id: '1',level: Intl.get('crm.Administrative.level.1', '省部级')},
    {id: '2',level: Intl.get('crm.Administrative.level.2', '地市级')},
    {id: '3',level: Intl.get('crm.Administrative.level.3', '区县级')}];
exports.filterAdministrativeLevel = (level) => {
    //4：乡镇、街道，目前只要求展示到区县，所以此级别不展示
    return level >= 0 && level !== 4 ? level + '' : '';
};
exports.processForTrace = processForTrace;
exports.isClueTag = isClueTag;
exports.CUSTOMER_TAGS = {
    QUALIFIED: Intl.get('common.qualified', '合格'),
    HISTORY_QUALIFIED: Intl.get('common.history.qualified', '曾经合格'),
    NEVER_QUALIFIED: Intl.get('common.never.qualified', '从未合格')
};
//tab页上对应的描述
var tabNameList = {
    '1': '概览',
    '2': '联系人',
    '3': '跟进记录',
    '4': '用户',
    '5': '订单',
    '6': '合同',
    '7': '动态',
    '8': '联系计划'
};
exports.tabNameList = tabNameList;
exports.getMyUserId = function() {
    var userId = '';
    if (userData.getUserData() && userData.getUserData().user_id){
        userId = userData.getUserData().user_id;
    }
    return userId;
};
//客户可排序字段的对应(字符串类型的字段后面需要加.raw, 加上后排序不分词)
exports.CUSOTMER_SORT_MAP = {
    id: 'id.raw',
    user_name: 'user_name.raw',//销售昵称
    name: 'name.raw',//客户名
    province: 'province.raw',//省份
    city: 'city.raw',//城市
    county: 'county.raw',//区县
    industry: 'industry.raw',//行业
    sales_team: 'sales_team.raw',//团队
    labels: 'labels.raw',//标签
    interest_member_ids: 'interest_member_ids.raw',//关注客户
    start_time: 'start_time',//添加时间
    sign_time: 'sign_time',//签订时间
    last_contact_time: 'last_contact_time',//最后联系时间
    administrative_level: 'administrative_level',//行政等级
    score: 'score',//客户分数
    score_past: 'score_past'//客户昨天的分数
};

exports.getApplyActiveEmailTip = (applyErrorMsg) => {
    if (applyErrorMsg === Intl.get('errorcode.12', '您的邮箱未激活，请先激活邮箱')) {
        return (
            <span className="apply-active-email-tip">
                <ReactIntl.FormattedMessage
                    id='crm.apply.active.email.tip'
                    defaultMessage={'您的邮箱未激活，请先{aciveEmail}'}
                    values={{
                        'aciveEmail': (
                            <a onClick={() => {
                                //跳转到个人资料界面，设置邮箱或激活
                                history.push('/user-preference');
                            }}>
                                {Intl.get('sales.frontpage.active.email', '激活邮箱')}
                            </a>),
                    }}
                />
            </span>);
    }
    return applyErrorMsg;
};
exports.AUTHS = {
    'GETALL': crmPrivilegeConst.CUSTOMER_ALL,
    'UPDATE_ALL': crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL,
    'TRANSFER_MANAGER': crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
};
//用于布局的高度
exports.LAYOUT_CONSTANTS = {
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //跟进记录页的下边距
    ADD_TRACE_HEIGHHT: 155,//添加跟进记录面板的高度
    PHONE_STATUS_HEIGHT: 30,//通话状态筛选框的高度
    TIME_ADD_BTN_HEIGHT: 30,//时间选择框和跟进记录的高度
    STATISTIC_TYPE_HEIGHT: 50,//类型统计高度
    OVER_VIEW_LOADING_HEIGHT: 30//概览页”最新跟进“加载效果的高度
};
//客户视图类型
exports.CRM_VIEW_TYPES = {
    CRM_LIST: 'customer_list',//客户列表
    CRM_REPEAT: 'customer_repeat',//重复客户
    CRM_RECYCLE: 'customer_recycle',//回收站
    CRM_POOL: 'customer_pool',//客户池
};

//检测是否有权限
exports.checkPrivilege = function(list) {
    if (typeof list === 'string') {
        list = [list];
    }
    var userInfo = userData.getUserData() || {};
    var privileges = userInfo.privileges || [];
    for(let i = 0; i < list.length; i++) {
        var checkPrivilege = list[i].toLowerCase();
        var hasPrivilege = _.find(privileges, function(item) {
            if (item.toLowerCase() === checkPrivilege) {
                return true;
            }
        });
        if(hasPrivilege) {
            return true;
        }
    }
    return false;
};

//释放客户的提示
exports.releaseCustomerTip = function() {
    let releaseTip = Intl.get('crm.customer.release.tip', '释放后其他人可以查看和提取。');
    if(checkVersionAndType().personal) {//个人版
        releaseTip = Intl.get('crm.customer.personal.release.confirm.tip', '释放后可以再从客户池提取');
    }
    return releaseTip;
};
// 获取详情中展示个面板内容的高度
exports.getDetailLayoutHeight = (hasTotal) => {
    const LAYOUT_CONSTANTS = {
        TOP_NAV_HEIGHT: 44,//36：头部导航的高度，8：导航的下边距
        TOTAL_HEIGHT: 32,// 24:共xxx个的高度,8:共xxx个的下边距
        MARGIN_BOTTOM: 8, //下边距
        BASIC_DEFAULT_HEIGHT: 57//基本信息默认收起时的高度
    };
    var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
    // 减去总数的高度
    if (hasTotal) {
        divHeight -= LAYOUT_CONSTANTS.TOTAL_HEIGHT;
    }
    //减头部的客户基本信息高度
    if ($('.basic-info-contianer').size()) {
        divHeight -= parseInt($('.basic-info-contianer').outerHeight(true));
    } else {//首次加载，头部基本信息还没有渲染完时，减默认收起的基本信息高度
        divHeight -= LAYOUT_CONSTANTS.BASIC_DEFAULT_HEIGHT;
    }
    //减头通话状态展示及操作区高度
    if ($('.phone-status-handle-wrap').size()) {
        divHeight -= $('.phone-status-handle-wrap').outerHeight(true);
    }
    return divHeight;
};

//客户池释放类型（联合跟进以及负责人类型）
exports.CUSTOMER_POOL_TYPES = {
    OWNER: 'owner',//负责人
    FOLLOWUP: 'followup',//联合跟进
};

//客户管理释放类型
exports.RELEASE_TYPE = {
    JOIN: 'join',//联合跟进人
    OWNER: 'owner',//负责人
};

