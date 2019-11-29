var clueRecordAjax = require('MOD_DIR/clue_customer/public/ajax/clue-trace-ajax');
var phoneAjax = require('../ajax/phone-alert-ajax');
function PhoneAlertAction() {
    this.generateActions(
        'setStatus',
        'setContent',
        'setEditStatus',
        'setInitialState',
        'setSubmitErrMsg',
        'setInitialClueArr',
        'toggleClueDetail'
    );
    this.getClueById = function(clueId) {
        this.dispatch({loading: true,error: false});
        phoneAjax.getClueDetailById(clueId).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //更新线索的跟进记录
    this.updateClueTrace = function(queryObj, callback) {
        this.dispatch({loading: true,error: false});
        clueRecordAjax.updateClueTrace(queryObj).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(PhoneAlertAction);