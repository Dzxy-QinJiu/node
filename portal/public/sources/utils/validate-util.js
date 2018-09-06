import {commonPhoneRegex,hotlinePhoneRegex, areaPhoneRegex, phone1010Regex} from './consts';

//验证电话号码
exports.checkPhone = function(rule, value, callback) {
    value = $.trim(value);
    if (value) {
        if ((commonPhoneRegex.test(value)) ||
            (areaPhoneRegex.test(value)) ||
            (hotlinePhoneRegex.test(value)) ||
            (phone1010Regex.test(value))) {
            callback();
        } else {
            callback(new Error(Intl.get('crm.196', '请输入正确的电话号码，格式例如：13877775555，010-77775555 或 400-777-5555')));
        }
    } else {
        if (rule.required) {
            callback(new Error( Intl.get('crm.86', '请填写电话')));
        } else {
            callback();
        }
    }
};
