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
        'showAuthRolePanel',
        'closeAuthRolePanel',
        'setShowRoleAuthType',
        'showVersionUpgradePanel',
        'showAppAuthPanel',
        // 系统公告
        'showAppNoticePanel',
        'showUserTypeConfigPanel',
        'setAppSecretRefreshing',
        'afterUpdateAppExpireDate',
        'showAppCodeTrace'
    );

    this.getMyAppList = function(searchObj) {
        var _this = this;
        appAjax.getMyAppList(searchObj).then(function(listObj) {
            _this.dispatch(listObj);
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("my.app.get.app.failed", "获取我的应用失败"));
        });
    };

    this.getCurAppById = function(appId) {
        var _this = this;
        appAjax.getCurAppById(appId).then(function(app) {
            _this.dispatch(app);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    this.updateAppStatus = function(app) {
        var _this = this;
        appAjax.editApp(app).then(function(appModified) {
            _this.actions.afterEditApp(appModified);
        });
    };
    //刷新应用密钥
    this.refreshAppSecret = function(appId) {
        var _this = this;
        appAjax.refreshAppSecret(appId).then(function(appSecret) {
            _this.dispatch({id: appId, appSecret: appSecret && appSecret.result});
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };
    //更新应用到期时间
    this.updateAppExpireDate = function(app, callback) {
        appAjax.updateAppExpireDate(app).then(function(data) {
            if (data && callback) {
                callback(data);
            }
        }, function(errorMsg) {
            if (callback) {
                callback({error: true, errorMsg: errorMsg || Intl.get("my.app.change.expire.time.error", "修改应用到期时间失败")});
            }
        });
    };
    this.getCurAppKeyById = function(appId) {
        var _this = this;
        _this.dispatch({error: false, loading: true});
        appAjax.getCurAppKeyById(appId).then(function(data) {
            _this.dispatch({error: false, loading: false, data: data});
        }, function(errorMsg) {
            _this.dispatch({error:true, loading: false, errorMsg:errorMsg || Intl.get("app.get.app.key.failed","获取piwik信息失败")});
        });
    };

}

module.exports = alt.createActions(AppActions);
