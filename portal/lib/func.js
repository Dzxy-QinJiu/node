/**
 * 通用函数
 */

const calc = require("calculatorjs");

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

//格式化金额，返回以万为单位的金额
export const formatAmount = function (amount) {
    amount = parseFloat(amount);
    amount = isNaN(amount)? "" : calc.div(amount, 10000);

    return amount;
}

//处理金额，未定义时赋空值及转成千分位格式等
export const parseAmount = function (amount) {
    if (!amount) amount = "";

    //每3位数字间用逗号分隔
    amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    return amount;
}

//在电话号码区号与号码之间加横线分隔
export const addHyphenToPhoneNumber = function (value = "") {
    const matched = value.toString().match(/^(010|02\d|0[^12]\d{2})(\d*)$/);

    if (matched) {
        const areaCode = matched[1];
        const phoneCode = matched[2];

        value = areaCode + "-" + phoneCode;
    }

    return value;
};

//从浏览器端直接导出文件
export const exportToCsv = function (filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    //避免在excel中打开时出现中文乱码
    csvFile = "\ufeff" + csvFile;

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

//是否是手机号
export const isPhone = function (value) {
    return /^1[3-9]\d{9}$/.test(value);
}

//是否是邮箱
export const isEmail = function (value) {
    return /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(value);
}

//两数组是否相等
export const isEqualArray = function (array1, array2) {
    array1 = _.sortBy(array1);
    array2 = _.sortBy(array2);
    return _.isEqual(array1, array2);
};
