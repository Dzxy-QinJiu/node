/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/8/2.
 */
function ignoreCase(input, option){
    let optionToLower = _.toLower(option.props.children);
    let inputToLower = _.toLower(input);

    return optionToLower.indexOf(inputToLower) >= 0;
}

/***
 * 分词过滤，(使用：customerSuggest组件中的filterOption)
 * @param input
 * @param option
 * @param separator  分词符，默认空格
 * @returns {boolean}
 */
function separatorFilter(input, option, separator = ' ') {
    let inputArr = _.trim(input).split(separator);
    let filterRes = [];
    _.each(inputArr, value => {
        if(value && ignoreCase(value, option)) {
            filterRes.push(true);
        }
    });
    return filterRes.length > 0;
}
export { ignoreCase, separatorFilter };