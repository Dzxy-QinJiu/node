var appAjax = require("../ajax/app-ajax");
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
function AppActions() {
    this.generateActions(
        'setCurApp',
        'closeAddPanel',
        'afterEditApp',
        'showAppForm',
        'showModalDialog',
        'hideModalDialog',
        'updateCurPage',
        'updatePageSize',
        'showAppInfo',
        'closeRightPanel',
        'returnInfoPanel',
        'updateSearchContent',
        'setLogLoading',
        'setCurAppDetail',
        'toggleFilterPanel',
        'setSelectTag',
        'afterEditAppTag',
        'showVersionUpgradePanel',
        'setSelectStatus',
        // 系统公告
        'showAppNoticePanel',
        'showUserTypeConfigPanel'
    );

    this.getCurAppList = function(searchObj) {
        var _this = this;
        appAjax.getCurAppList(searchObj).then(function(listObj) {
            _this.dispatch(listObj);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    this.getCurAppById = function(appId) {
        var _this = this;
        appAjax.getCurAppById(appId).then(function(app) {
            if (_.isObject(app)) {
                _this.dispatch(app);
            } else {
                _this.dispatch(Intl.get("app.get.app.detail.failed", "获取应用详情失败!"));
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("app.get.app.detail.failed", "获取应用详情失败!"));
        });
    };
    
    this.updateAppStatus = function(app) {
        var _this = this;
        appAjax.editApp(app).then(function(appModified) {
            if (appModified){
                _this.actions.afterEditApp(app);
            }
        });
    };
}

module.exports = alt.createActions(AppActions);
