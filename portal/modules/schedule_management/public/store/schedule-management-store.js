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
    this.getState();
    this.bindActions(ScheduleManagementAction);
}
ScheduleManagementStore.prototype.getState = function () {
    this.scheduleExpiredList = [];//过期日程列表
    this.isLoadingScheduleExpired = false;//正在获取过期日程列表
    this.scheduleExpiredErrMsg = "";//获取过期日程列表失败
    this.pageSize = 20;//一次获取日程列表的页数
    this.lastScheduleExpiredId = "";//过期日程列表用于下拉加载的id
    this.listenScrollBottom = true;//是否监听下拉加载
    this.scheduleExpiredSize = 0;//过期日程列表的数量
    this.handleStatusLoading = false;//正在修改日程的状态
    this.handleStatusErrMsg = "";//修改日程状态失败


};
//查询日程列表
ScheduleManagementStore.prototype.getScheduleList = function (data) {
    if (data.loading) {
        this.isLoadingScheduleExpired = true;
        this.scheduleExpiredErrMsg = "";
    } else if (data.error) {
        this.isLoadingScheduleExpired = false;
        this.scheduleExpiredErrMsg = data.errorMsg;
    } else {
        let list = data.scheduleListObj ? data.scheduleListObj.list: [];
        this.scheduleExpiredSize = data.scheduleListObj ? data.scheduleListObj.total :0 ;
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
ScheduleManagementStore.prototype.handleScheduleStatus = function (result) {
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
ScheduleManagementStore.prototype.afterHandleStatus = function (newStatusObj) {
    this.scheduleExpiredList = _.filter(this.scheduleExpiredList, (schedule)=>{return schedule.id !== newStatusObj.id;});
};

























function getContactWay(contactPhone) {
    var contact_way = "";
    if (_.isArray(contactPhone)) {
        contactPhone.forEach(function (phone) {
            if (phone) {
                contact_way += addHyphenToPhoneNumber(phone) + "\n";
            }
        });
    }
    return contact_way;
}
ScheduleManagementStore.prototype.processForList = function (curCustomers) {
    if (!_.isArray(curCustomers)) return [];
    var list = _.clone(curCustomers);
    _.map(list, (curCustomer) => {
        if (_.isArray(curCustomer.contacts)) {
            for (var j = 0; j < curCustomer.contacts.length; j++) {
                var contact = curCustomer.contacts[j];
                if (contact.def_contancts == "true") {
                    curCustomer.contact = contact.name;
                    curCustomer.contact_way = getContactWay(contact.phone);
                }
            }
        }
    });
    return list;
};

//设置开始和结束时间
ScheduleManagementStore.prototype.setTimeRange = function (timeRange) {
    this.rangParams[0].from = timeRange.start_time;
    this.rangParams[0].to = timeRange.end_time;
};
//设置筛选线索客户的类型
ScheduleManagementStore.prototype.setFilterType = function (value) {
    this.clueCustomerTypeFilter.status = value;
};
//线索客户分配给销售
ScheduleManagementStore.prototype.distributeCluecustomerToSale = function (result) {
    if (result.loading) {
        this.distributeLoading = true;
        this.distributeErrMsg = "";
    } else if (result.error) {
        this.distributeLoading = false;
        this.distributeErrMsg = result.errorMsg;
    } else {
        this.distributeLoading = false;
        this.distributeErrMsg = "";
    }
};
//查看某个客户的详情
ScheduleManagementStore.prototype.setCurrentCustomer = function (id) {
    this.currentId = id;
    this.curCustomer = _.find(this.curCustomers, customer => {
        return customer.id === id;
    });
};
//添加完销售线索后的处理
ScheduleManagementStore.prototype.afterAddSalesClue = function (newCustomer) {
    var newArr = this.processForList([newCustomer]);
    newCustomer = newArr[0];
    this.curCustomers = _.filter(this.curCustomers, customer => customer.id != newCustomer.id);
    //只有筛选状态是待分配，并且筛选时间是今天的时候，才把这个新增客户加到列表中
    if ((this.clueCustomerTypeFilter.status == "0" || this.clueCustomerTypeFilter.status == "") && this.rangParams[0].from <= newCustomer.start_time && newCustomer.start_time <= this.rangParams[0].to){
        this.curCustomers.unshift(newCustomer);
        this.customersSize++;
    }
};
//用于设置下拉加载的最后一个客户的id
ScheduleManagementStore.prototype.setLastCustomerId = function (id) {
    this.lastCustomerId = id;
};

ScheduleManagementStore.prototype.setSalesMan = function (salesObj) {
    this.salesMan = salesObj.salesMan;
    //去掉未选销售的提示
    this.unSelectDataTip = "";
};
ScheduleManagementStore.prototype.setSalesManName = function (salesObj) {
    this.salesManNames = salesObj.salesManNames;
    //去掉未选销售的提示
    this.unSelectDataTip = "";
};
//未选销售的提示
ScheduleManagementStore.prototype.setUnSelectDataTip = function (tip) {
    this.unSelectDataTip = tip;
};
//修改信息完成后
ScheduleManagementStore.prototype.afterEditCustomerDetail = function (newCustomerDetail) {
    //修改客户相关的属性，直接传属性和客户的id
    //如果修改联系人相关的属性，还要把联系人的id传过去
    var customerProperty = ["access_channel", "clue_source", "source", "user_id", "user_name", "sales_team", "sales_team_id"];
    for (var key in newCustomerDetail) {
        if (_.indexOf(customerProperty, key) > -1) {
            //修改客户的相关属性
            this.curCustomer[key] = newCustomerDetail[key];
        } else {
            //修改联系人的相关属性
            if (key == "contact_name") {
                this.curCustomer.contacts[0].name = newCustomerDetail[key];
                this.curCustomer.contact = newCustomerDetail[key];
            } else {
                this.curCustomer.contacts[0][key][0] = newCustomerDetail[key];
                if (key == "phone"){
                    this.curCustomer.contact_way = newCustomerDetail[key];
                }
            }
        }
    }
};
ScheduleManagementStore.prototype.getSalesManList = function (list) {
    list = _.isArray(list) ? list : [];
    //过滤掉停用的成员
    if (userData.isSalesManager()) {
        //销售领导、域管理员角色时，客户所属销售下拉列表的过滤
        this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status == 1);
    } else if (userData.hasRole("sales")) {
        //销售角色，所属销售下拉列表的过滤
        this.salesManList = _.filter(list, sales => sales.status == 1);
    }
};
module.exports = alt.createStore(ScheduleManagementStore, 'ScheduleManagementStore');
