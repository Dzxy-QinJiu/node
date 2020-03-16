/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {domainNameRule} from 'PUB_DIR/sources/utils/validate-util';
import {Input, InputNumber, Radio, DatePicker, Select} from 'antd';
const RadioGroup = Radio.Group;
import RangeInput from '../view/range_input';
import SelectOption from '../view/select_option';
import TimePeriod from '../view/time_period';
import CustomerSuggest from '../view/customer_suggest';
import InputContent from '../view/input_container';
import ApplyAction from '../../../domain_application/public/action/leave-apply-action';
const APPLYAPPROVE_LAYOUT = {
    TOPANDBOTTOM: 64,
    PADDINGHEIGHT: 24,
    TABTITLE: 36,
    TABLE_TITLE_HEIGHT: 48
};
exports.APPLYAPPROVE_LAYOUT = APPLYAPPROVE_LAYOUT;
exports.calculateHeight = function() {
    return $(window).height() - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM;
};
export const ALL_COMPONENTS = {
    INPUT: 'Input',
    INPUTNUMBER: 'InputNumber',
    RANGEINPUT: 'rangeinput',
    SELECTOPTION: 'selectoption',
    DATETIME: 'datetime',//日期或者日期加时间
    PRODUCTION: 'prodution',//产品
    CUSTOMERSEARCH: 'customerSearch',//客户的搜索
    TIME_PERIOD: 'timePeriod',//时间
    USER_SEARCH: 'userSearch',//成员
    TEAM_SEARCH: 'teamSearch'//团队

};
export const ALL_COMPONENTS_TYPE = {
    TEXTAREA: 'textarea',

};
export const ASSIGEN_APPROVER = 'Assign_approver';
exports.SETTING_APPLY_APPROVER = {
    label: Intl.get('apply.approve.set.approver', '指定审批人'),
    value: ASSIGEN_APPROVER
};
exports.applyComponentsType = [{
    name: ALL_COMPONENTS.INPUT,
    component: InputContent
}, {
    name: ALL_COMPONENTS.INPUTNUMBER,
    component: InputNumber
}, {
    name: ALL_COMPONENTS.RANGEINPUT,
    component: RangeInput
}, {
    name: ALL_COMPONENTS.SELECTOPTION,
    component: SelectOption
}, {
    name: ALL_COMPONENTS.DATETIME,
    component: DatePicker
}, {
    name: ALL_COMPONENTS.PRODUCTION,
    component: SelectOption
}, {
    name: ALL_COMPONENTS.CUSTOMERSEARCH,
    component: CustomerSuggest
}, {
    name: ALL_COMPONENTS.TIME_PERIOD,
    component: TimePeriod
}, {
    name: ALL_COMPONENTS.USER_SEARCH,
    component: SelectOption
}
];
exports.CONDITION_KEYS = [
    {
        name: Intl.get('user.duration', '时长'),
        value: ALL_COMPONENTS.TIME_PERIOD + '_limit',
        conditionRule: function(item) {
            item['conditionRule'] = '${condition' + item['rangeLimit'] + parseFloat(item['rangeNumber']).toFixed(1) + '}';
            item['conditionInverseRule'] = item['inverseCondition'] + item['rangeNumber'];
            item['conditionRuleDsc'] = item['rangeLimitDsc'] + item['rangeNumberDsc'];
        }
    },
    {name: Intl.get('apply.condition.item.money', '金额'), value: 'money'},
    {name: Intl.get('user.apply.presenter', '申请人'), value: ALL_COMPONENTS.USER_SEARCH + '_limit'
        ,conditionRule: function(item) {
            //1）不能用item.conditionRule去赋值，之前可能不存在此属性
            // 2）${user_range==""} 和后端约定的指定那些人审批，走特定的流程，流程的key值是userRangeRoute，字段是user_range
            item['conditionRule'] = '${user_range==\"' + item['userRangeRoute'] + '\"}';
            item['conditionPerson'] = item['userRange'];
            item['conditionRuleDsc'] = item['userRangeDsc'].join(',');
        }},

    {name: Intl.get('user.apply.team', '申请人所属团队'),
        value: ALL_COMPONENTS.TEAM_SEARCH + '_limit'
        ,conditionRule: function(item) {
            //1）不能用item.conditionRule去赋值，之前可能不存在此属性
            // 2）${team_range==""} 和后端约定的指定那些人审批，走特定的流程，流程的key值是teamRangeRoute，字段是team_range
            item['conditionRule'] = '${team_range==\"' + item['teamRangeRoute'] + '\"}';
            item['conditionPerson'] = item['teamRange'];
            item['conditionRuleDsc'] = item['teamRangeDsc'].join(',');
        }},
];
exports.FLOW_TYPES = {
    DEFAULTFLOW: 'defaultFlow'
};
exports.ADDAPPLYFORMCOMPONENTS = [
    {
        'rulename': Intl.get('apply.rule.text', '文字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.within.32', '32个字符以内'),
        'component_type': ALL_COMPONENTS.INPUT,
        component: InputContent,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.textare', '多行文字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.over.32', '32个字符以上'),
        'component_type': ALL_COMPONENTS.INPUT,
        'type': ALL_COMPONENTS_TYPE.TEXTAREA,
        component: InputContent,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.number', '数字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.limit.int', '仅限整数'),
        'component_type': ALL_COMPONENTS.INPUTNUMBER,
        component: InputNumber,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.count', '金额输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.allow.point', '允许小数点'),
        'component_type': ALL_COMPONENTS.INPUT,
        'addonAfter': Intl.get('contract.82', '元'),
        component: InputContent,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.hour', '时长输入'), 'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('contract.input', '请输入'),
        'notshowInList': true,
        'select_arr': [{
            label: Intl.get('common.label.hours', '小时'),
            value: 'hour'
        }, {
            label: Intl.get('apply.approve.leave.am', '上午'),
            value: 'am'
        }, {
            label: Intl.get('apply.approve.leave.pm', '下午'),
            value: 'pm'
        }, {
            label: Intl.get('common.time.unit.day', '天'),
            value: 'day'
        }, {
            label: Intl.get('common.time.unit.week', '周'),
            value: 'week'
        }, {
            label: Intl.get('common.time.unit.month', '月'),
            value: 'month'
        }],
        'unitLabel': Intl.get('apply.time.range.unit.select', '单位选项'),
        'default_value': [{
            label: Intl.get('common.label.hours', '小时'),
            value: 'hour'
        }],
        'component_type': ALL_COMPONENTS.RANGEINPUT,
        component: RangeInput,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.radio', '单选'), 'iconfontCls': 'icon-fuwu',
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'radio',
        component: SelectOption,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.check', '多选'), 'iconfontCls': 'icon-fuwu',
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'checkbox',
        component: SelectOption,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.date', '日期选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.DATETIME,
        'type': 'date',
        'defaultValue': moment(moment().format(oplateConsts.DATE_FORMAT), oplateConsts.DATE_FORMAT),
        component: DatePicker,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.date.and.time', '日期+时间选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.DATETIME,
        'type': 'time',
        'defaultValue': moment(moment().format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT), oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT),
        'showTime': {format: 'HH:mm'},
        'format': oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT,
        component: DatePicker,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')

    },
    {
        'rulename': Intl.get('apply.rule.period', '周期选择'), 'iconfontCls': 'icon-fuwu',
        'unitLabel': Intl.get('apply.time.select.period', '周期选择'),
        'select_arr': [{
            label: Intl.get('weekly.report.n.days', '{n}天', {n: 1}),
            value: '1day'
        }, {
            label: Intl.get('weekly.report.n.days', '{n}天', {n: 0.5}),
            value: '0.5day'
        }],
        'unitMsg': Intl.get('apply.time.distinct.am', '区分上下午'),
        'selected_value': '1day',
        'component_type': ALL_COMPONENTS.TIME_PERIOD,
        component: TimePeriod,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.customer', '客户选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.CUSTOMERSEARCH,
        'displayType': 'edit',
        'hideButtonBlock': true,
        'key': 'customers',
        component: CustomerSuggest,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.rule.production', '产品配置'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.PRODUCTION,
        'type': 'option',
        'placeholder': Intl.get('leave.apply.select.product', '请选择产品'),
        'notshowInList': true,
        'default_value': [],
        component: SelectOption,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    },
    {
        'rulename': Intl.get('apply.approve.user.select', '用户选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.USER_SEARCH,
        'type': 'option',
        'placeholder': Intl.get('user.position.select.user', '请选择用户'),
        'notshowInList': true,
        'default_value': [],
        'key': 'managers',
        component: SelectOption,
        is_required_errmsg: Intl.get('user.apply.reply.placeholder', '请填写内容')
    }
];

