var ScheduleActions = require('../action/schedule-action');

function ClueCustomerScheduleStore() {
    //初始化state数据
    this.resetState();
    this.bindActions(ScheduleActions);
}

ClueCustomerScheduleStore.prototype.resetState = function() {
    this.pageSize = 10;//每页的加载条数
    this.total = 0;//共获取的数据总数
    this.listenScrollBottom = true;//是否下拉加载
    //下拉加载要传的id
    this.lastScheduleId = '';
    //日程列表
    this.scheduleList = [];
    //正在获取日程管理列表
    this.isLoadingScheduleList = false;
    //获取日程管理列表出错
    this.getScheduleListErrmsg = '';
    this.alertListBak = [];
};

ClueCustomerScheduleStore.prototype.getScheduleList = function(result) {
    if (result.loading){
        this.isLoadingScheduleList = true;
        this.getScheduleListErrmsg = '';
    }else if (result.error){
        this.isLoadingScheduleList = false;
        this.getScheduleListErrmsg = result.errorMsg;
        this.scheduleList = [];
    }else{
        this.isLoadingScheduleList = false;
        this.getScheduleListErrmsg = '';
        var scheduleList = _.isArray(result.data.list) ? result.data.list : [];
        if (!this.lastScheduleId){
            this.scheduleList = scheduleList;
        }else{
            this.scheduleList = this.scheduleList.concat(scheduleList);
        }
        this.total = result.data.total;
        this.lastScheduleId = this.scheduleList.length ? _.last(this.scheduleList).id : '';
        if (this.scheduleList.length === this.total){
            this.listenScrollBottom = false;
        }
    }
};

ClueCustomerScheduleStore.prototype.showAddForm = function(newSchedule) {
    this.clearEditState();
    this.alertListBak = _.cloneDeep(this.scheduleList);
    this.scheduleList.unshift(newSchedule);
};

ClueCustomerScheduleStore.prototype.showEditForm = function(alert) {
    this.clearEditState();
    this.alertListBak = JSON.parse(JSON.stringify(this.scheduleList));
    let theSchedule = _.find(this.scheduleList, item => item.id === alert.id);
    theSchedule.edit = true;
};

ClueCustomerScheduleStore.prototype.clearEditState = function() {
    let theSchedule = _.find(this.scheduleList, item => item.edit === true);
    if (theSchedule) {
        if (theSchedule.id) {
            delete theSchedule.edit;
        }
        else {
            this.scheduleList.splice(0,1);
        }
    }
};

ClueCustomerScheduleStore.prototype.cancelEdit = function() {
    this.scheduleList = this.alertListBak;
};
ClueCustomerScheduleStore.prototype.afterAddSchedule = function(newSchedule) {
    this.scheduleList.splice(0,1);
    this.scheduleList.unshift(newSchedule);
    this.total++;
};
ClueCustomerScheduleStore.prototype.afterDelSchedule = function(id) {
    this.scheduleList = _.filter(this.scheduleList,(schedule) => {
        return schedule.id !== id;
    });
    this.total--;
};

ClueCustomerScheduleStore.prototype.afterHandleStatus = function(newStatusObj) {
    var curSchedule = _.filter(this.scheduleList, schedule => schedule.id === newStatusObj.id);
    curSchedule[0].status = newStatusObj.status;
};
ClueCustomerScheduleStore.prototype.toggleScheduleContact = function(updateObj){
    let {item,flag} = updateObj;
    let curSchedule = _.find(this.scheduleList, schedule => schedule.id === item.id);
    curSchedule.isShowContactPhone = flag;
};

module.exports = alt.createStore(ClueCustomerScheduleStore , 'ClueCustomerScheduleStore');
