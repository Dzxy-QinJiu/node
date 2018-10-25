/**
 * 通用函数
 */

const calc = require('calculatorjs');

//去除数字中的逗号
export const removeCommaFromNum = function(value) {
    if (/^[0-9,.]+$/.test(value) && value.toString().indexOf(',') > -1) {
        value = value.replace(/,/g, '');
    }

    return value;
};

//小数转百分比
export const decimalToPercent = function(rawValue = 0) {
    let targetValue = parseFloat(rawValue);

    if (isNaN(targetValue)) {
        targetValue = '';
    } else {
        targetValue = rawValue * 100;

        //对乘以100后，出现一长串小数的情况进行处理
        if (targetValue.toString().length > 5) {
            targetValue = targetValue.toFixed(2);
        }

        targetValue = targetValue + '%';
    }

    return targetValue;
};

//格式化金额，返回以万为单位的金额
export const formatAmount = function(amount) {
    amount = parseFloat(amount);
    amount = isNaN(amount) ? '' : calc.div(amount, 10000);

    return amount;
};

//处理金额，未定义时赋空值及转成千分位格式等
export const parseAmount = function(amount) {
    if (isNaN(amount)) amount = '';

    //每3位数字间用逗号分隔
    amount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return amount;
};

//在电话号码区号与号码之间加横线分隔
export const addHyphenToPhoneNumber = function(value = '', initialValue = '') {
    const matched = value.toString().match(/^(010|02\d|0[^012]\d{2})(\d*)$/);

    if (matched) {
        const areaCode = matched[1];
        const phoneCode = matched[2];

        if (
            //在显示或添加状态下使用时
            (!initialValue && /^[078]$/.test(phoneCode.length))
            ||
            //在编辑状态下使用时
            (initialValue && phoneCode.length === initialValue.length)
        ) {
            value = areaCode + '-' + phoneCode;
        }
    }

    return value;
};

//从浏览器端直接导出文件
export const exportToCsv = function(filename, rows) {
    var processRow = function(row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            }
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
    csvFile = '\ufeff' + csvFile;

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement('a');
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};

//两数组是否相等
export const isEqualArray = function(array1, array2) {
    array1 = _.sortBy(array1);
    array2 = _.sortBy(array2);
    return _.isEqual(array1, array2);
};

//将字符串首字母改为大写
export const capitalizeFirstLetter = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// 地图中显示颜色的判断
export const mapColorList = function(dataList) {
    // 返回的是字符串
    let valueArray = _.map(_.isArray(dataList) && dataList || [], 'value');
    valueArray = _.map(valueArray, item => parseInt(item));
    let uniqArray = _.uniq(valueArray);
    let length = uniqArray.length;
    let ret = [];
    if (length <= 5) { // 以数据点为基准，显示地图中的颜色
        for (let i = 0; i < length; i++) {
            ret.push({
                start: uniqArray[i],
                end: uniqArray[i],
                label: ''
            });
        }
        return ret;
    } else { // 数据超出5时，分区间段显示颜色
        let maxVal = _.max(uniqArray);
        let minVal = _.min(uniqArray);
        // 间隔
        let delta = Math.floor((maxVal - minVal) / 5) - 1;
        let start = minVal;
        for(let i = 1, total = 5; i <= total; i++) {
            let obj = {};
            if(i === 1) {
                obj = {
                    start: start,
                    end: start + delta
                };
                start += delta + 1;
            } else if (i === total){
                obj = {
                    start: start,
                    end: maxVal
                };
            } else {
                obj = {
                    start: start,
                    end: start + delta
                };
                start += delta + 1;
            }
            obj.label = '';
            ret.push(obj);
        }
        return ret.reverse();
    }
};

// 封装原生try结构，统一catch处理(cb：写在try中的回调函数)
export const packageTry = function(cb) {
    try {
        if (_.isFunction(cb)) cb();
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
};

//antd表格日期列渲染函数
export const dateColumnRender = function(text) {
    let time = text ? moment(text).format(oplateConsts.DATE_FORMAT) : '';
    return <span>{time}</span>;
};

//antd表格是否列渲染函数
export const yesNoColumnRender = function(text) {
    text = text === 'true' ? Intl.get('user.yes', '是') : Intl.get('user.no', '否');
    return <span>{text}</span>;
};
