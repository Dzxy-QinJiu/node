import { removeCommaFromNum } from '../../../lib/func';
import {regex} from 'ant-utils';
//名称长度的验证规则
export const nameLengthRule = {
    required: true,
    min: 1,
    max: 50,
    message: Intl.get('common.input.character.prompt', '最少1个字符,最多50个字符')
};
//名称验证的正则表达式（包含大小写字母、下划线、中英文括号、点及汉字，长度1-50之间）
export const nameRegex = regex.getNameRegex(50);
//线索联系人的校验规则
export const clueNameContactRule = {
    pattern: nameRegex,
    message: Intl.get('clue.contact.name.within.ten.character', '联系人名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')
};

//客户名验证的正则表达式（包含大小写字母、下划线、中英文括号、点及汉字，长度1-25之间）
export const customerNameRegex = regex.getNameRegex(25);
// 数字验证规则
exports.getNumberValidateRule = function() {
    return {pattern: /^(\d|,)+(\.\d+)?$/, message: Intl.get('contract.45', '请填写数字')};
};
//是否是手机号
export const isPhone = function(value) {
    return /^1[3-9]\d{9}$/.test(value);
};


//邮箱正则表达式
export const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
//是否是邮箱
export const isEmail = function(value) {
    return emailRegex.test(value);
};
//路径参数正则
export const pathParamRegex = /:([a-zA-Z_\-0-9]+)/g;
//电话号码的校验
//普通的电话号码
export const commonPhoneRegex = /^1[3456789]\d{9}$/;
// 区号 座机电话
export const areaPhoneRegex = /^(0\d{2,3}-?)?[02-9]\d{6,7}$/;
// 可自动填充横线的 座机电话
export const autoLineAreaPhoneRegex = /^((010|02\d|0[3-9]\d{2}|852|853)-?)?[02-9]\d{6,7}$/;
// 400 客服电话
export const hotlinePhoneRegex = /^400-?\d{3}-?\d{4}$/;
//1010开头的电话
export const phone1010Regex = /^1010\d+$/;
//QQ号码的正则表达式
export const qqRegex = /^[1-9][0-9]{4,}$/;
//IP的正则表达式
export const ipRegex = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/;

//验证电话号码
exports.checkPhone = function(rule, value, callback) {
    value = _.trim(value);
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
            callback(new Error(Intl.get('crm.86', '请填写电话')));
        } else {
            callback();
        }
    }
};
//校验输入值加基础值是否大于最大值
//参数说明：
// max 最大值
// base 基础值
// msg 验证失败时的提示信息
// rule, value, callback 为回调参数，无需手工传人
export const numberAddNoMoreThan = function(max, base, msg, rule, value, callback) {
    value = removeCommaFromNum(value);

    value = parseFloat(value);
    base = parseFloat(base);
    max = parseFloat(max);

    if (isNaN(value) || isNaN(base) || isNaN(max)) {
        callback();
    } else {
        if (value + base > max) {
            callback(msg);
        } else {
            callback();
        }
    }
};
//是否是电话号码（包括手机号）的验证方法
export const isTelephone = function(phoneNumber) {
    return commonPhoneRegex.test(phoneNumber) ||
        autoLineAreaPhoneRegex.test(phoneNumber) ||
        hotlinePhoneRegex.test(phoneNumber) ||
        phone1010Regex.test(phoneNumber);
};

// 判断系统是否为苹果系统
export const isMacOs = (/macintosh|mac os x/i).test(navigator.userAgent);

// 自定义属性key的正则表达式， 如status, user_type, custom_variables_field
export const keyRegex = /^[a-zA-Z][a-zA-Z_]*$/;
//产品key键值的校验规则
export const productKeyRule = {
    pattern: keyRegex,
    message: Intl.get('app.user.manage.product.key.validate', '自定义属性key只能包含字母、下划线')
};
// 自定义属性描述的正则表达式（包含大小写字母、下划线、中英文括号、点及汉字，长度1-20之间）
export const descriptionRegex = regex.getNameRegex(20);
// 产品自定义属性描述验证规则
export const productDesRule = {
    pattern: descriptionRegex,
    message: Intl.get('app.user.manage.product.des.validate', '自定义属性key只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到20（包括20）之间')
};
