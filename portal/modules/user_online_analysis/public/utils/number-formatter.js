//将123456显示成123,456的形式
exports.numberAddComma = function(number) {
    number = number || 0;
    number = Math.round(number);
    number += '';
    number = number.split('').reverse().join('')
        .replace(/\d{3}/g , function($0) {return $0 + ',';}).replace(/\,$/,'')
        .split('').reverse().join('');
    return number;
};