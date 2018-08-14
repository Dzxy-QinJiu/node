//客户名格式验证
import {nameRegex} from 'PUB_DIR/sources/utils/consts';
var userData = require('PUB_DIR/sources/user-data');
export const checkClueName = function(rule, value, callback) {
    value = $.trim(value);
    if (value) {
        if (nameRegex.test(value)) {
            callback();
        } else {
            callback(new Error(Intl.get('clue.name.rule', '线索名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间')));
        }
    }
    else{
        callback();
    }
};
export const checkQQ = function(rule, value, callback) {
    value = $.trim(value);
    if (value){
        if (!(/[1-9][0-9]{4,}$/.test(value))){
            callback(new Error(Intl.get('common.correct.qq', '请输入正确的QQ号')));
        }else{
            callback();
        }
    }else{
        callback();
    }
};
export const checkEmail = function(rule, value, callback) {
    value = $.trim(value);
    if (value) {
        if (!/^(((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(,((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)*$/i
            .test(value)) {
            callback(new Error(Intl.get('common.correct.email', '请输入正确的邮箱')));
        } else {
            callback();
        }
    } else {
        callback();
    }
};

// 全部 "" 待分配 0 已分配 1 已跟进 2
export const SELECT_TYPE = {
    ALL: '',
    WILL_DISTRIBUTE: '0',
    HAS_DISTRIBUTE: '1',
    HAS_TRACE: '2'
};
//线索的有效还是无效状态
export const AVALIBILITYSTATUS = {
    AVALIBILITY: '0',//有效线索
    INAVALIBILITY: '1'//无效线索
};

//是否是运营人员
export const isOperation = function(){
    return userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
};
//是否是销售领导或者管理员
export const isSalesLeaderOrManager = function(){
    return !userData.getUserData().isCommonSales || userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
};

