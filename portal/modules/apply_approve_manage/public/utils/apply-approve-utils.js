/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input, InputNumber, Radio, DatePicker, Select} from 'antd';
const RadioGroup = Radio.Group;
import RangeInput from '../view/range_input';
import SelectOption from '../view/select_option';
import TimePeriod from '../view/time_period';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import InputContent from '../view/input_container';
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
    TIMEPERIOD: 'timeperiod'

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
    name: ALL_COMPONENTS.TIMEPERIOD,
    component: TimePeriod
}];
exports.CONDITION_KEYS = [
    {
        name: Intl.get('user.duration', '时长'),
        value: ALL_COMPONENTS.TIMEPERIOD + '_limit',
        conditionRule: function(item) {
            item['conditionRule'] = '${condition' + item['rangeLimit'] + parseFloat(item['rangeNumber']).toFixed(1) + '}';
            item['conditionInverseRule'] = item['inverseCondition'] + item['rangeNumber'];
            item['conditionRuleDsc'] = item['rangeLimitDsc'] + item['rangeNumberDsc'];
        }
    },
    {name: Intl.get('apply.condition.item.money', '金额'), value: 'money'}
];
exports.FLOW_TYPES = {
    DEFAULTFLOW: 'defaultFlow'
};
exports.ADDAPPLYFORMCOMPONENTS = [
    {
        'rulename': Intl.get('apply.rule.text', '文字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.within.32', '32个字符以内'),
        'component_type': ALL_COMPONENTS.INPUT
    },
    {
        'rulename': Intl.get('apply.rule.textare', '多行文字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.over.32', '32个字符以上'),
        'component_type': ALL_COMPONENTS.INPUT,
        'type': ALL_COMPONENTS_TYPE.TEXTAREA
    },
    {
        'rulename': Intl.get('apply.rule.number', '数字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.limit.int', '仅限整数'),
        'component_type': ALL_COMPONENTS.INPUTNUMBER,
    },
    {
        'rulename': Intl.get('apply.rule.count', '金额输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.allow.point', '允许小数点'),
        'component_type': ALL_COMPONENTS.INPUT,
        'addonAfter': Intl.get('contract.82', '元')
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
    },
    {
        'rulename': Intl.get('apply.rule.radio', '单选'), 'iconfontCls': 'icon-fuwu',
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'radio',
    },
    {
        'rulename': Intl.get('apply.rule.check', '多选'), 'iconfontCls': 'icon-fuwu',
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'checkbox'
    },
    {
        'rulename': Intl.get('apply.rule.date', '日期选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.DATETIME,
        'type': 'date',
        'defaultValue': moment(moment().format(oplateConsts.DATE_FORMAT), oplateConsts.DATE_FORMAT)
    },
    {
        'rulename': Intl.get('apply.rule.date.and.time', '日期+时间选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.DATETIME,
        'type': 'time',
        'defaultValue': moment(moment().format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT), oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT),
        'showTime': {format: 'HH:mm'},
        'format': oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT,

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
        'selectedValue': '1day',
        'component_type': ALL_COMPONENTS.TIMEPERIOD
    },
    {
        'rulename': Intl.get('apply.rule.customer', '客户选择'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.CUSTOMERSEARCH,
        'displayType': 'edit',
        'hideButtonBlock': true
    },
    {
        'rulename': Intl.get('apply.rule.production', '产品配置'), 'iconfontCls': 'icon-fuwu',
        'component_type': ALL_COMPONENTS.PRODUCTION,
        'type': 'option',
        'placeholder': Intl.get('leave.apply.select.product', '请选择产品'),
        'notshowInList': true,
        'default_value': []
    }
];

//内置审批流程
const INNER_SETTING_FLOW = {
    BUSSINESSTRIP: 'businesstrip',//出差
    LEAVE: 'leave',//请假
    BUSINESSOPPORTUNITIES: 'businessopportunities',//销售机会
    USERAPPLY: 'userapply',//用户申请
};
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
exports.TEAM_HIGHER_LEVEL = [
    {
        name: Intl.get('apply.approve.first.higher.level', '直属上级'),
        value: 'team_0_true'
    },
    {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('user.number.first', '一')}),
        value: 'team_1_true'
    },
    {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('user.number.second', '二')}),
        value: 'team_2_true'
    },
    {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('user.number.three', '三')}),
        value: 'team_3_true'
    },
    {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('user.number.four', '四')}),
        value: 'team_4_true'
    },
    {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('apply.approve.level.five', '五')}),
        value: 'team_5_true'
    },
    {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('apply.approve.level.six', '六')}),
        value: 'team_6_true'
    }, {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('user.num.seven', '七')}),
        value: 'team_7_true'
    }, {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('apply.approve.level.eight', '八')}),
        value: 'team_8_true'
    }, {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('apply.approve.level.nine', '九')}),
        value: 'team_9_true'
    }, {
        name: Intl.get('apply.approve.some.level', '第{n}级上级',{n: Intl.get('user.num.ten', '十')}),
        value: 'team_10_true'
    }

];
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
// , {
//     name: Intl.get('apply.add.condition.larger.and.equal', '大于等于'),
//     value: '>=',
//     inverseCondition: '<'
// }, {
//     name: Intl.get('apply.add.condition.less', '小于'),
//     value: '<',
//     inverseCondition: '>='
// }, {
//     name: Intl.get('apply.add.condition.less.and.equal', '小于等于'),
//     value: '<=',
//     inverseCondition: '>'
// }, {
//     name: Intl.get('apply.add.condition.equal', '等于'),
//     value: '===',
//     inverseCondition: '!=='
// }, {
//     name: Intl.get('apply.add.condition.within', '介于'),
//     value: '',
// }
];
//是销售机会申请流程
exports.isSalesOpportunityFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.BUSINESSOPPORTUNITIES;
};
//是出差申请流程
exports.isBussinessTripFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.BUSSINESSTRIP;
};
//是请假申请流程
exports.isLeaveFlow = function(itemType) {
    return itemType === INNER_SETTING_FLOW.LEAVE;
};
exports.ADDTIONPROPERTIES = ['higherLevelApproveChecked','adminApproveChecked','submitFiles','assignNextNodeApprover','distributeSales'];