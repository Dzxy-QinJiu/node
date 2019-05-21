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
const APPLYAPPROVE_LAYOUT = {
    TOPANDBOTTOM: 64,
    PADDINGHEIGHT: 24,
    TABTITLE: 36
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
exports.applyComponentsType = [{
    name: ALL_COMPONENTS.INPUT,
    component: Input
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
        name: Intl.get('user.duration', '时长'), value: 'timeRange', conditionRule: function(item) {
            item['conditionRule'] = item['rangeLimit'] + item['rangeNumber'];
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
        'componentType': ALL_COMPONENTS.INPUT
    },
    {
        'rulename': Intl.get('apply.rule.textare', '多行文字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.over.32', '32个字符以上'),
        'componentType': ALL_COMPONENTS.INPUT,
        'type': ALL_COMPONENTS_TYPE.TEXTAREA
    },
    {
        'rulename': Intl.get('apply.rule.number', '数字输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.limit.int', '仅限整数'),
        'componentType': ALL_COMPONENTS.INPUTNUMBER,
    },
    {
        'rulename': Intl.get('apply.rule.count', '金额输入'),
        'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('apply.rule.allow.point', '允许小数点'),
        'componentType': ALL_COMPONENTS.INPUT,
        'addonAfter': Intl.get('contract.82', '元')
    },
    {
        'rulename': Intl.get('apply.rule.hour', '时长输入'), 'iconfontCls': 'icon-fuwu',
        'placeholder': Intl.get('contract.input', '请输入'),
        notshowInList: true,
        timeRange: {
            unitLabel: Intl.get('apply.time.range.unit.select', '单位选项'),
            unitList: [{
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
            }]
        },
        selectedArr: ['hour'],
        'componentType': ALL_COMPONENTS.RANGEINPUT,
    },
    {
        'rulename': Intl.get('apply.rule.radio', '单选'), 'iconfontCls': 'icon-fuwu',
        options: {
            optionLabel: Intl.get('apply.time.range.unit.select.label', '选项'),
            optionArrs: [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')]
        },
        'componentType': ALL_COMPONENTS.SELECTOPTION,
        'type': 'radio'
    },
    {
        'rulename': Intl.get('apply.rule.check', '多选'), 'iconfontCls': 'icon-fuwu',
        options: {
            optionLabel: Intl.get('apply.time.range.unit.select.label', '选项'),
            optionArrs: [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')]
        },
        'componentType': ALL_COMPONENTS.SELECTOPTION,
        'type': 'checkbox'
    },
    {
        'rulename': Intl.get('apply.rule.date', '日期选择'), 'iconfontCls': 'icon-fuwu',
        'componentType': ALL_COMPONENTS.DATETIME,
        'type': 'date'
    },
    {
        'rulename': Intl.get('apply.rule.date.and.time', '日期+时间选择'), 'iconfontCls': 'icon-fuwu',
        'componentType': ALL_COMPONENTS.DATETIME,
        'type': 'time'
    },
    {
        'rulename': Intl.get('apply.rule.period', '周期选择'), 'iconfontCls': 'icon-fuwu',
        timePrecious: {
            unitLabel: Intl.get('apply.time.select.period', '周期选择'),
            unitList: [{
                label: Intl.get('weekly.report.n.days', '{n}天', {n: 1}),
                value: '1day'
            }, {
                label: Intl.get('weekly.report.n.days', '{n}天', {n: 0.5}),
                value: '0.5day'
            }],
            unitMsg: Intl.get('apply.time.distinct.am','区分上下午')
        },
        selectedValue: '1day',
        'componentType': ALL_COMPONENTS.TIMEPERIOD
    },
    {
        'rulename': Intl.get('apply.rule.customer', '客户选择'), 'iconfontCls': 'icon-fuwu',
        'componentType': ALL_COMPONENTS.CUSTOMERSEARCH,
        'displayType': 'edit',

    },
    {
        'rulename': Intl.get('apply.rule.production', '产品配置'), 'iconfontCls': 'icon-fuwu',
        'componentType': ALL_COMPONENTS.PRODUCTION,
        'type': 'option',
        'placeholder': Intl.get('leave.apply.select.product', '请选择产品'),
        notshowInList: true,
        selectedArr: []


    }
];