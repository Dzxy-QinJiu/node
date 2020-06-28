/**
 * Copyright (c) 2019-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2019-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/23.
 */
var LeadsRecommendAction = require('../action/leads-recommend-action');
import {
    deleteEmptyProperty,
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
function LeadsRecommendStore() {
    //初始化state数据
    this.resetState();
    this.bindActions(LeadsRecommendAction);
}
LeadsRecommendStore.prototype.resetState = function() {
    this.salesManList = [];//销售列表
    this.pageSize = 20; //一页可显示的客户的个数
    this.salesMan = '';//普通销售：userId，非普通销售（销售领导及运营人员）：userId&&teamId
    this.unSelectDataTip = '';//未选择数据就保存的提示信息
    this.keyword = '';//线索全文搜索的关键字
    this.settedCustomerRecommend = {
        loading: true,
        obj: {}
    };
    //推荐线索的列表及相关状态
    this.initialRecommendClues();
};
LeadsRecommendStore.prototype.getRecommendClueLists = function(result) {
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
LeadsRecommendStore.prototype.saveSettingCustomerRecomment = function(result) {
    deleteEmptyProperty(result);
    this.hasExtraRecommendList = false;
    this.saveRecommendClueLists = [];
    this.settedCustomerRecommend.obj = result;
};
LeadsRecommendStore.prototype.getSettingCustomerRecomment = function(result){
    var data = _.get(result,'list.[0]');
    if (data){
        deleteEmptyProperty(data);
        if(data.feature) {
            this.feature = data.feature;
        }
        this.settedCustomerRecommend = {
            loading: false,
            obj: data
        };
    }else{
        this.settedCustomerRecommend.loading = false;
    }
};
LeadsRecommendStore.prototype.updateRecommendClueLists = function(extractClueId) {
    //需要给已经提取成功的加上一个类名，界面相应的加上对应的不能处理的样式
    var targetObj = _.find(this.recommendClueLists, item => item.id === extractClueId);
    if(targetObj){
        targetObj.hasExtracted = true;
    }
    this.selectedRecommendClues = _.filter(this.selectedRecommendClues, item => item.id !== extractClueId);
};
//给已经被其他人提取的线索加一个标识
LeadsRecommendStore.prototype.remarkLeadExtractedByOther = function(extractCluesByOtherLeadId) {
    //需要给已经被别人过的加上一个类名，界面相应的加上对应的不能处理的样式
    var targetObj = _.find(this.recommendClueLists, item => item.id === extractCluesByOtherLeadId);
    if(targetObj){
        targetObj.hasExtractedByOther = true;
    }
    this.selectedRecommendClues = _.filter(this.selectedRecommendClues, item => item.id !== extractCluesByOtherLeadId);
};

LeadsRecommendStore.prototype.setSalesMan = function(salesObj) {
    this.salesMan = salesObj.salesMan;
    //去掉未选销售的提示
    this.unSelectDataTip = '';
};
//未选销售的提示
LeadsRecommendStore.prototype.setUnSelectDataTip = function(tip) {
    this.unSelectDataTip = tip;
};
LeadsRecommendStore.prototype.getSalesManList = function(list) {
    list = _.isArray(list) ? list : [];
    //客户所属销售下拉列表，过滤掉停用的成员
    this.salesManList = _.filter(list, sales => sales && sales.user_info && sales.user_info.status === 1);
};
LeadsRecommendStore.prototype.setKeyWord = function(keyword) {
    this.keyword = keyword;
};
//初始化推荐线索相关的
LeadsRecommendStore.prototype.initialRecommendClues = function() {
    this.isLoadingRecommendClue = true;
    this.getRecommendClueErrMsg = '';
    this.recommendClueLists = [];
    this.hasExtraRecommendList = false;
    this.sortvalues = [];
    this.recommendClueListId = '';
    this.feature = '';
    this.total = 0;
    this.canClickMoreBatch = true;
    this.selectedRecommendClues = [];//选中状态的推荐线索
};
// 获取所有人员
LeadsRecommendStore.prototype.getAllSalesUserList = function(list) {
    this.salesManList = _.isArray(list) ? list : [];
};
//设置pagesize
LeadsRecommendStore.prototype.setPageSize = function(size) {
    this.pageSize = size;
};
//更新选中线索列表
LeadsRecommendStore.prototype.updateSelectedRecommendClues = function(selectedClues) {
    this.selectedRecommendClues = selectedClues;
};
//一次性处理需要更新的线索列表
LeadsRecommendStore.prototype.onceUpdateRecommendClueLists = function(updateClueIds) {
    _.each(updateClueIds, id => {
        //需要给已经提取成功的加上一个类名，界面相应的加上对应的不能处理的样式
        var targetObj = _.find(this.recommendClueLists, item => item.id === id);
        if(targetObj){
            targetObj.hasExtracted = true;
        }
    });
    this.selectedRecommendClues = _.filter(this.selectedRecommendClues, item => !_.includes(updateClueIds, item.id));
};

module.exports = alt.createStore(LeadsRecommendStore, 'LeadsRecommendStore');
