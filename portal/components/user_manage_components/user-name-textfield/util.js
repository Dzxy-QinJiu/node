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
let checkUserExistIntervalTime = 500;//检查用户是否存在的间隔时间
import { userDetailEmitter } from 'PUB_DIR/sources/utils/emitters';

function checkUserExistAjax(obj) {
    return Ajax.checkUserName(obj);
}

function showUserDetail(user_id) {
    // 触发用户详情界面
    userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL,{
        userId: user_id
    });
}

function clickUserName(user_id, username_block) {
    var text = Intl.get('user.user.check', '查看该用户');
    var a = `<a href='javascript:void(0)' id='app_user_name_exist_view' class="handle-btn-item">${text}</a>`;
    const $explain = $('.ant-form-explain', username_block);
    $explain.html(
        Intl.get('user.user.exist.check.tip', '用户已存在，{check}?', {'check': a})
    );
    $('#app_user_name_exist_view').click((e) => {
        e.preventDefault();
        var loc = window.location.href;
        if (/\/user\/list/.test(loc)) {
            //清除表单内容
            AppUserFormActions.resetState();
            //展示详情
            showUserDetail(user_id);
        } else {
            //清除表单内容
            AppUserFormActions.resetState();
            //展示详情
            showUserDetail(user_id);
        }
    });
}

function checkUserNameTips(callback, userId, username_block, isBelongOtherUser = false) {
    callback(Intl.get('user.user.exist.tip', '用户已存在'));
    // 属于其他人用户，只提示
    if (!isBelongOtherUser) {
        clickUserName(userId, username_block);
    }
}
//有多个用户的时候，展示多个用户，每个用户是否可以点击根据这个用户是不是属于其他人(isBelongOtherUser,属于其他人的只展示，否则可以点击查看详情)
function checkMultiUserNameTip(callback,result,username_block){
    callback(Intl.get('user.user.exist.tip', '用户已存在'));
    _.forEach(result, (item, index) => {
        //属于其他人用户，只提示
        var userId = _.get(item, 'id');
        var a = `<a href='javascript:void(0)' id=${userId} class="handle-btn-item">${_.get(item, 'name')}${index !== result.length - 1 ? ';' : ''}</a>`;
        const $explain = $('.ant-form-explain', username_block);
        $explain.append(a);
        $(`#${userId}`).click((e) => {
            e.preventDefault();
            //清除表单内容
            AppUserFormActions.resetState();
            //展示详情
            showUserDetail(userId);
        });
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
                // 第二种情况：不同客户下，不通过，有多个用户名前缀相同时（提示用户名已存在，并可以查看每个用户）,有一个相同时，(提示用户名已存在，并且可以查看同名的用户详情信息)
                let customerIdArray = _.map(result, 'customer_id');
                let index = _.indexOf(customerIdArray, obj.customer_id);
                let userId = _.get(result, '[0].id');
                // 已存在的用户名是否属于其他用户
                let isBelongOtherUser = _.get(result, '[0].isBelongOtherUser');
                if (index !== -1) { // 有相同的customer_id
                    if (result.length === 1) { // 重复的用户数只有一个
                        if (number === 1) { // 申请的用户数为1， 不通过
                            checkUserNameTips(callback, userId, username_block, isBelongOtherUser);
                        } else { // 申请的用户数为多个，通过
                            callback();
                        }
                    } else { // 重复的用户数为多个，通过
                        callback();
                    }

                } else { // 没有相同的customer_id
                    if (result.length === 1) {
                        checkUserNameTips(callback, userId, username_block, isBelongOtherUser);
                    } else {
                        //展示多个已存在的用户，客户
                        var showUserList = _.filter(result,item => !item.isBelongOtherUser);
                        checkMultiUserNameTip(callback, showUserList, username_block);
                    }
                }
            }
        }, () => {
            callback(Intl.get('common.username.is.unique', '用户名唯一性校验出错！'));
        });
    }, checkUserExistIntervalTime);
};

exports.validatorMessageTips = function(value, callback, checkUserExist) {
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
        if (_.isFunction(checkUserExist)) {
            checkUserExist();
        } else {
            callback();
            return;
        }
    }
};


exports.userInfo = userInfo;


