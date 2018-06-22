import Ajax from './ajax';
import AppUserActions from '../../../modules/app_user_manage/public/action/app-user-actions';
import AppUserFormActions from '../../../modules/app_user_manage/public/action/v2/app-user-form-actions';
import history from '../../../public/sources/history';
const language = require('../../../public/language/getLanguage');


// 校验用户名时，从后端返回的数据
/**
 * 返回的数据结构
 * [{name: "yishixun", id: "363veeouhd35u5pkjqg1Qi3Ou0p64ueatS1dnbXfi2M", customer_id: "363veeouhd_8d75c9b9-bd17-4604-883e-59c41c056587"}]
 * */


let userInfo = [];
let userExistTimeout = null;
let checkUserExistIntervalTime = 2000;//检查用户是否存在的间隔时间

function checkUserExistAjax(obj) {
    return Ajax.checkUserName(obj);
}

function clickUserName(user_id, username_block) {
    var text = Intl.get('user.user.check', '查看该用户');
    var a = `<a href='javascript:void(0)' id='app_user_name_exist_view'>${text}</a>`;
    const $explain = $('.ant-form-explain', username_block);
    $explain.html(
        Intl.get('user.user.exist.check.tip', '用户已存在，是否{check}?', {'check': a})
    );
    $('#app_user_name_exist_view').click((e) => {
        e.preventDefault();
        var loc = window.location.href;
        if (/\/user\/list/.test(loc)) {
            //清除表单内容
            AppUserFormActions.resetState();
            //展示详情
            AppUserActions.showUserDetail({
                user: {
                    user_id: user_id
                }
            });
        } else {
            history.pushState({}, '/user/list', {});
            //清除表单内容
            AppUserFormActions.resetState();
            //展示详情
            AppUserActions.showUserDetail({
                user: {
                    user_id: user_id
                }
            });
        }
    });
}

exports.checkUserExist = function(rule, obj, callback, number, username_block) {
    clearTimeout(userExistTimeout);
    userExistTimeout = setTimeout(() => {
        checkUserExistAjax(obj).then((result) => { // 通过验证情况
            userInfo = result;
            if (result.length === 0) {
                callback();
            } else { // 不通过验证的情况，分为两种情况
                // 第一种情况：同一个客户下，用户数多个时，通过， 一个时，不通过（提示用户名已存在，并且可以查看同名的用户详情信息）
                // 第二种情况：不同客户下，不通过，有多个用户名前缀相同时（提示用户名已存在）,有一个相同时，(提示用户名已存在，并且可以查看同名的用户详情信息)
                let customerIdArray = _.map(result, 'customer_id');
                let index = _.indexOf(customerIdArray, obj.customer_id);
                if (index !== -1) { // 有相同的customer_id
                    if (result.length === 1) { // 重复的用户数只有一个
                        if (number === 1) { // 申请的用户数为1， 不通过
                            callback(Intl.get('user.user.exist.tip', '用户已存在'));
                            clickUserName(result[0].id, username_block);
                        } else { // 申请的用户数为多个，通过
                            callback();
                        }
                    } else { // 重复的用户数为多个，通过
                        callback();
                    }

                } else { // 没有相同的customer_id
                    if (result.length === 1) {
                        callback(Intl.get('user.user.exist.tip', '用户已存在'));
                        clickUserName(result[0].id, username_block);
                    } else {
                        callback(Intl.get('user.user.exist.tip', '用户已存在')); // 申请多个用户时
                    }
                }
            }
        }, () => {
            callback();
        });
    }, checkUserExistIntervalTime);
};

exports.validatorMessageTips = function(value, callback) {
    let userNameRegex = /^[0-9a-zA-Z_@.-]{1,50}$/;
    if (language.lan() === 'es') {
        // 西班牙语中用户名的验证规则（Ññ Áá Éé Óó Úú Íí）
        userNameRegex = /^[0-9a-zA-ZñáçéíóúüÑÁÇÉÍÓÚÜ_@.-]{1,50}$/;
    }
    if (!value) {
        callback(Intl.get('user.username.write.tip', '请填写用户名'));
        return;
    }
    if (value.length < 3 || value.length > 50) {
        callback(Intl.get('user.username.length.tip', '用户名长度应大于3位小于50位'));
        return;
    }
    if (!userNameRegex.test(value)) {
        callback(Intl.get('crm.102', '用户名必须为字母、数字、下划线的组合或合法格式的邮箱'));
        return;
    }
    if (value) {
        callback();
        return;
    }
};


exports.userInfo = userInfo;


