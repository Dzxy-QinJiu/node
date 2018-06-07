/**
 * 版本升级日志的action
 */

var versionAjax = require('../ajax/version-upgrade-log-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
function VersionUpgradeLogActions(){

    this.generateActions(
        'resetState'
    );
    
    //获取版本升级日志列表
    this.getAppRecordsList = function(searchObj) {
        var _this = this;
        _this.dispatch({loading: true,error: false});
        versionAjax.getAppRecordsList(searchObj).then(function(resData) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false,error: false, resData: resData});
        },function(errorMsg) {
            _this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(VersionUpgradeLogActions);