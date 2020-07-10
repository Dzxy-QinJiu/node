import { removeCommaFromNum } from '../../../lib/func';
import {regex, num} from 'ant-utils';
import { passwordRegex, getPassStrenth} from 'CMP_DIR/password-strength-bar';

//名称验证的正则表达式（包含大小写字母、下划线、中英文括号、点及汉字，长度1-50之间）
export const nameRegex = regex.getNameRegex(50);

//客户名验证的正则表达式（包含大小写字母、下划线、中英文括号、点及汉字，长度1-25之间）
export const customerNameRegex = regex.getNameRegex(25);
// 数字验证规则（带千分位以及两位小数）
export const getNumberValidateRule = function() {
    return {pattern: /^(\d|,)+(\.\d{1,2})?$/, message: Intl.get('common.number.validate.tips', '请填写最多两位小数的数字')};
};
//是否是手机号
export const isPhone = function(value) {
    return /^1[3-9]\d{9}$/.test(value);
};
//网址验证规则
export const urlRegex = /^\b(((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:com|edu|gov|int|mil|net|org|biz|info|name|museum|asia|coop|aero|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?)$/i;
export const isURL = function(strUrl) {
    if (urlRegex.test(strUrl)) {
        return true;
    } else {
        return false;
    }
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
export const areaPhoneRegex = /^0\d{2,3}-?[02-9]\d{6,7}$/;
// 可自动填充横线的 座机电话
export const autoLineAreaPhoneRegex = /^(010|02\d|0[3-9]\d{2}|852|853)-?[02-9]\d{6,7}$/;
// 400 客服电话
export const hotlinePhoneRegex = /^400-?\d{3}-?\d{4}$/;
//1010开头的电话
export const phone1010Regex = /^1010\d+$/;
//QQ号码的正则表达式
export const qqRegex = /^[1-9][0-9]{4,}$/;
//是否是支持检测的手机号(处理带星号的手机号判断)
export const isSupportCheckPhone = function(phone) {
    return /^1[358][\d|*]{9}$/.test(phone);
};

//微信号的正则表达式 (只能6—20个字母、数字、下划线和减号，必须以字母开头（不区分大小写），不支持设置中文)
export const wechatRegex = /^[a-zA-Z][-_a-zA-Z0-9]{5,19}$/;
// 验证QQ
exports.checkQQ = (rule, value, callback) => {
    value = _.trim(value);
    if (value) {
        if (qqRegex.test(value)) {
            callback();
        } else {
            callback(new Error(Intl.get('common.correct.qq', '请输入正确的QQ号')));
        }
    } else {
        if (rule.required) {
            callback(new Error(Intl.get('member.input.qq', '请输入QQ号')));
        } else {
            callback();
        }
    }
};
//微信验证，微信验证允许输入手机号、微信号、QQ号
exports.checkWechat = (rule,value,callback) => {
    value = _.trim(value);
    if(value) {
        if((commonPhoneRegex.test(value)) ||
        (wechatRegex.test(value)) ||
        (qqRegex.test(value)) ||
        (emailRegex.test(value))){
            callback();
        }else{
            callback(new Error(Intl.get('common.correct.wechat','请输入正确的微信号/手机号/QQ号/邮箱')));
        }
    }else{
        if (rule.required) {
            callback(new Error(Intl.get('common.correct.no.wechat', '请输入微信号')));
        } else {
            callback();
        }
    }
};

//IP的正则表达式
export const ipRegex = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)$/;

// IP 可以输入通配符的表达式
export const ipRegexWildcard = /^(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|[1-9])\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d|\*)\.(1\d{2}|2[0-4]\d|25[0-5]|[1-9]\d|\d|\*)$/;

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

// 用户名校验规则（字母、数字、横线或下划线组成的字符）
export const userNameRule = /^[a-zA-Z0-9_-]{1,50}$/;
//域名的校验规则 (由字母、数字、中划线组成的1~32位字符且不能以中划线开头或结尾)
export const domainNameRule = /^(?!-)(?!.*-$)[a-zA-Z0-9-]{1,32}$/;

// 名称长度的验证规则（包含大小写字母、下划线、中英文括号、点及汉字，长度1-50之间）
export const nameLengthRuleRegex = regex.getNameRegex(50);

// 名称规则
export const nameRule = (name) => {
    return {
        required: true,
        pattern: nameLengthRuleRegex,
        message: Intl.get('common.name.rule', '{name}名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到50（包括50）之间', {name: name}),
    };
};

// 名称验证
export const validatorNameRuleRegex = (length, name) => {
    return {
        pattern: regex.getNameRegex(length),
        message: Intl.get('common.name.rule.regex', '{name}名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到{length}（包括{length}）之间', {name: name, length: length}),
    };
};

/**
 * 密码验证
 * @param _this 用来setState改是否展示密码强度条和密码强度的参数
 * @param value 当前输入的密码
 * @param callback antd验证方法中用户来传错误提示的回调方法
 * @param rePassWord 确认密码，用来判断输入的密码和确认密码是否一致
 * @param refreshRepasswordValidate  刷新确认密码的验证（以防密码改成跟确认密码一致时，确认密码还提示不一致）
 * @param oldPassword 原始密码， 需要输入原始密码时，用来判断新输入的密码与原始密码是否一致
 **/
export const checkPassword = (_this, value, callback, rePassWord, refreshRepasswordValidate, oldPassword) => {
    value = _.trim(value);
    rePassWord = _.trim(rePassWord);
    if (value && value.match(passwordRegex)) {
        //密码强度的校验
        //获取密码强度及是否展示
        let passStrengthObj = getPassStrenth(value);
        _this.setState({
            passBarShow: passStrengthObj.passBarShow,
            passStrength: passStrengthObj.passStrength
        });
        // 不允许设置弱密码
        if (passStrengthObj.passStrength === 'L') {
            callback(Intl.get('register.password.strength.tip', '密码强度太弱，请更换密码'));
        } else if (oldPassword && value === oldPassword) {// 新密码与原始密码相同时
            callback(Intl.get('user.password.same.password','新密码和原始密码相同'));
        } else {
            // 确认密码存在时，刷新确认密码的验证（以防确认密码提示不一致）
            if(rePassWord && _.isFunction(refreshRepasswordValidate)){
                refreshRepasswordValidate();
            }
            callback();
        }
    } else {
        _this.setState({
            passBarShow: false,
            passStrength: ''
        });
        callback(Intl.get('common.password.validate.rule', '请输入6-18位包含数字、字母和字符组成的密码，不能包含空格、中文和非法字符'));
    }
};

/**
 * 确认密码的验证
 * @param value 当前输入的确认密码
 * @param callback antd验证方法中用户来传错误提示的回调方法
 * @param passWord 密码，用来判断输入的确认密码和密码是否一致
 **/
export const checkConfirmPassword = (value, callback, password) => {
    value = _.trim(value);
    password = _.trim(password);
    if(value) {
        if (value !== password) {
            callback(Intl.get('common.password.unequal', '两次输入密码不一致'));
        } else {
            callback();
        }
    } else {
        callback(Intl.get('common.input.confirm.password', '请输入确认密码'));
    }
};
/***
 * 预算金额的验证
 * @param rule
 * @param value
 * @param callback
 */
export const checkBudgetRule = (rule, value, callback) => {
    value = num.removeCommaFromNum(_.trim(value));
    if(value) {
        if(_.toNumber(value) === 0) {
            callback(new Error(Intl.get('crm.order.budget.validate', '请输入大于0的金额')));
        }else {
            let {pattern, message} = getNumberValidateRule();
            if(pattern.test(value)) {
                callback();
            }else {
                callback(new Error(message));
            }
        }
    }else {
        if(rule.required) {
            callback(new Error(Intl.get('crm.order.budget.input', '请输入预算金额')));
        }else {
            callback();
        }
    }
};
