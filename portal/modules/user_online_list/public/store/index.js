import OnlineUserIndexAction from "../action";
//应用列表
function OnlineUserIndexStore() {
    //应用列表
    this.appList = [];
    //某个选中应用的id
    this.selectedAppId = "";
    //绑定action
    this.bindActions(OnlineUserIndexAction);
}

//获取应用列表
OnlineUserIndexStore.prototype.getAppList = function(appList) {
    this.appList = _.isArray(appList) ? appList : [];
};
//选中某个应用
OnlineUserIndexStore.prototype.setSelectedAppId = function(appObj) {
    this.selectedAppId = appObj.client_id;
};

module.exports = alt.createStore(OnlineUserIndexStore , 'OnlineUserIndexStore');
