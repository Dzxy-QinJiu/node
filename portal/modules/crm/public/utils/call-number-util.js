import userData from 'PUB_DIR/sources/user-data';
import crmAjax from '../ajax/index';
import { storageUtil } from 'ant-utils';
const session = storageUtil.session;
import { savePositionCallNumberKey } from 'PUB_DIR/sources/utils/consts';

// 获取拨打电话的座席号
exports.getUserPhoneNumber = function(cb) {
    let user_id = userData.getUserData().user_id;
    let phoneNumberInfo = {};
    crmAjax.getUserPhoneNumber(user_id).then((result) => {
        if (result.phone_order) {
            phoneNumberInfo.callNumber = result.phone_order;
            session.set(savePositionCallNumberKey, result.phone_order);
            cb(phoneNumberInfo);
        }
    }, (errMsg) => {
        phoneNumberInfo.errMsg = errMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!');
        cb(phoneNumberInfo);
    });
};