/**
 * 版本升级日志的action
 */

var versionAjax = require('../ajax/version-upgrade-log-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
function VersionUpgradeLogActions() {
    this.generateActions(
        'hideForm',
        'resetState'
    );

    //获取版本升级日志列表
    this.getAppRecordsList = function(searchObj) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        versionAjax.getAppRecordsList(searchObj).then(function(resData) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function(errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    // 添加版本升级日志版本号和升级内容
    this.addAppVersion = function(newVersionInfo) {
        var _this = this;
        versionAjax.addAppVersion(newVersionInfo).then(function(resData) {
            _this.dispatch({resData: resData});
        }, function(errorMsg) {
            _this.dispatch({errorMsg: errorMsg});
        });
    };
    
    //  删除版本升级记录
    this.deleteAppVersionRecord = function(recordId){
        var _this = this;
        versionAjax.deleteAppVersionRecord(recordId).then(function(resData) {
            _this.dispatch({resData: resData});
        }, function(errorMsg) {
            _this.dispatch({errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(VersionUpgradeLogActions);