//内置审批流程
const INNER_SETTING_FLOW = {
    BUSSINESSTRIP: 'businesstrip',//出差
    LEAVE: 'leave',//请假
    BUSINESSOPPORTUNITIES: 'businessopportunities',//销售机会
    USERAPPLY: 'userapply',//用户申请
    NEWUSERAPPLY: 'user_or_grant'

};
const SELF_SETTING_FLOW = {
    VISITAPPLY: 'visitapply',//拜访申请
    VISITAPPLYTOPIC: Intl.get('apply.my.self.setting.work.flow', '拜访申请'),
    DOMAINAPPLY: 'domainName',//舆情平台申请
    DOMAINAPPLYTOPIC: Intl.get('apply.domain.application.work.flow', '舆情平台申请'),
};
exports.SELF_SETTING_FLOW = SELF_SETTING_FLOW;
exports.INNER_SETTING_FLOW = INNER_SETTING_FLOW;
exports.APPROVER_TYPE = [{
    name: Intl.get('apply.add.approver.higher.level', '上级'),
    value: 'higher_ups',
}, {
    name: Intl.get('apply.add.approver.setting.role', '指定角色'),
    value: 'setting_roles',
}, {
    name: Intl.get('apply.add.approver.setting.user', '指定成员'),
    value: 'setting_users',
},
    // {name: Intl.get('apply.add.approver.applicant.setting', '申请人指定'), value: 'application_setting'},
    
{name: Intl.get('apply.add.approver.applicant.self', '申请人自己'), value: 'application_self'}
];

