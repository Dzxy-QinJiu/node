import userData from '../user-data';
import crmAjax from 'MOD_DIR/crm/public//ajax/index';
import { storageUtil } from 'ant-utils';
const session = storageUtil.session;
import { sessionCallNumberKey } from './consts';
import { saveUserIdSessionKey, getSessionStorageObj } from './common-method-util';

// 获取拨打电话的座席号
exports.getUserPhoneNumber = function(cb) {
    let phoneNumberInfo = {};
    let storageValue = JSON.parse(session.get(saveUserIdSessionKey));
    let callNumber = storageValue && storageValue[sessionCallNumberKey] ? storageValue[sessionCallNumberKey] : '';
    if (callNumber) {
        phoneNumberInfo.callNumber = callNumber;
        cb(phoneNumberInfo);
    } else {
        let user_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(user_id).then((result) => {
            if (result.phone_order) {
                phoneNumberInfo.callNumber = result.phone_order;
                let obj = getSessionStorageObj(sessionCallNumberKey, result.phone_order );
                session.set(saveUserIdSessionKey, JSON.stringify(obj));
                cb(phoneNumberInfo);
            }
        }, (errMsg) => {
            phoneNumberInfo.errMsg = errMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!');
            cb(phoneNumberInfo);
        });
    }
};