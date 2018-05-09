var CRMActions = require("../action/basic-overview-actions");

function CRMStore() {
    //基本资料
    this.basicData = {};
    //加载数据中。。。
    this.basicIsLoading = true;
    //是否展示编辑基本资料页面的标志
    this.editShowFlag = false;
    this.crmUserList = [];//客户开通的用户列表
    this.isUserLoading = false;//是否正在获取客户开通的用户列表
    this.userErrorMsg = "";//获取客户开通的用户列表的错误提示
    this.userTotal = 0;//客户开通的用户的总数
    this.isLoadingScheduleList = false;//是否正在获取未完成的日程列表
    this.getScheduleListErrmsg = "";//获取未完成日程列表失败的提示
    this.scheduleList = [];//未完成的日程列表
    this.bindActions(CRMActions);
}
//获取客户开通的用户列表
CRMStore.prototype.getCrmUserList = function (resultObj) {
    if (resultObj.loading) {
        this.isUserLoading = true;
        this.userErrorMsg = "";
    } else if (resultObj.errorMsg) {
        this.isUserLoading = false;
        this.userErrorMsg = resultObj.errorMsg;
    } else {
        this.isUserLoading = false;
        this.userErrorMsg = "";
        let resultData = resultObj.result;
        if (resultData && _.isArray(resultData.data)) {
            this.crmUserList = resultData.data;
            this.userTotal = resultData.total;
        }
    }
};
CRMStore.prototype.getNotCompletedScheduleList = function (result) {
    if (result.loading) {
        this.isLoadingScheduleList = true;
        this.getScheduleListErrmsg = "";
    } else if (result.error) {
        this.isLoadingScheduleList = false;
        this.getScheduleListErrmsg = result.errorMsg;
        this.scheduleList = [];
    } else {
        this.isLoadingScheduleList = false;
        this.getScheduleListErrmsg = "";
        this.scheduleList = _.isArray(result.data.list) ? result.data.list : [];
    }
};
CRMStore.prototype.afterHandleStatus = function (newStatusObj) {
    var curSchedule = _.filter(this.scheduleList, (schedule)=>{return schedule.id == newStatusObj.id;});
    curSchedule[0].status = newStatusObj.status;
};

CRMStore.prototype.getEditShowFlag = function () {
    return this.getState().editShowFlag;
};

//监听Actions的方法处理
CRMStore.prototype.getBasicData = function (basicData) {
    this.basicData = basicData;
    this.userTotal = basicData && _.isArray(basicData.app_user_ids) ? basicData.app_user_ids.length : 0;
    this.basicIsLoading = false;
};

CRMStore.prototype.setBasicState = function (state) {
    this.basicIsLoading = state;
};

CRMStore.prototype.submitBaiscForm = function (newBasicData) {
    //如果当前展示的是要修改的客户资料，则更新，否则，不更新
    if (newBasicData.id == this.basicData.id) {
        this.basicData = newBasicData;
    }
    this.editShowFlag = false;
};

module.exports = alt.createStore(CRMStore, 'CRMStore');
