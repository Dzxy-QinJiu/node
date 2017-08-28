import { CONTRACT_LABEL } from "../consts";

//根据id获取团队名
export const getTeamName = function (list, id) {
    const team = _.find(list, item => item.groupId === id);
    const teamName = team? team.groupName : "";
    return teamName;
}

//根据签约类型值获得签约类型名
export const getLabelName = function (value) {
    const label = _.find(CONTRACT_LABEL, item => item.value === value);
    const labelName = label? label.name : "";
    return labelName;
}

//格式化金额
export const formatAmount = function (amount) {
    amount = parseFloat(amount);
    amount = isNaN(amount)? "" : amount / 10000;
    
    amount = amount.toString();

    //对转换结果出现多位小数（如0.010020000000000001）的情况进行处理
    if (amount.length >= 20 && amount.indexOf(".") > -1) {
        amount = amount.replace(/0+[1-9]+$/, "");
    }

    return amount;
}

