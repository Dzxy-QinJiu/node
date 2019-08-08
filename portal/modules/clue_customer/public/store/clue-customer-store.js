/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var ClueCustomerAction = require('../action/clue-customer-action');
let clueFilterAction = require('../action/filter-action');
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import {
    SELECT_TYPE,
    getClueStatusValue,
    deleteEmptyProperty,
    AVALIBILITYSTATUS
} from '../utils/clue-customer-utils';
var clueFilterStore = require('./clue-filter-store');
var user = require('../../../../public/sources/user-data').getUserData();
const clueContactType = ['phone', 'qq', 'weChat', 'email'];
function ClueCustomerStore() {
    //初始化state数据
    this.resetState();
    this.bindActions(ClueCustomerAction);
}
ClueCustomerStore.prototype.resetState = function() {
    this.salesManList = [];//销售列表
    this.listenScrollBottom = true;//是否监测下拉加载
    this.curClueLists = [];//查询到的线索列表
    this.pageSize = 20; //一页可显示的客户的个数
    this.isLoading = true;//加载线索客户列表数据中。。。
    this.clueCustomerErrMsg = '';//获取线索客户列表失败
    this.customersSize = 0;//线索客户列表的数量
    this.currentId = '';//当前展示的线索的id
    this.curClue = {}; //当前展示的线索详情
    this.submitTraceErrMsg = '';//提交跟进内容报错的情况
    this.submitTraceLoading = false;//正在提交跟进内容
    this.lastCustomerId = '';//用于下拉加载的客户的id
    this.listenScrollBottom = true;//
    this.sorter = {
        field: 'source_time',
        order: 'descend'
    };//客户列表排序
    this.salesMan = '';//普通销售：userId，非普通销售（销售领导及运营人员）：userId&&teamId
    this.salesManNames = '';//普通销售：userName，非普通销售(销售领导及运营人员)：userName(teamName)
    this.unSelectDataTip = '';//未选择数据就保存的提示信息
    this.distributeLoading = false;//线索客户正在分配给某个销售
    this.distributeErrMsg = '';//线索客户分配失败
    this.distributeBatchLoading = false;
    this.distributeBatchErrMsg = '';
    this.keyword = '';//线索全文搜索的关键字
    this.agg_list = {};//线索统计数据
    this.showFilterList = false;//是否展示线索筛选区域
    this.firstLogin = true;//用来记录是否是首次加载
    this.queryObj = {};//用来记录搜索条件
    this.settedCustomerRecommend = {
        loading: true,
        obj: {}
    };
    //所有线索的数量
    this.allClueCount = 0;
    //推荐线索的列表及相关状态
    this.isLoadingRecommendClue = true;
    this.getRecommendClueErrMsg = '';
    this.recommendClueLists = [];
};
ClueCustomerStore.prototype.getRecommendClueLists = function(result) {
    if (result.loading) {
        this.isLoadingRecommendClue = true;
        this.getRecommendClueErrMsg = '';
    } else if (result.error) {
        this.isLoadingRecommendClue = false;
        this.getRecommendClueErrMsg = result.errorMsg;
    } else {
        this.isLoadingRecommendClue = false;
        this.getRecommendClueErrMsg = '';
        this.recommendClueLists = result.list;
    }
};
//保存查询条件
ClueCustomerStore.prototype.saveSettingCustomerRecomment = function(result) {
    deleteEmptyProperty(result);
    this.settedCustomerRecommend.obj = result;
};
ClueCustomerStore.prototype.getSettingCustomerRecomment = function(result){
    var data = _.get(result,'list.[0]');
    if (data){
        deleteEmptyProperty(data);
        this.settedCustomerRecommend = {
            loading: false,
            obj: data
        };
    }else{
        this.settedCustomerRecommend.loading = false;
    }
};
ClueCustomerStore.prototype.changeFilterFlag = function(filterFlag) {
    this.showFilterList = filterFlag;
};
ClueCustomerStore.prototype.setClueInitialData = function() {
    this.curClueLists = [];//查询到的线索列表
    this.customersSize = 0;
    this.lastCustomerId = '';
    this.isLoading = true;
    this.listenScrollBottom = true;
};
ClueCustomerStore.prototype.setLastClueId = function(updateId) {
    this.lastCustomerId = updateId;
};
ClueCustomerStore.prototype.setSortField = function(updateSortField) {
    this.sorter.field = updateSortField;
};
ClueCustomerStore.prototype.updateCurrentClueRemark = function(submitObj) {
    let clue = _.find(this.curClueLists, (clue) => {
        return clue.id === submitObj.lead_id;
    });
    if (clue && _.isArray(clue.clue_traces) && clue.customer_traces.length) {
        clue.customer_traces[0].remark = submitObj.remark;
    }
},
ClueCustomerStore.prototype.handleClueData = function(clueData) {
    if (clueData.loading) {
        this.isLoading = true;
        this.clueCustomerErrMsg = '';
    } else if (clueData.error) {
        this.isLoading = false;
        this.clueCustomerErrMsg = clueData.errorMsg;
    } else {
        let data = clueData.clueCustomerObj;
        let list = data ? data.result : [];
        if (this.lastCustomerId) {
            this.curClueLists = this.curClueLists.concat(this.processForList(list));
        } else {
            this.curClueLists = this.processForList(list);
        }
        this.customersSize = data ? data.total : 0;
        this.listenScrollBottom = this.customersSize > this.curClueLists.length;
        //把线索详情中电话，邮箱，微信，qq里的空值删掉
        _.forEach(this.curClueLists, (clueItem) => {
            if (_.isArray(clueItem.contacts) && clueItem.contacts.length) {
                _.forEach(clueItem.contacts, (contactItem) => {
                    _.forEach(clueContactType, (item) => {
                        if (_.isArray(contactItem[item]) && contactItem[item].length) {
                            contactItem[item] = contactItem[item].filter(item => item);
                        }
                    });
                });

            }
        });
        if (_.isArray(_.get(data, 'agg_list'))) {
            _.forEach(_.get(data, 'agg_list'), item => {
                //如果是选中的无效的线索，前面的统计值不要改，因为选择了无效，统计的status是统计的无效状态下的各种status的数值
                var filterClueAvaliability = clueFilterStore.getState().filterClueAvailability;
                if (_.isArray(_.get(item, 'status')) && filterClueAvaliability === AVALIBILITYSTATUS.AVALIBILITY) {
                    var arr = _.get(item, 'status');
                    var willDistribute = _.find(arr, item => item.name === SELECT_TYPE.WILL_DISTRIBUTE);
                    var willTrace = _.find(arr, item => item.name === SELECT_TYPE.WILL_TRACE);
                    var hasTrace = _.find(arr, item => item.name === SELECT_TYPE.HAS_TRACE);
                    var hasTransfer = _.find(arr, item => item.name === SELECT_TYPE.HAS_TRANSFER);
                    var statusStatics = {
                        'willDistribute': _.get(willDistribute, 'total',0),
                        'willTrace': _.get(willTrace, 'total',0),
                        'hasTrace': _.get(hasTrace, 'total',0),
                        'hasTransfer': _.get(hasTransfer, 'total',0),
                    };
                    this.agg_list = _.assign({},this.agg_list, statusStatics);
                }
                if (_.isArray(_.get(item, 'availability'))) {
                    var arr = _.get(item, 'availability');
                    var invalidClue = _.find(arr, item => item.name === AVALIBILITYSTATUS.INAVALIBILITY);
                    var availabilityObj = {
                        'invalidClue': _.get(invalidClue, 'total',0),
                    };
                    this.agg_list = _.assign(this.agg_list, availabilityObj);
                }
            });
            for (var key in this.agg_list){
                this.allClueCount += this.agg_list[key];
            }
            //需要展示待我处理
            if(_.get(clueData,'clueCustomerObj.filterAllotNoTraced') === 'yes'){
                this.showFilterList = true;
            }
            //需要修改页面选中的状态
            if(_.get(clueData,'clueCustomerObj.setting_status')){
                //因为回调中的方法会修改store中的值，如果不加延时会有Dispatch中不允许Dispacth的错误
                setTimeout(() => {
                    clueFilterAction.setFilterType(_.get(clueData,'clueCustomerObj.setting_status'));
                    //把存下来的搜索条件的值也需要改掉，避免分配线索选全部的时候有问题
                    if (_.get(this, 'queryObj.bodyParam.query')){
                        this.queryObj.bodyParam.query.status = _.get(clueData,'clueCustomerObj.setting_status');
                    }
                    _.isFunction(_.get(clueData, 'callback')) && clueData.callback();
                });

            }else if (_.get(clueData,'clueCustomerObj.setting_avaliability')){
                setTimeout(() => {
                    //设置线索为无效
                    // clueFilterAction.setFilterClueAvailbility();
                    _.isFunction(_.get(clueData, 'callback')) && clueData.callback('avalibility');

                });
            }else if (_.get(clueData,'clueCustomerObj.filterAllotNoTraced') === 'no'){
                //不需要展示待我处理，需要隐藏筛选面板
                this.showFilterList = false;
                //因为回调中的方法会修改store中的值，如果不加延时会有Dispatch中不允许Dispacth的错误
                setTimeout(() => {
                    _.isFunction(_.get(clueData, 'callback')) && clueData.callback('filterAllotNoTraced');
                });
            }else{
                this.isLoading = false;
                this.lastCustomerId = _.last(this.curClueLists) ? _.last(this.curClueLists).id : '';
                this.firstLogin = false;
            }
        }else{
            this.isLoading = false;
            this.lastCustomerId = _.last(this.curClueLists) ? _.last(this.curClueLists).id : '';
            this.firstLogin = false;
        }
    }
},
ClueCustomerStore.prototype.setLoadingFalse = function() {
    this.isLoading = false;
    this.lastCustomerId = _.last(this.curClueLists) ? _.last(this.curClueLists).id : '';
    this.firstLogin = false;
},
ClueCustomerStore.prototype.getClueFulltextSelfHandle = function(clueData) {
    this.handleClueData(clueData);
},
ClueCustomerStore.prototype.updateRecommendClueLists = function(extractClues) {
    this.recommendClueLists = _.filter(this.recommendClueLists, item => item.id !== extractClues);

};    
//全文查询线索
ClueCustomerStore.prototype.getClueFulltext = function(clueData) {
    this.handleClueData(clueData);
};
//更新线索客户的一些属性
ClueCustomerStore.prototype.updateClueProperty = function(updateObj) {
    var updateClue = _.find(this.curClueLists, clue => updateObj.id === clue.id);
    if (updateClue) {
        updateClue.availability = updateObj.availability;
        if (updateObj.availability) {
            updateClue.availability = updateObj.availability;
        }
        if (updateObj.status) {
            updateClue.status = updateObj.status;
        }
        if (updateObj.customer_traces) {
            updateClue.customer_traces = updateObj.customer_traces;
        }
    }
};
//标记线索为无效线索后，线索状态变成已跟进，在页面上不展示该条数据
ClueCustomerStore.prototype.removeClueItem = function(updateObj) {
    this.curClueLists = _.filter(this.curClueLists, clue => updateObj.id !== clue.id);
};
//关联客户改变后，把列表中关联的客户信息也修改了
//标记线索为无效线索后，线索状态变成已跟进，在页面上不展示该条数据
ClueCustomerStore.prototype.afterModifiedAssocaitedCustomer = function(updateClue) {
    var targetIndex = _.findIndex(this.curClueLists, clue => updateClue.id === clue.id);
    this.curClueLists[targetIndex] = updateClue;
    if (this.curClue.id === updateClue.id) {
        this.curClue = updateClue;
    }
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
ClueCustomerStore.prototype.processForList = function(curClueLists) {
    if (!_.isArray(curClueLists)) return [];
    var list = _.clone(curClueLists);
    _.map(list, (curClue) => {
        if (_.isArray(curClue.contacts)) {
            for (var j = 0; j < curClue.contacts.length; j++) {
                var contact = curClue.contacts[j];
                if (contact.def_contancts === 'true') {
                    curClue.contact = contact.name;
                    curClue.contact_way = getContactWay(contact.phone);
                }
            }
        }
    });
    return list;
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
ClueCustomerStore.prototype.distributeCluecustomerToSaleBatch = function(result) {
    if (result.loading) {
        this.distributeBatchLoading = true;
        this.distributeBatchErrMsg = '';
    } else if (result.error) {
        this.distributeBatchLoading = false;
        this.distributeBatchErrMsg = result.errorMsg;
    } else {
        this.distributeBatchLoading = false;
        this.distributeBatchErrMsg = '';
    }
};

//查看某个线索的详情，关闭某个线索时，需要把这两个字段置空
ClueCustomerStore.prototype.setCurrentCustomer = function(id) {
    if (id) {
        this.currentId = id;
        this.curClue = _.find(this.curClueLists, customer => {
            return customer.id === id;
        });
    } else {
        this.currentId = '';
        this.curClue = {};
    }
};
//添加完销售线索后的处理
ClueCustomerStore.prototype.afterAddSalesClue = function(updateObj) {
    var newCustomer = updateObj.newCustomer;
    var newArr = this.processForList([newCustomer]);
    newCustomer = newArr[0];
    this.curClueLists = _.filter(this.curClueLists, customer => customer.id !== newCustomer.id);
    var filterClueStatus = clueFilterStore.getState().filterClueStatus;
    var typeFilter = getClueStatusValue(filterClueStatus);
    //只有筛选状态是待分配 或者 没有选分配状态的时候，并且筛选时间是今天的时候，才把这个新增客户加到列表中
    if (filterClueStatus && typeFilter) {
        if (((typeFilter.status === '0')) && clueFilterStore.getState().rangeParams[0].from <= newCustomer.start_time && newCustomer.start_time <= clueFilterStore.getState().rangeParams[0].to) {
            this.curClueLists.unshift(newCustomer);
            this.customersSize++;

        }
    }
    //把统计数字也更新一下
    var count = this.agg_list['willDistribute'] || 0;
    this.agg_list['willDistribute'] = count + 1;
    if (updateObj.showDetail) {
        //新添加的是正在展示的那条线索
        this.curClue = newCustomer;
        this.currentId = newCustomer.id;
    }

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
    var customerProperty = ['access_channel', 'clue_source', 'clue_classify', 'source', 'user_id', 'user_name', 'sales_team', 'sales_team_id', 'name', 'availability', 'source_time', 'status','customer_name','customer_id'];
    var contact_id = newCustomerDetail.contact_id || '';
    if (newCustomerDetail.contact_id) {
        delete newCustomerDetail.contact_id;
    }
    for (var key in newCustomerDetail) {
        if (_.indexOf(customerProperty, key) > -1) {
            //修改客户的相关属性
            this.curClue[key] = newCustomerDetail[key];
        } else {
            //修改联系人的相关属性
            if (key === 'contact_name' && contact_id) {
                var target = _.find(this.curClue.contacts, item => item.id === contact_id);
                //联系人是多个
                target.name = newCustomerDetail[key];
                this.curClue.contact = newCustomerDetail[key];
            } else if (contact_id) {
                var target = _.find(this.curClue.contacts, item => item.id === contact_id);
                //因为newCustomerDetail中有个属性id是表示的线索的id，所以在遍历属性的时候不要修改这个id，这样会把联系人的id改成线索的id
                if (target && key !== 'id') {
                    var submitValue = newCustomerDetail[key];
                    if (_.isArray(submitValue)) {
                        submitValue = _.filter(submitValue, item => item);
                    }
                    target[key] = submitValue;
                }
            }
        }
    }
};
//如果原来的筛选条件是在待跟进的时候，要添加完跟进记录后，该类型的线索要删除添加跟进记录的这个线索
ClueCustomerStore.prototype.afterAddClueTrace = function(item) {
    //添加跟进内容后，线索状态都变成已跟进
    var updateId = item.id, clueStatus = item.status;
    if (clueStatus !== SELECT_TYPE.HAS_TRACE){
        if (_.get(this, 'curClue.id') === item.id){
            this.curClue.status = SELECT_TYPE.HAS_TRACE;
        }
        this.agg_list['hasTrace'] = this.agg_list['hasTrace'] + 1;
        if (clueStatus === SELECT_TYPE.WILL_DISTRIBUTE){
            this.agg_list['willDistribute'] = this.agg_list['willDistribute'] - 1;
        }else if (clueStatus === SELECT_TYPE.WILL_TRACE){
            this.agg_list['willTrace'] = this.agg_list['willTrace'] - 1;
        }
        this.curClueLists = _.filter(this.curClueLists, clue => updateId !== clue.id);
        this.customersSize--;
    }
};
//分配销售之后
ClueCustomerStore.prototype.afterAssignSales = function(updateItemId) {
    //这个updateItemId可能是一个id，也可能是多个id
    var clueIds = updateItemId.split(',');
    //如果当前展示的这个线索详情的id在clueIds中，需要修改线索的状态
    if (clueIds.indexOf(_.get(this,'curClue.id')) > -1 && _.get(this,'curClue.status') === SELECT_TYPE.WILL_DISTRIBUTE){
        this.curClue.status = SELECT_TYPE.WILL_TRACE;
    }
    //如果是待分配状态，分配完之后要在列表中删除一个
    this.curClueLists = _.filter(this.curClueLists, clue => {
        if (_.indexOf(clueIds, clue.id) !== -1) {
            this.customersSize--;
            this.agg_list['willDistribute'] = this.agg_list['willDistribute'] - 1;
            //待跟进的需要加一
            this.agg_list['willTrace'] = this.agg_list['willTrace'] + 1;
        }
        return _.indexOf(clueIds, clue.id) === -1;
    });
};
ClueCustomerStore.prototype.getSalesManList = function(list) {
    list = _.isArray(list) ? list : [];
    //客户所属销售下拉列表，过滤掉停用的成员
    this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
};
ClueCustomerStore.prototype.setKeyWord = function(keyword) {
    this.keyword = keyword;
};
//删除某个线索
ClueCustomerStore.prototype.deleteClueById = function(data) {
    var clueId = data.customer_clue_ids || data.id;
    var clueStatus = data.clueStatus || data.status;
    this.curClueLists = _.filter(this.curClueLists, clue => clueId !== clue.id);
    this.customersSize--;
    //删除线索后，更新线索的统计值
    if (data.availability === AVALIBILITYSTATUS.INAVALIBILITY){
        this.agg_list['invalidClue'] = this.agg_list['invalidClue'] - 1;
    }else if (clueStatus === SELECT_TYPE.WILL_DISTRIBUTE){
        this.agg_list['willDistribute'] = this.agg_list['willDistribute'] - 1;
    }else if (clueStatus === SELECT_TYPE.WILL_TRACE){
        this.agg_list['willTrace'] = this.agg_list['willTrace'] - 1;
    }else if (clueStatus === SELECT_TYPE.HAS_TRACE){
        this.agg_list['hasTrace'] = this.agg_list['hasTrace'] - 1;
    }else if (clueStatus === SELECT_TYPE.HAS_TRANSFER){
        this.agg_list['hasTransfer'] = this.agg_list['hasTransfer'] - 1;
    }
};
ClueCustomerStore.prototype.addInvalidClueNum = function() {
    this.agg_list['invalidClue'] = this.agg_list['invalidClue'] + 1;
};
//转化客户成功后的处理
ClueCustomerStore.prototype.afterTranferClueSuccess = function(data) {
    var clueStatus = data.status;
    this.customersSize--;
    //删除线索后，更新线索的统计值
    if (clueStatus === SELECT_TYPE.WILL_TRACE){
        this.agg_list['willTrace'] = this.agg_list['willTrace'] - 1;
        this.agg_list['hasTransfer'] = this.agg_list['hasTransfer'] + 1;
    }else if (clueStatus === SELECT_TYPE.HAS_TRACE){
        this.agg_list['hasTrace'] = this.agg_list['hasTrace'] - 1;
        this.agg_list['hasTransfer'] = this.agg_list['hasTransfer'] + 1;
    }

};
//更新线索列表
ClueCustomerStore.prototype.updateClueCustomers = function(data) {
    this.curClueLists = data;
};
ClueCustomerStore.prototype.saveQueryObj = function(data) {
    this.queryObj = data;
};
//添加跟进记录时，修改客户最新的跟进记录时，更新列表中的最后联系
ClueCustomerStore.prototype.updateCustomerLastContact = function(traceObj) {
    if (_.get(traceObj, 'lead_id')) {
        let updateTraceCustomer = _.find(this.curClueLists, curClue => curClue.id === traceObj.lead_id);
        if (updateTraceCustomer) {
            if (_.get(updateTraceCustomer, 'customer_traces[0]')) {
                updateTraceCustomer.customer_traces[0].remark = traceObj.remark;
                updateTraceCustomer.customer_traces[0].add_time = traceObj.time || moment().valueOf();
                updateTraceCustomer.customer_traces[0].call_date = traceObj.time || moment().valueOf();
            } else {
                updateTraceCustomer.customer_traces = [{remark: traceObj.remark, add_time: traceObj.time || moment().valueOf(), call_date: traceObj.time || moment().valueOf()}];
            }
            if (traceObj.remark) {
                updateTraceCustomer.status = SELECT_TYPE.HAS_TRACE;
            }
        }

    }
};
// 获取所有人员
ClueCustomerStore.prototype.getAllSalesUserList = function(list) {
    this.salesManList = _.isArray(list) ? list : [];
};

module.exports = alt.createStore(ClueCustomerStore, 'ClueCustomerStore');