exports.CC_SETTINGT_TYPE = [{
    name: Intl.get('apply.add.approver.higher.level', '上级'),
    value: 'teamowner_range',
}, {
    name: Intl.get('apply.set.team.secretry', '团队秘书'),
    value: 'teammanager_range',
},{
    name: Intl.get('apply.set.team.user', '团队成员'),
    value: 'teammember_range',
},{
    name: Intl.get('apply.add.approver.setting.role', '指定角色'),
    value: 'system_roles',
},{
    name: Intl.get('apply.add.approver.setting.user', '指定成员'),
    value: 'member_ids'
}
];
exports.SECRETRYOPTIONS = [{
    name: Intl.get('apply.set.cc.node.secretry', '所属团队秘书'),
    value: 'team_levels'
},{
    name: Intl.get('apply.set.cc.node.higher.secretry', '所有上级团队秘书'),
    value: 'all_senior_teams'
},{
    name: Intl.get('apply.set.cc.node.all.secretry', '所属团队及所有上级团队秘书'),
    value: 'team_levels_all_senior_teams'
},];
exports.USEROPTIONS = [{
    name: Intl.get('apply.set.cc.node.all.team.user', '所有上级团队成员'),
    value: 'higher_user'
}];

exports.getTeamHigerLevel = function() {
    var teamList = [{
        name: Intl.get('apply.approve.first.higher.level', '直属上级'),
        value: 'team_0_true'
    }];
    var levels = [
        {name: Intl.get('user.number.second', '二'), value: '1'},
        {name: Intl.get('user.number.three', '三'), value: '2'},
        {name: Intl.get('user.number.four', '四'), value: '3'},
        {name: Intl.get('apply.approve.level.five', '五'), value: '4'},
        {name: Intl.get('apply.approve.level.six', '六'), value: '5'},
        {name: Intl.get('user.num.seven', '七'), value: '6'},
        {name: Intl.get('apply.approve.level.eight', '八'), value: '7'},
        {name: Intl.get('apply.approve.level.nine', '九'), value: '8'},
        {name: Intl.get('user.num.ten', '十'), value: '9'}];
    _.forEach(levels, item => {
        teamList.push({
            name: Intl.get('apply.approve.some.level', '第{n}级上级', {n: item.name}),
            value: `team_${item.value}_true`
        });
    });
    return teamList;
};
exports.ROLES_SETTING = [
    {
        name: Intl.get('common.managers', '管理员'),
        value: 'managers'
    },
    {
        name: Intl.get('apply.add.approve.node.operation', '运营人员'),
        value: 'operations'
    },
];
exports.CONDITION_LIMITE = [{
    name: Intl.get('apply.add.condition.larger', '大于'),
    value: '>',
    inverseCondition: '<='
}
    , {
    name: Intl.get('apply.add.condition.larger.and.equal', '大于等于'),
    value: '>=',
    inverseCondition: '<'
}, {
    name: Intl.get('apply.add.condition.less', '小于'),
    value: '<',
    inverseCondition: '>='
}, {
    name: Intl.get('apply.add.condition.less.and.equal', '小于等于'),
    value: '<=',
    inverseCondition: '>'
}, {
    name: Intl.get('apply.add.condition.equal', '等于'),
    value: '==',
    inverseCondition: '!='
},
// {
//     name: Intl.get('apply.add.condition.within', '介于'),
//     value: '',
// }
];
//是销售机会申请流程
exports.isSalesOpportunityFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.BUSINESSOPPORTUNITIES;
};
//是拜访申请流程
exports.isVisitApplyFlow = function(itemType) {
    return itemType === SELF_SETTING_FLOW.VISITAPPLY;
};
//是舆情平台申请流程
exports.isDomainApplyFlow = function(itemType) {
    return itemType === SELF_SETTING_FLOW.DOMAINAPPLY;
};
//是出差申请流程
exports.isBussinessTripFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.BUSSINESSTRIP;
};
//是请假申请流程
exports.isLeaveFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.LEAVE;
};
//是用户申请流程
exports.isUserApplyFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.USERAPPLY || itemType === INNER_SETTING_FLOW.NEWUSERAPPLY;
};
//是否展示该节点
exports.isShowCCNode = (item) => {
    var showFlag = false;
    if (_.isArray(item) && _.get(item, '[0]')) {
        showFlag = true;
    } else if (_.isObject(item)) {
        if (_.get(item, 'all_senior_teams')) {
            showFlag = true;
        }
        if (_.get(item, 'team_levels[0]', '') !== '') {
            showFlag = true;
        }
    }
    return showFlag;
};
exports.ADDTIONPROPERTIES = ['higherLevelApproveChecked', 'adminApproveChecked', 'submitFiles', 'assignNextNodeApprover', 'distributeSales','distributeSalesToVisit', 'releaseCustomerToTeamPool', 'customerSLDUpdate'];
export const checkDomainName = function(rule, value, callback) {
    value = _.trim(value);
    if (value) {
        if (domainNameRule.test(value)) {
            //发请求校验是否该域名重复
            ApplyAction.checkDomainExist({sub_domains: value}, (result) => {
                if (_.isString(result)) {
                    callback(new Error(result || Intl.get('apply.domain.name.check.err', '二级域名校验失败！')));
                } else {
                    if (result) {
                        callback(new Error(Intl.get('apply.domain.sub.name.exist', '该域名已存在')));
                    } else {
                        callback();
                    }
                }
            });
        } else {
            callback(new Error(Intl.get('apply.domain.descriptipn.reg', '域名描述只能包含字母、数字、中划线（不能以中划线开头或结尾），且长度在1到32之间')));
        }
    } else {
        callback();
    }
};

//计算字符串长度
function getDomainPlatLength(str) {
    //名称的规则是1-32个字符， 其中，英文数字算一个字符，其他字符一个算2个字符。
    var length = str.length + str.replace(/[\da-z]+/ig,'').length;
    return length >= 1 && length <= 32;
}

export const checkPlatName = function(rule, value, callback) {
    value = _.trim(value);
    if (value) {
        if (getDomainPlatLength(value)) {
            callback();
        } else {
            callback(new Error(Intl.get('apply.domain.plat.name.reg', '平台名称长度在1到32个字符之间(英文数字算一个字符，其他字符一个算2个字符)')));
        }
    } else {
        callback();
    }
};

const formItemLayout = {
    labelCol: {
        xs: {span: 24},
        sm: {span: 6},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 18},
    },
};
const maxFormItemLayout = {
    labelCol: {
        xs: {span: 0},
        sm: {span: 0},
    },
    wrapperCol: {
        xs: {span: 24},
        sm: {span: 24},
    },
};

