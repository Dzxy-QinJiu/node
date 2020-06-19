/**
 * Created by hzl on 2020/5/18.
 */

exports.defaultOptionValue = [{
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