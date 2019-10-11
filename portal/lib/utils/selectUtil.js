/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2019/8/2.
 */
function ignoreCase(input, option){
    let optionToLower = _.toLower(option.props.children);
    let inputToLower = _.toLower(_.trim(input));

    return optionToLower.indexOf(inputToLower) >= 0;
}

export { ignoreCase };