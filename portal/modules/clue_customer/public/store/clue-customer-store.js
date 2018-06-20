/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var ClueCustomerAction = require('../action/clue-customer-action');
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
const datePickerUtils = require('CMP_DIR/datepicker/utils');
function ClueCustomerStore() {
    //初始化state数据
    this.getState();
    this.bindActions(ClueCustomerAction);
}
ClueCustomerStore.prototype.getState = function() {
    var timeObj = datePickerUtils.getThisWeekTime(); // 本周
    this.salesManList = [];//销售列表
    this.listenScrollBottom = true;//是否监测下拉加载
    this.curCustomers = [];//查询到的线索客户列表
    this.pageSize = 20; //一页可显示的客户的个数
    this.isLoading = true;//加载线索客户列表数据中。。。
    this.clueCustomerErrMsg = '';//获取线索客户列表失败
    this.customersSize = 0;//线索客户列表的数量
    this.clueCustomerTypeFilter = {status: ''};//线索客户的类型  0 待分配 1 已分配 2 已跟进
    this.currentId = '';//当前展示的客户的id
    this.curCustomer = {}; //当前展示的客户详情
    this.rangParams = [{//时间范围参数
        from: datePickerUtils.getMilliseconds(timeObj.start_time),
        to: datePickerUtils.getMilliseconds(timeObj.end_time, true),
        type: 'time',
        name: 'source_time'
    }];
    this.submitTraceErrMsg = '';//提交跟进内容报错的情况
    this.submitTraceLoading = false;//正在提交跟进内容
    this.lastCustomerId = '';//用于下拉加载的客户的id
    this.listenScrollBottom = true;//
    this.sorter = {
        field: 'id',
        order: 'descend'
    };//客户列表排序
    this.salesMan = '';//普通销售：userId，非普通销售（销售领导及运营人员）：userId&&teamId
    this.salesManNames = '';//普通销售：userName，非普通销售(销售领导及运营人员)：userName(teamName)
    this.unSelectDataTip = '';//未选择数据就保存的提示信息
    this.distributeLoading = false;//线索客户正在分配给某个销售
    this.distributeErrMsg = '';//线索客户分配失败
};
//查询线索客户
ClueCustomerStore.prototype.getClueCustomerList = function(clueCustomers) {
    if (clueCustomers.loading) {
        this.isLoading = true;
        this.clueCustomerErrMsg = '';
    } else if (clueCustomers.error) {
        this.isLoading = false;
        this.clueCustomerErrMsg = clueCustomers.errorMsg;
    } else {
        let data = clueCustomers.clueCustomerObj;
        let list = data ? data.result : [];
        if (this.lastCustomerId) {
            this.curCustomers = this.curCustomers.concat(this.processForList(list));
        } else {
            this.curCustomers = this.processForList(list);
        }
        this.lastCustomerId = this.curCustomers.length ? _.last(this.curCustomers).id : '';
        this.customersSize = data ? data.total : 0;
        this.listenScrollBottom = this.customersSize > this.curCustomers.length;
        this.isLoading = false;
        //跟据线索客户不同的状态进行排序
        this.curCustomers = _.sortBy(this.curCustomers, (item) => {
            return item.status;
        });
        //刷新当前右侧面板中打开的客户的数据
        if (this.currentId) {
            this.setCurrentCustomer(this.currentId);
        }
    }
};
//更新线索客户的一些属性
ClueCustomerStore.prototype.updateClueProperty = function(updateObj) {
    var updateClue = _.find(this.curCustomers, clue => updateObj.id === clue.id);
    if (updateClue){
        updateClue.availability = updateObj.availability;
    }
};
//标记线索为无效线索后，线索状态变成已跟进，在页面上不展示该条数据
ClueCustomerStore.prototype.removeClueItem = function(updateObj) {
    this.curCustomers = _.filter(this.curCustomers, clue => updateObj.id !== clue.id);
};
//添加或更新跟进内容
ClueCustomerStore.prototype.addCluecustomerTrace = function(result) {
    if (result.loading) {
        this.submitTraceLoading = true;
        this.submitTraceErrMsg = '';
    } else if (result.error) {
        this.submitTraceLoading = false;
        this.submitTraceErrMsg = result.errorMsg;
    } else {
        this.submitTraceLoading = false;
        this.submitTraceErrMsg = '';
    }
};
function getContactWay(contactPhone) {
    var contact_way = '';
    if (_.isArray(contactPhone)) {
        contactPhone.forEach(function(phone) {
            if (phone) {
                contact_way += addHyphenToPhoneNumber(phone) + '\n';
            }
        });
    }
    return contact_way;
}
ClueCustomerStore.prototype.processForList = function(curCustomers) {
    if (!_.isArray(curCustomers)) return [];
    var list = _.clone(curCustomers);
    _.map(list, (curCustomer) => {
        if (_.isArray(curCustomer.contacts)) {
            for (var j = 0; j < curCustomer.contacts.length; j++) {
                var contact = curCustomer.contacts[j];
                if (contact.def_contancts === 'true') {
                    curCustomer.contact = contact.name;
                    curCustomer.contact_way = getContactWay(contact.phone);
                }
            }
        }
    });
    return list;
};

