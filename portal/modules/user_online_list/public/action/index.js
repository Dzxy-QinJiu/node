import onlineUserListAjax from "../ajax";
import Utils from "../utils";
function OnlineUserIndexAction() {
    this.generateActions(
        'setSelectedAppId'
    );
    //获取应用列表
    this.getAppList = function() {
        const _this = this;
        onlineUserListAjax.getAppList().then(function(data) {
            _this.dispatch(data);
            Utils.emitter.emit(Utils.EMITTER_CONSTANTS.APP_LIST_LOADED , data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
            Utils.emitter.emit(Utils.EMITTER_CONSTANTS.APP_LIST_LOADED , []);
        });
    };
}

module.exports = alt.createActions(OnlineUserIndexAction);
