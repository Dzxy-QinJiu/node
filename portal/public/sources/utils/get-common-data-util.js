import userData from '../user-data';
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import appAjaxTrans from 'MOD_DIR/common/public/ajax/app';
import {storageUtil} from 'ant-utils';
const session = storageUtil.session;
// 缓存在sessionStorage中的座席号的key
const sessionCallNumberKey = 'callNumber';
let appList = [];
// 获取拨打电话的座席号
exports.getUserPhoneNumber = function(cb) {
    let user_id = userData.getUserData().user_id;
    let callNumberObj = {};
    let storageObj = JSON.parse(session.get(sessionCallNumberKey));
    let callNumber = storageObj && storageObj[user_id] ? storageObj[user_id] : '';
    if (callNumber) {
        callNumberObj.callNumber = callNumber;
        cb(callNumberObj);
    } else {
        crmAjax.getUserPhoneNumber(user_id).then((result) => {
            if (result.phone_order) {
                let storageCallNumberObj = {};
                storageCallNumberObj[user_id] = result.phone_order;
                session.set(sessionCallNumberKey, JSON.stringify(storageCallNumberObj));
                callNumberObj.callNumber = result.phone_order;
                cb(callNumberObj);
            }
        }, (errMsg) => {
            callNumberObj.errMsg = errMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!');
            cb(callNumberObj);
        });
    }
};

exports.getAppList = function(cb) {
    if (_.get(appList, '[0]')) {
        if (_.isFunction(cb)) cb(appList);
    } else {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(result => {
            let list = [];
            if (_.get(result, '[0]')) {
                list = result.map(function(app) {
                    return {
                        client_id: app.app_id,
                        client_name: app.app_name,
                        client_image: app.app_logo
                    };
                });
            }
            appList = list;
            if (_.isFunction(cb)) cb(appList);
        }).error(errorMsg => {
            appList = [];
            if (_.isFunction(cb)) cb(appList);
        });
    }
};