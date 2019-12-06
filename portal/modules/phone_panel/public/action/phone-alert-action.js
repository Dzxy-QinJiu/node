var phoneAlertAjax = require('../ajax/phone-alert-ajax');
var customerRecordAjax = require('MOD_DIR/crm/public/ajax/customer-record-ajax');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
const AUTHS = {
    'GETALL': crmPrivilegeConst.CUSTOMER_ALL
};
function PhoneAlertAction() {
    this.generateActions(
        'setStatus',
        'setContent',
        'setEditStatus',
        'setInitialState',
        'setAddCustomer',
        'setAddCustomerInfo',
        'setSubmitErrMsg',
        'setCustomerInfoArr',
        'setInitialCustomerArr',
        'toggleCustomerDetail'
    );
    this.getCustomerById = function(customerId) {
        var rangParams = [{//时间范围参数
            from: '',
            to: '',
            type: 'time',
            name: 'start_time'
        }];
        var data = {
            data: JSON.stringify({'id': customerId}),
            rangParams: JSON.stringify(rangParams)
        };
        if (hasPrivilege(AUTHS.GETALL)) {
            data.hasManageAuth = true;
        }
        this.dispatch({loading: true,error: false});
        phoneAlertAjax.getCustomerById(data).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //更新客户跟踪记录
    this.updateCustomerTrace = function(queryObj, callback) {
        this.dispatch({loading: true,error: false});
        customerRecordAjax.updateCustomerTrace(queryObj).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(PhoneAlertAction);