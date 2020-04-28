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
    AVALIBILITYSTATUS,
    clueStatusTabNum,
} from '../utils/clue-customer-utils';
var clueFilterStore = require('./clue-filter-store');
const clueContactType = ['phone', 'qq', 'weChat', 'email'];
import { clueEmitter } from 'PUB_DIR/sources/utils/emitters';
function ClueCustomerStore() {
    //初始化state数据
    this.resetState();
    this.bindActions(ClueCustomerAction);
}
ClueCustomerStore.prototype.resetState = function() {
    this.salesManList = [];//销售列表
    this.curClueList = [];//查询到的线索列表
    this.pageSize = 20; //一页可显示的客户的个数
    //当前页数
    this.pageNum = 1;
    this.isLoading = true;//加载线索客户列表数据中。。。
    this.clueCustomerErrMsg = '';//获取线索客户列表失败
    this.customersSize = 0;//线索客户列表的数量
    this.currentId = '';//当前展示的线索的id
    this.curClue = {}; //当前展示的线索详情
    this.submitTraceErrMsg = '';//提交跟进内容报错的情况
    this.submitTraceLoading = false;//正在提交跟进内容
    this.lead_similarity = '';//是否有相似线索
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
    this.initialRecommendClues();
    this.versionData = {};
};
ClueCustomerStore.prototype.getRecommendClueLists = function(result) {
    if (result.loading) {
        this.isLoadingRecommendClue = true;
        this.getRecommendClueErrMsg = '';
        this.canClickMoreBatch = false;
    } else if (result.error) {
        this.isLoadingRecommendClue = false;
        this.getRecommendClueErrMsg = result.errorMsg;
        this.recommendClueLists = [];
        this.canClickMoreBatch = true;
        this.hasExtraRecommendList = false;
        this.total = 0;
    } else {
        this.isLoadingRecommendClue = false;
        this.getRecommendClueErrMsg = '';
        this.recommendClueLists = _.get(result,'data.list');
        this.recommendClueListId = _.get(result,'data.listId');
        this.total = _.get(result, 'data.total', 0);
        if(_.get(result,'data.total') > 20){
            this.hasExtraRecommendList = true;
            this.sortvalues = _.get(_.last(_.get(result,'data.list')) ,'sortvalues');
        }else{
            this.hasExtraRecommendList = false;
            this.sortvalues = [];
        }
        this.canClickMoreBatch = true;
    }
};
//保存查询条件
ClueCustomerStore.prototype.saveSettingCustomerRecomment = function(result) {
    deleteEmptyProperty(result);
    this.hasExtraRecommendList = false;
    this.saveRecommendClueLists = [];
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
    this.curClueList = [];//查询到的线索列表
    this.customersSize = 0;
    this.isLoading = true;
    this.pageNum = 1;
    this.allClueCount = 0;
    this.agg_list = {};
};
ClueCustomerStore.prototype.setSortField = function(updateSortField) {
    this.sorter.field = updateSortField;
};
//释放线索之后
ClueCustomerStore.prototype.afterReleaseClue = function(clueId) {
    let clue = this.getClueById(clueId);
    if(!_.isEmpty(clue)){
        this.deleteClueById(clue);
    }
};
//通过id查找线索
ClueCustomerStore.prototype.getClueById = function(clueId) {
    return _.find(this.curClueList, clue => _.isEqual(clue.id, clueId));
};
ClueCustomerStore.prototype.updateCurrentClueRemark = function(submitObj) {
    let clue = _.find(this.curClueList, (clue) => {
        return clue.id === submitObj.lead_id;
    });
    if (clue) {
        if (_.isArray(clue.customer_traces) && clue.customer_traces.length){
            clue.customer_traces[0].remark = submitObj.remark;
        }else{
            clue.customer_traces = [{
                remark: submitObj.remark
            }];
        }
    }

},
ClueCustomerStore.prototype.setPageNum = function(pageNum) {
    this.pageNum = pageNum;
};
ClueCustomerStore.prototype.handleClueData = function(clueData) {
    if (clueData.loading) {
        this.isLoading = true;
        this.clueCustomerErrMsg = '';
    } else if (clueData.error) {
        this.isLoading = false;
        this.clueCustomerErrMsg = clueData.errorMsg;
        this.pageNum = 1;
        this.customersSize = 0;
    } else {
        let data = clueData.clueCustomerObj;
        let list = data ? data.result : [];
        this.curClueList = this.processForList(list);
        //如果选中了筛选全部线索，并点击翻页
        if(clueData.isPageChange){
            clueEmitter.emit(clueEmitter.CHECKED_CLUE_LIST, this.curClueList);
        }

        this.customersSize = data ? data.total : 0;
        //把线索详情中电话，邮箱，微信，qq里的空值删掉
        _.forEach(this.curClueList, (clueItem) => {
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
                var filterClueAvaliability = clueFilterStore.getState().filterClueAvailability;
                if (_.isArray(_.get(item, 'status'))) {
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
                this.firstLogin = false;
            }
        }else{
            this.isLoading = false;
            this.firstLogin = false;
        }
    }
},
ClueCustomerStore.prototype.setLoadingFalse = function() {
    this.isLoading = false;
    this.firstLogin = false;
},
ClueCustomerStore.prototype.updateRecommendClueLists = function(extractClues) {
    //需要给已经提取成功的加上一个类名，界面相应的加上对应的不能处理的样式
    var targetObj = _.find(this.recommendClueLists, item => item.id === extractClues);
    if(targetObj){
        targetObj.hasExtracted = true;
    }
};
//给已经被其他人提取的线索加一个标识
ClueCustomerStore.prototype.remarkLeadExtractedByOther = function(extractCluesByOtherLeadId) {
    //需要给已经被别人过的加上一个类名，界面相应的加上对应的不能处理的样式
    var targetObj = _.find(this.recommendClueLists, item => item.id === extractCluesByOtherLeadId);
    if(targetObj){
        targetObj.hasExtractedByOther = true;
    }
};
//全文查询线索
ClueCustomerStore.prototype.getClueFulltext = function(clueData) {
    if(!clueData.loading && !clueData.error){
        this.queryObj = clueData.queryObj;
    }
    this.handleClueData(clueData);
};
//申请试用的数据
ClueCustomerStore.prototype.getApplyTryData = function(result) {
    if(!result.error){
        const applyTryData = _.get(result,'result');
        this.versionData = {
            applyTryCompany: _.get(applyTryData,'company'),
            applyTryTime: _.get(applyTryData,'create_time'),
            applyTryUserScales: _.get(applyTryData,'user_scales'),
            applyTryKind: _.get(applyTryData,'apply_version_info.kind'),
            applyTryName: _.get(applyTryData,'applicant_name')
        };
    }
};
//更新线索客户的一些属性
ClueCustomerStore.prototype.updateClueProperty = function(updateObj) {
    var updateClue = _.find(this.curClueList, clue => updateObj.id === clue.id);
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
    this.curClueList = _.filter(this.curClueList, clue => updateObj.id !== clue.id);
};
//关联客户改变后，把列表中关联的客户信息也修改了
//标记线索为无效线索后，线索状态变成已跟进，在页面上不展示该条数据
ClueCustomerStore.prototype.afterModifiedAssocaitedCustomer = function(updateClue) {
    var targetIndex = _.findIndex(this.curClueList, clue => updateClue.id === clue.id);
    this.curClueList[targetIndex] = updateClue;
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
ClueCustomerStore.prototype.processForList = function(curClueList) {
    if (!_.isArray(curClueList)) return [];
    var list = _.clone(curClueList);
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
        this.curClue = _.find(this.curClueList, customer => {
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
    this.curClueList = _.filter(this.curClueList, customer => customer.id !== newCustomer.id);
    var filterClueStatus = clueFilterStore.getState().filterClueStatus;
    var typeFilter = getClueStatusValue(filterClueStatus);
    //只有筛选状态和新加的筛选状态一样，并且筛选时间是今天的时候，才把这个新增客户加到列表中
    if (filterClueStatus && typeFilter) {
        if (((typeFilter.status === newCustomer.status)) && clueFilterStore.getState().rangeParams[0].from <= newCustomer.start_time && newCustomer.start_time <= clueFilterStore.getState().rangeParams[0].to) {
            this.curClueList.unshift(newCustomer);
            this.customersSize++;
        }
        if(newCustomer.status === SELECT_TYPE.WILL_DISTRIBUTE){
            //把统计数字也更新一下
            var count = this.agg_list['willDistribute'] || 0;
            this.agg_list['willDistribute'] = count + 1;
            //统计总数字也加一下
            this.allClueCount += 1;
        }else if(newCustomer.status === SELECT_TYPE.WILL_TRACE){
            //把统计数字也更新一下
            var count = this.agg_list['willTrace'] || 0;
            this.agg_list['willTrace'] = count + 1;
            //统计总数字也加一下
            this.allClueCount += 1;
        }
    }

    if (updateObj.showDetail) {
        //新添加的是正在展示的那条线索
        this.curClue = newCustomer;
        this.currentId = newCustomer.id;
    }

};
//有新提取或者分配的线索后的提示
ClueCustomerStore.prototype.afterNewExtract = function(newClues){
    var newClues = this.processForList(newClues);
    this.curClueList = _.concat(newClues,this.curClueList);
    var count = this.agg_list['willTrace'] || 0;
    var newClueCount = _.get(newClues,'length',0);
    this.agg_list['willTrace'] = count + newClueCount;
    this.allClueCount += newClueCount;
    this.customersSize += newClueCount;
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
    //修改线索相关的属性，直接传属性和线索的id
    //如果修改联系人相关的属性，还要把联系人的id传过去
    var customerProperty = ['access_channel', 'clue_source', 'source_classify', 'clue_classify', 'source', 'user_id', 'user_name', 'sales_team', 'sales_team_id', 'name', 'availability', 'source_time', 'status','customer_name','customer_id','industry','address'];
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
        //如果是待我处理的线索，不需要在已跟进中加这个数字
        var filterAllotNoTraced = clueFilterStore.getState().filterAllotNoTraced;//待我处理的线索
        if (!filterAllotNoTraced){
            this.agg_list['hasTrace'] = this.agg_list['hasTrace'] + 1;
            this.allClueCount += 1;
        }
        if (clueStatus === SELECT_TYPE.WILL_DISTRIBUTE){
            this.agg_list['willDistribute'] = this.agg_list['willDistribute'] - 1;
            this.allClueCount -= 1;
        }else if (clueStatus === SELECT_TYPE.WILL_TRACE){
            this.agg_list['willTrace'] = this.agg_list['willTrace'] - 1;
            this.allClueCount -= 1;
        }
        this.curClueList = _.filter(this.curClueList, clue => updateId !== clue.id);
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
    this.curClueList = _.filter(this.curClueList, clue => {
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
    this.curClueList = _.filter(this.curClueList, clue => clueId !== clue.id);
    this.customersSize--;
    //删除线索后，更新线索的统计值
    if (data.availability === AVALIBILITYSTATUS.INAVALIBILITY){
        this.agg_list['invalidClue'] = this.agg_list['invalidClue'] - 1;
        //总数要减一
        this.allClueCount -= 1;
    }else if (clueStatus === SELECT_TYPE.WILL_DISTRIBUTE){
        this.agg_list['willDistribute'] = this.agg_list['willDistribute'] - 1;
        this.allClueCount -= 1;
    }else if (clueStatus === SELECT_TYPE.WILL_TRACE){
        this.agg_list['willTrace'] = this.agg_list['willTrace'] - 1;
        this.allClueCount -= 1;
    }else if (clueStatus === SELECT_TYPE.HAS_TRACE){
        this.agg_list['hasTrace'] = this.agg_list['hasTrace'] - 1;
        this.allClueCount -= 1;
    }else if (clueStatus === SELECT_TYPE.HAS_TRANSFER){
        this.agg_list['hasTransfer'] = this.agg_list['hasTransfer'] - 1;
        this.allClueCount -= 1;
    }
};
ClueCustomerStore.prototype.updateClueTabNum = function(type) {
    var targetObj = _.find(clueStatusTabNum, item => item.status === type);
    if (targetObj && targetObj.numName){
        this.agg_list[targetObj.numName] += 1;
        this.allClueCount += 1;
    }
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
    this.curClueList = data;
};
//初始化推荐线索相关的
ClueCustomerStore.prototype.initialRecommendClues = function() {
    this.isLoadingRecommendClue = true;
    this.getRecommendClueErrMsg = '';
    this.recommendClueLists = [];
    this.hasExtraRecommendList = false;
    this.sortvalues = [];
    this.recommendClueListId = '';
    this.feature = '';
    this.total = 0;
};

//添加跟进记录时，修改客户最新的跟进记录时，更新列表中的最后联系
ClueCustomerStore.prototype.updateCustomerLastContact = function(traceObj) {
    if (_.get(traceObj, 'lead_id')) {
        let updateTraceCustomer = _.find(this.curClueList, curClue => curClue.id === traceObj.lead_id);
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
ClueCustomerStore.prototype.updateClueItemAfterAssign = function(updateObj) {
    var item = _.get(updateObj,'item'),submitObj = _.get(updateObj,'submitObj'),isWillDistribute = _.get(updateObj,'isWillDistribute');
    let sale_id = _.get(submitObj,'sale_id',''), team_id = _.get(submitObj,'team_id',''), sale_name = _.get(submitObj,'sale_name',''), team_name = _.get(submitObj,'team_name','');
    if (!isWillDistribute){
        item.user_name = sale_name;
        item.user_id = sale_id;
        item.sales_team = team_name;
        item.sales_team_id = team_id;
        if (item.status !== SELECT_TYPE.HAS_TRACE){
            item.status = SELECT_TYPE.WILL_TRACE;
        }
    }
    this.updateClueCustomers(this.curClueList);
};
//热门选项
ClueCustomerStore.prototype.setHotSource = function(value) {
    this.feature = value;
    this.sortvalues = [];
};

module.exports = alt.createStore(ClueCustomerStore, 'ClueCustomerStore');
