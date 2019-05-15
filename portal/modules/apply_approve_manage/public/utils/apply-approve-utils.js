/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/4.
 */
import {Input, InputNumber} from 'antd';
import RangeInput from '../view/range_input';
const APPLYAPPROVE_LAYOUT = {
    TOPANDBOTTOM: 64,
    PADDINGHEIGHT: 24,
    TABTITLE: 36
};
exports.APPLYAPPROVE_LAYOUT = APPLYAPPROVE_LAYOUT;
exports.calculateHeight = function () {
    return $(window).height() - APPLYAPPROVE_LAYOUT.TOPANDBOTTOM;
};
export const ALL_COMPONENTS = {
    INPUT: 'Input',
    INPUTNUMBER: 'InputNumber',
    RANGEINPUT: 'rangeinput'

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
}];
exports.CONDITION_KEYS = [
    {
        name: Intl.get('user.duration', '时长'), value: 'timeRange', conditionRule: function (item) {
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
        'defaultPlaceholder': Intl.get('apply.rule.within.32', '32个字符以内'),
        'componentType': ALL_COMPONENTS.INPUT
    },
    {
        'rulename': Intl.get('apply.rule.textare', '多行文字输入'),
        'iconfontCls': 'icon-fuwu',
        'defaultPlaceholder': Intl.get('apply.rule.over.32', '32个字符以上'),
        'componentType': ALL_COMPONENTS.INPUT,
        'type': ALL_COMPONENTS_TYPE.TEXTAREA
    },
    {
        'rulename': Intl.get('apply.rule.number', '数字输入'),
        'iconfontCls': 'icon-fuwu',
        'defaultPlaceholder': Intl.get('apply.rule.limit.int', '仅限整数'),
        'componentType': ALL_COMPONENTS.INPUTNUMBER,
    },
    {
        'rulename': Intl.get('apply.rule.count', '金额输入'),
        'iconfontCls': 'icon-fuwu',
        'defaultPlaceholder': Intl.get('apply.rule.allow.point', '允许小数点'),
        'componentType': ALL_COMPONENTS.INPUT,
        'addonAfter': Intl.get('contract.82', '元')
    },
    {
        'rulename': Intl.get('apply.rule.hour', '时长输入'), 'iconfontCls': 'icon-fuwu',
        'defaultPlaceholder': Intl.get('contract.input', '请输入'),
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
    {'rulename': Intl.get('apply.rule.radio', '单选'), 'iconfontCls': 'icon-fuwu'},
    {'rulename': Intl.get('apply.rule.check', '多选'), 'iconfontCls': 'icon-fuwu'},
    {'rulename': Intl.get('apply.rule.date', '日期选择'), 'iconfontCls': 'icon-fuwu'},
    {'rulename': Intl.get('apply.rule.date.and.time', '日期+时间选择'), 'iconfontCls': 'icon-fuwu'},
    {'rulename': Intl.get('apply.rule.period', '周期选择'), 'iconfontCls': 'icon-fuwu'},
    {'rulename': Intl.get('apply.rule.customer', '客户选择'), 'iconfontCls': 'icon-fuwu'},
    {'rulename': Intl.get('apply.rule.production', '产品配置'), 'iconfontCls': 'icon-fuwu'}
];