var AppNoticeAction = require("../action/app-notice-action");

function AppNoticeStore() {
    this.appNoticeListResult = "loading";

    this.resetState();

    this.bindActions(AppNoticeAction);
}

AppNoticeStore.prototype.getAppNoticeList = function(resData){
    if (resData.loading){
        this.appNoticeListResult = "loading";
    } else if (resData.error){
        this.getAppNoticeErrorMsg = resData.errorMsg;
        this.appNoticeListResult = "";
    } else {
        this.getAppNoticeErrorMsg = '';
        this.appNoticeListResult = "";
        var list = _.isArray(resData.resData.list) ? resData.resData.list : [];
        this.noticeList = this.noticeList.concat(list);
        this.curPage++;
        this.total = resData.resData.total;
    }
};

AppNoticeStore.prototype.resetState = function(){
    this.noticeList = [];
    // 是否显示暂无数据
    this.noDataShow = true;
    // 判断下拉加载
    this.listenScrollBottom = true;
    this.pageSize = 20;
    this.curPage = 1;
    this.total = 0;
    // 获取系统公告错误处理
    this.getAppNoticeErrorMsg = '';
};

module.exports = alt.createStore(AppNoticeStore , 'AppNoticeStore');
