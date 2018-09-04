import {nameRegex, commonPhoneRegex,hotlinePhoneRegex, telephoneRegex} from 'PUB_DIR/sources/utils/consts';

//验证电话号码
exports.checkPhone = function(rule, value, callback) {
    value = $.trim(value);
    if (value) {
        if ((commonPhoneRegex.test(value)) ||
            (telephoneRegex.test(value)) ||
            (hotlinePhoneRegex.test(value))) {
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

//验证客户名
exports.checkCustomerName = function(rule, value, callback) {
    value = $.trim(value);
    if (value) {
        if (nameRegex.test(value)) {
            callback();
        } else {
            callback(new Error(Intl.get('crm.197', '客户名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')));
        }
    } else {
        callback(new Error( Intl.get('crm.81', '请填写客户名称')));
    }
};

