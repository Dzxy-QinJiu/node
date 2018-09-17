var CRMActions = require('../action/basic-overview-actions');

function CrmOverviewStore() {
    //基本资料
    this.basicData = {};
    //加载数据中。。。
    this.basicIsLoading = true;
    //是否展示编辑基本资料页面的标志
    this.editShowFlag = false;
    this.crmUserList = [];//客户开通的用户列表
    this.isUserLoading = false;//是否正在获取客户开通的用户列表
    this.userErrorMsg = '';//获取客户开通的用户列表的错误提示
    this.userTotal = 0;//客户开通的用户的总数
    this.isLoadingScheduleList = false;//是否正在获取未完成的日程列表
    this.getScheduleListErrmsg = '';//获取未完成日程列表失败的提示
    this.scheduleList = [];//未完成的日程列表
    this.bindActions(CRMActions);
}

CrmOverviewStore.prototype.setCrmUserList = function(list) {
    this.crmUserList = _.isArray(list) ? list : [];
};
//获取客户开通的用户列表
CrmOverviewStore.prototype.getCrmUserList = function(resultObj) {
    if (resultObj.loading) {
        this.isUserLoading = true;
        this.userErrorMsg = '';
    } else if (resultObj.errorMsg) {
        this.isUserLoading = false;
        this.userErrorMsg = resultObj.errorMsg;
    } else {
        this.isUserLoading = false;
        this.userErrorMsg = '';
        let resultData = resultObj.result;
        if (resultData && _.isArray(resultData.data)) {
            this.crmUserList = resultData.data;
            this.userTotal = resultData.total;
        }
    }
};
CrmOverviewStore.prototype.getNotCompletedScheduleList = function(result) {
    if (result.loading) {
        this.isLoadingScheduleList = true;
        this.getScheduleListErrmsg = '';
    } else if (result.error) {
        this.isLoadingScheduleList = false;
        this.getScheduleListErrmsg = result.errorMsg;
        this.scheduleList = [];
    } else {
        this.isLoadingScheduleList = false;
        this.getScheduleListErrmsg = '';
        this.scheduleList = _.isArray(result.data.list) ? result.data.list : [];
    }
};
CrmOverviewStore.prototype.afterHandleStatus = function(newStatusObj) {
    var curSchedule = _.filter(this.scheduleList, (schedule) => {return schedule.id === newStatusObj.id;});
    curSchedule[0].status = newStatusObj.status;
};
//成功添加日程后，如果该日程类型为今天的电联日程，就在列表中加上该日程
CrmOverviewStore.prototype.afterAddSchedule = function(newScheduleObj) {
    this.scheduleList.push(newScheduleObj);
};

CrmOverviewStore.prototype.getEditShowFlag = function() {
    return this.getState().editShowFlag;
};

//监听Actions的方法处理
CrmOverviewStore.prototype.getBasicData = function(basicData) {
    this.basicData = basicData;
    this.userTotal = basicData && _.isArray(basicData.app_user_ids) ? basicData.app_user_ids.length : 0;
    this.basicIsLoading = false;
};

CrmOverviewStore.prototype.setBasicState = function(state) {
    this.basicIsLoading = state;
};

CrmOverviewStore.prototype.updateBasicData = function(newBasicData) {
    //如果当前展示的是要修改的客户资料，则更新，否则，不更新
    if (newBasicData.id === this.basicData.id) {
        this.basicData = newBasicData;
    }
};

module.exports = alt.createStore(CrmOverviewStore, 'CrmOverviewStore');
