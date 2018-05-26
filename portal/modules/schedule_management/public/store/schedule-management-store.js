/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var ScheduleManagementAction = require("../action/schedule-management-action");
let userData = require("PUB_DIR/sources/user-data");
import {addHyphenToPhoneNumber} from "LIB_DIR/func";
const TimeStampUtil = require('PUB_DIR/sources/utils/time-stamp-util');
function ScheduleManagementStore() {
    //初始化state数据
    this.setInitState();
    this.bindActions(ScheduleManagementAction);
    this.exportPublicMethods({
        setViewDate: this.setViewDate,
        getViewDate: this.getViewDate
    });
}
ScheduleManagementStore.prototype.setInitState = function() {
    this.scheduleExpiredList = [];//过期日程列表
    this.scheduleExpiredSize = 0;//过期日程列表的数量
    this.isLoadingScheduleExpired = false;//正在获取过期日程列表
    this.scheduleExpiredErrMsg = "";//获取过期日程列表失败
    this.pageSize = 20;//一次获取日程列表的页数
    this.lastScheduleExpiredId = "";//过期日程列表用于下拉加载的id
    this.listenScrollBottom = true;//是否监听下拉加载
    this.handleStatusLoading = false;//正在修改日程的状态
    this.handleStatusErrMsg = "";//修改日程状态失败
    this.curViewDate = "";//当前页面展示的日期
};
//把数据转换成组件需要的类型
ScheduleManagementStore.prototype.processForList = function(originList,dateType) {
    if (!_.isArray(originList)) return [];
    let list = _.clone(originList);
    for (let i = 0, len = list.length; i < len; i++) {
        let curSchedule = list[i];
        curSchedule.dateType = dateType;//日期的类型 比如周，天，月
        curSchedule.title = curSchedule.topic;
        if (curSchedule.end_time - curSchedule.start_time == 86399000){
            curSchedule.end_time = curSchedule.end_time + 1000;
            curSchedule.allDay = true;
        }
        curSchedule.start = moment(curSchedule.start_time).format(oplateConsts.DATE_TIME_FORMAT);
        curSchedule.end = moment(curSchedule.end_time).format(oplateConsts.DATE_TIME_FORMAT);
        curSchedule.description = curSchedule.content;
    }
    return list;
};

//查询日程列表
ScheduleManagementStore.prototype.getScheduleList = function(data) {
    //获取两个列表，一个是超时日程列表，一个是右侧日程管理中用的列表
    //超时未完成的列表
    if (data.loading) {
        this.isLoadingScheduleExpired = true;
        this.scheduleExpiredErrMsg = "";
    } else if (data.error) {
        this.isLoadingScheduleExpired = false;
        this.scheduleExpiredErrMsg = data.errorMsg;
    } else {
        let list = data.scheduleListObj ? data.scheduleListObj.list : [];
        this.scheduleExpiredSize = data.scheduleListObj ? data.scheduleListObj.total : 0;
        if (this.lastScheduleExpiredId) {
            this.scheduleExpiredList = this.scheduleExpiredList.concat(list);
        } else {
            this.scheduleExpiredList = list;
        }
        this.lastScheduleExpiredId = this.scheduleExpiredList.length ? _.last(this.scheduleExpiredList).id : "";

        this.listenScrollBottom = this.scheduleExpiredSize > this.scheduleExpiredList.length;
        this.isLoadingScheduleExpired = false;
    }
};

//添加或更新跟进内容
ScheduleManagementStore.prototype.handleScheduleStatus = function(result) {
    if (result.loading) {
        this.handleStatusLoading = true;
        this.handleStatusErrMsg = "";
    } else if (result.error) {
        this.handleStatusLoading = false;
        this.handleStatusErrMsg = result.errorMsg;
    } else {
        this.handleStatusLoading = false;
        this.handleStatusErrMsg = "";
    }
};
//修改某个提醒的状态
ScheduleManagementStore.prototype.afterHandleStatus = function(newStatusObj) {
    this.scheduleExpiredList = _.filter(this.scheduleExpiredList, (schedule) => {return schedule.id !== newStatusObj.id;});
};
//获取当前页面展示的日期
ScheduleManagementStore.prototype.getViewDate = function(date) {
    return this.curViewDate;
};
//设置当前页面展示的日期
ScheduleManagementStore.prototype.setViewDate = function(date) {
    this.curViewDate = date;
};
module.exports = alt.createStore(ScheduleManagementStore, 'ScheduleManagementStore');
