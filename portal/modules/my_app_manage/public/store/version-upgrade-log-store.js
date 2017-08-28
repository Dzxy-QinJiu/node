var VersionUpgradeLogAction = require("../action/version-upgrade-log-action");

function VersionUpgradeLogStore() {
    this.appVersionListResult = "loading";

    this.resetState();
    
    this.bindActions(VersionUpgradeLogAction);
}

// 获取版本记录列表
VersionUpgradeLogStore.prototype.getAppRecordsList= function(resData){
    if (resData.loading){
        this.appVersionListResult = "loading";
    }else if(resData.error){
        this.getAppRecordErrorMsg=resData.errorMsg;
        this.appVersionListResult="";
    } else {
        this.getAppRecordErrorMsg = "";
        this.appVersionListResult="";
        var list = _.isArray(resData.resData.list)? resData.resData.list : [];
        this.versionList = this.versionList.concat(list);
        this.curPage++;
        this.total = resData.resData.total;
    }

};

// 重置信息
VersionUpgradeLogStore.prototype.resetState = function(){
    this.versionList = [];
    // 是否显示暂无数据
    this.noDataShow = true;
    // 判断下拉加载
    this.listenScrollBottom = true;
    this.pageSize = 20;
    this.curPage = 1;
    this.total = 0;
    // 获取版本升级记录错误处理
    this.getAppRecordErrorMsg = '';
};

// 隐藏添加版本记录表单
VersionUpgradeLogStore.prototype.hideForm = function(){
    this.addVersionInfoShow = false;
};

module.exports = alt.createStore(VersionUpgradeLogStore , 'VersionUpgradeLogStore');
