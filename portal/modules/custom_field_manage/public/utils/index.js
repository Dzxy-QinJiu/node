/**
 * Created by hzl on 2020/5/18.
 */

import {Input, InputNumber} from 'antd';
import SelectOption from 'MOD_DIR/apply_approve_manage/public/view/select_option';
import InputContent from 'MOD_DIR/apply_approve_manage/public/view/input_container';

//这些value值不可以修改，因为这些类型如果有的申请审批表单已经保存，修改后界面展示会有问题
export const ALL_COMPONENTS = {
    INPUT: 'Input',
    INPUTNUMBER: 'InputNumber',
    RANGEINPUT: 'rangeinput',
    SELECTOPTION: 'selectoption',
    TIME_PERIOD: 'timeperiod',//时间
};

export const ALL_COMPONENTS_TYPE = {
    TEXTAREA: 'textarea',

};

exports.selectCustomFieldComponents = [
    {
        'placeholder': Intl.get('apply.rule.within.32', '32个字符以内'),
        'component_type': ALL_COMPONENTS.INPUT,
        component: InputContent,
        customField: 'text',
    },
    {
        'placeholder': Intl.get('apply.rule.over.32', '32个字符以上'),
        'component_type': ALL_COMPONENTS.INPUT,
        'type': ALL_COMPONENTS_TYPE.TEXTAREA,
        component: InputContent,
        customField: 'multitext',
    },
    {
        'placeholder': Intl.get('apply.rule.limit.int', '仅限整数'),
        'component_type': ALL_COMPONENTS.INPUTNUMBER,
        component: InputNumber,
        customField: 'number',
    },
    {
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'radio',
        component: SelectOption,
        customField: 'radio',
    },
    {
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'checkbox',
        component: SelectOption,
        customField: 'checkbox',
    },
    {
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'option',
        component: SelectOption,
        customField: 'select',
    },
    {
        'select_arr': [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')],
        'unitLabel': Intl.get('apply.time.range.unit.select.label', '选项'),
        'component_type': ALL_COMPONENTS.SELECTOPTION,
        'type': 'option',
        multiple: true,
        component: SelectOption,
        customField: 'multiselect',
    },
    {
        'component_type': ALL_COMPONENTS.DATETIME,
        'type': 'date',
        'defaultValue': moment(moment().format(oplateConsts.DATE_FORMAT), oplateConsts.DATE_FORMAT),
        customField: 'date',
    }
];


exports.defaultInputPlaceholder = [{
    fieldType: 'text',
    selectOption: Intl.get('apply.rule.within.32', '32个字符以内')
}, {
    fieldType: 'multitext',
    selectOption: Intl.get('apply.rule.over.32', '32个字符以上')
}, {
    fieldType: 'number',
    selectOption: Intl.get('apply.rule.limit.int', '仅限整数')
}, {
    fieldType: 'date',
    selectOption: moment().valueOf()
}, {
    fieldType: 'options',
    selectOption: [Intl.get('apply.approve.option.one', '选项一'), Intl.get('apply.approve.option.two', '选项二')]
}
];