//设置开始和结束时间
ClueCustomerStore.prototype.setTimeRange = function(timeRange) {
    this.rangParams[0].from = timeRange.start_time;
    this.rangParams[0].to = timeRange.end_time;
};
//设置筛选线索客户的类型
ClueCustomerStore.prototype.setFilterType = function(value) {
    this.clueCustomerTypeFilter.status = value;
};
//线索客户分配给销售
ClueCustomerStore.prototype.distributeCluecustomerToSale = function(result) {
    if (result.loading) {
        this.distributeLoading = true;
        this.distributeErrMsg = '';
    } else if (result.error) {
        this.distributeLoading = false;
        this.distributeErrMsg = result.errorMsg;
    } else {
        this.distributeLoading = false;
        this.distributeErrMsg = '';
    }
};
//查看某个线索的详情，关闭某个线索时，需要把这两个字段置空
ClueCustomerStore.prototype.setCurrentCustomer = function(id) {
    if (id){
        this.currentId = id;
        this.curCustomer = _.find(this.curCustomers, customer => {
            return customer.id === id;
        });
    }else{
        this.currentId = '';
        this.curCustomer = {};
    }

};
//添加完销售线索后的处理
ClueCustomerStore.prototype.afterAddSalesClue = function(newCustomer) {
    var newArr = this.processForList([newCustomer]);
    newCustomer = newArr[0];
    this.curCustomers = _.filter(this.curCustomers, customer => customer.id !== newCustomer.id);
    //只有筛选状态是待分配，并且筛选时间是今天的时候，才把这个新增客户加到列表中
    if ((this.clueCustomerTypeFilter.status === '0' || this.clueCustomerTypeFilter.status === '') && this.rangParams[0].from <= newCustomer.start_time && newCustomer.start_time <= this.rangParams[0].to){
        this.curCustomers.unshift(newCustomer);
        this.customersSize++;
    }
    //新添加的是正在展示的那条日程
    this.curCustomer = newCustomer;
    this.currentId = newCustomer.id;
};
//用于设置下拉加载的最后一个客户的id
ClueCustomerStore.prototype.setLastCustomerId = function(id) {
    this.lastCustomerId = id;
};

ClueCustomerStore.prototype.setSalesMan = function(salesObj) {
    this.salesMan = salesObj.salesMan;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};
ClueCustomerStore.prototype.setSalesManName = function(salesObj) {
    this.salesManNames = salesObj.salesManNames;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};
//未选销售的提示
ClueCustomerStore.prototype.setUnSelectDataTip = function(tip) {
    this.unSelectDataTip = tip;
};
//修改信息完成后
ClueCustomerStore.prototype.afterEditCustomerDetail = function(newCustomerDetail) {
    //修改客户相关的属性，直接传属性和客户的id
    //如果修改联系人相关的属性，还要把联系人的id传过去
    var customerProperty = ['access_channel', 'clue_source','clue_classify','source', 'user_id', 'user_name', 'sales_team', 'sales_team_id','name','availability'];
    for (var key in newCustomerDetail) {
        if (_.indexOf(customerProperty, key) > -1) {
            //修改客户的相关属性
            this.curCustomer[key] = newCustomerDetail[key];
        } else {
            //修改联系人的相关属性
            if (key === 'contact_name') {
                this.curCustomer.contacts[0].name = newCustomerDetail[key];
                this.curCustomer.contact = newCustomerDetail[key];
            } else {
                this.curCustomer.contacts[0][key][0] = newCustomerDetail[key];
                if (key === 'phone'){
                    this.curCustomer.contact_way = newCustomerDetail[key];
                }
            }
        }
    }
};
ClueCustomerStore.prototype.getSalesManList = function(list) {
    list = _.isArray(list) ? list : [];
    //客户所属销售下拉列表，过滤掉停用的成员
    this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
};
module.exports = alt.createStore(ClueCustomerStore, 'ClueCustomerStore');
