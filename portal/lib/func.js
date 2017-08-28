/**
 * 通用函数
 */

//去除数字中的逗号
export const removeCommaFromNum = function (value) {
    if (/^[0-9,.]+$/.test(value) && value.toString().indexOf(",") > -1) {
        value = value.replace(/,/g, "");
    }

    return value;
};

//小数转百分比
export const decimalToPercent = function (rawValue = 0) {
    let targetValue = parseFloat(rawValue);

    if (isNaN(targetValue)) {
        targetValue = "";
    } else {
        targetValue = rawValue * 100;

        //对乘以100后，出现一长串小数的情况进行处理
        if (targetValue.toString().length > 5) {
            targetValue = targetValue.toFixed(2);
        }

        targetValue = targetValue + "%";
    }

    return targetValue;
}

//在电话号码区号与号码之间加横线分隔
export const addHyphenToPhoneNumber = function (value = "") {
    const matched = value.toString().match(/^((0[12]\d)|(0[^12]\d{2}))(\d*)$/);

    if (matched) {
        const areaCode = matched[1];
        const phoneCode = matched[4];
    
        value = areaCode + "-" + phoneCode;
    }

    return value;
};

