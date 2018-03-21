var phoneAlertAjax = require("../ajax/phone-alert-ajax");
var customerRecordAjax = require("MOD_DIR/crm/public/ajax/customer-record-ajax");
function PhoneAlertAction() {

    this.generateActions(
        "setStatus",
        "setContent",
        "setEditStatus",
        'setInitialState',
        'setAddCustomer',
        'setCustomerUnknown',
        'setAddCustomerInfo',
        'setSubmitErrMsg',
        'setCustomerInfoArr'
    );
    this.getCustomerByPhone = function (phoneNum) {
        var rangParams = [{//时间范围参数
            from: "",
            to: "",
            type: "time",
            name: "start_time"
        }];
        var queryObj = {"total_size":0,"cursor":true,"id":""};
        var data = {
            data: JSON.stringify({"contacts":[{"phone":[phoneNum]}]}),
            rangParams: JSON.stringify(rangParams),
            queryObj: JSON.stringify(queryObj)
        };
        this.dispatch({loading:true,error:false});
        phoneAlertAjax.getCustomerByPhone(data).then((data) => {
            this.dispatch({loading:false,error:false,data:data})
        }, (errorMsg)=>{
            this.dispatch({loading:false,error:true,errorMsg:errorMsg})
        });
    };
    this.getCustomerById = function (customerId) {
        this.dispatch({loading:true,error:false});
        phoneAlertAjax.getCustomerById(customerId).then((data) => {
            this.dispatch({loading:false,error:false,data:data})
        }, (errorMsg)=>{
            this.dispatch({loading:false,error:true,errorMsg:errorMsg})
        });
    };
    //更新客户跟踪记录
    this.updateCustomerTrace = function (queryObj, callback) {
        this.dispatch({loading:true,error:false});
        customerRecordAjax.updateCustomerTrace(queryObj).then((data) => {
            this.dispatch({loading:false,error:false,data:data});
            _.isFunction(callback) && callback();
        },(errorMsg)=>{
            this.dispatch({loading:false,error:true,errorMsg:errorMsg});
        });
    };
}
module.exports = alt.createActions(PhoneAlertAction);