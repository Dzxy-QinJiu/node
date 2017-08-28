import OnlineUserIndexAction from "../action";
//应用列表
function OnlineUserIndexStore() {
    //应用列表
    this.appList = [];
    //绑定action
    this.bindActions(OnlineUserIndexAction);
}

//获取应用列表
OnlineUserIndexStore.prototype.getAppList = function(appList) {
    this.appList = _.isArray(appList) ? appList : [];
};

module.exports = alt.createStore(OnlineUserIndexStore , 'OnlineUserIndexStore');
