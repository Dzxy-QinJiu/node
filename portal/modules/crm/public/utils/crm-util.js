import classNames from 'classnames';
var userData = require('../../../../public/sources/user-data');
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
        var iconClass = '', title = '', des = '', contact = '', tip = [];
        //根据不同的类型
        if (item.type) {
            switch (item.type) {
                case 'visit':
                    iconClass = 'icon-visit-briefcase';
                    title = Intl.get('customer.visit', '拜访');
                    des = Intl.get('customer.visit.customer', '拜访客户');
                    break;
                case 'phone':
                    iconClass = 'icon-contact-phone';
                    title = Intl.get('customer.phone.system', '电话系统');
                    des = (!item.contact_name && !item.dst) ? Intl.get('customer.contact.customer', '联系客户') : '';
                    break;
                case 'app':
                    iconClass = 'icon-contact-ketao-app';
                    title = Intl.get('customer.ketao.app', '客套app');
                    des = (!item.contact_name && !item.dst) ? Intl.get('customer.contact.customer', '联系客户') : '';
                    break;
                case 'call_back':
                    iconClass = 'icon-callback';
                    title = Intl.get('common.callback', '回访');
                    des = Intl.get('common.callback.customer', '回访客户');
                    break;
                case 'data_report':
                    iconClass = 'icon-report-delivery';
                    title = Intl.get('crm.trace.delivery.report', '舆情报送');
                    des = Intl.get('crm.trace.delivery.report', '舆情报送');
                    break;
                case 'other':
                    iconClass = 'icon-trace-other';
                    title = Intl.get('customer.other', '其他');
                    des = Intl.get('customer.follow.customer', '跟进客户');
                    break;
            }
        }
        des && tip.push(des);
        iconClass += ' iconfont';
        // contact = (item.contact_name || item.dst) ? Intl.get('customer.contact.somebody', '联系') : '';
        contact += item.contact_name && item.dst ? (item.contact_name + ' ' + item.dst + ' ') : '';
        contact += item.contact_name && !item.dst ? (item.contact_name) : '';
        contact += !item.contact_name && item.dst ? (item.dst) : '';
        contact && tip.push(contact);
        traceObj.traceDsc = tip.join('，');
        traceObj.iconClass = iconClass;
        traceObj.title = title;
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
    TRIAL_QUALIFIED: Intl.get('common.trial.qualified', '试用合格'),
    SIGN_QUALIFIED: Intl.get('common.official.qualified', '签约合格'),
    HISTORY_QUALIFIED: Intl.get('common.history.qualified', '曾经合格'),
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

