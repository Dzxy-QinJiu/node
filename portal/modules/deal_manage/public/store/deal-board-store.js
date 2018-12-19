/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import dealBoardAction from '../action/deal-board-action';

function dealBoardStore() {
    this.setInitData();
    this.bindActions(dealBoardAction);
}
//设置初始值
dealBoardStore.prototype.setInitData = function() {
    //是否正在获取阶段列表的标识
    this.isLoadingStage = true;
    //阶段列表
    this.stageList = [];
    //各阶段数据对象组成的map{stageName:{isLoading: false, errorMsg: '', list: [], total: 0, lastId: '',listenScrollBottom: true}}
    this.stageDealMap = {};
    //正在保存拖动后的数据
    this.isSavingDragData = false;
};
//设置是否正在保存拖拽的数据
dealBoardStore.prototype.setIsSavingDragData = function(flag) {
    this.isSavingDragData = flag;
};

dealBoardStore.prototype.getStageList = function(resultObj) {
    if (resultObj.isLoadingStage) {
        this.isLoadingStage = true;
    } else {
        this.stageList = resultObj.stageList;
        this.isLoadingStage = false;
        _.each(this.stageList, stage => {
            if (stage.name) {
                this.stageDealMap[stage.name] = getInitStageDealObj(stage.name);
            }
        });
    }
};

//设置各阶段订单数据的初始值
dealBoardStore.prototype.setInitStageDealData = function() {
    _.each(this.stageList, stage => {
        if (stage.name) {
            this.stageDealMap[stage.name] = getInitStageDealObj(stage.name);
        }
    });
};
function getInitStageDealObj(stage) {
    return {
        stage,
        isLoading: true,
        errorMsg: '',
        list: [],
        total: 0,
        lastId: '',//用来处理下拉加载的id
        listenScrollBottom: true,//是否监听下拉加载
    };
}
//获取订单列表
dealBoardStore.prototype.getStageDealList = function(resultObj) {
    let curStageDealObj = this.stageDealMap[resultObj.stage] || getInitStageDealObj(resultObj.stage);
    if (resultObj.loading) {
        curStageDealObj.isLoading = true;
        curStageDealObj.errorMsg = '';
    } else if (resultObj.errorMsg) {
        curStageDealObj.isLoading = false;
        curStageDealObj.errorMsg = resultObj.errorMsg;
    } else {
        curStageDealObj.isLoading = false;
        curStageDealObj.errorMsg = '';
        let dealList = _.get(resultObj, 'data.result', []);
        //过滤掉没有id的交易，以防影响界面操作（下拉加载、拖动）
        dealList = _.filter(dealList, deal => deal.id);
        if (curStageDealObj.lastId) {
            curStageDealObj.list = curStageDealObj.list.concat(dealList);
        } else {
            curStageDealObj.list = dealList;
        }
        curStageDealObj.total = _.get(resultObj, 'data.total', 0);
        let curListLength = _.get(curStageDealObj, 'list.length');
        curStageDealObj.lastId = _.get(curStageDealObj, `list[${curListLength - 1}].id`, '');
        if (curListLength >= curStageDealObj.total) {
            curStageDealObj.listenScrollBottom = false;
        }
    }
    this.stageDealMap[resultObj.stage] = curStageDealObj;
};

//拖动订单结束后的处理
dealBoardStore.prototype.dragDealEnd = function(dragResult) {
    const {source, destination, draggableId} = dragResult;
    //拖动源列的数据对象
    let sourceStageObj = this.stageDealMap[source.droppableId];
    //拖动的交易数据
    let dragDeal = _.find(sourceStageObj.list, deal => deal.id === draggableId);
    //赢单、丢单的处理
    if (destination.droppableId === 'win' || destination.droppableId === 'lose') {
        dragDeal.oppo_status = draggableId;
        delete dragDeal.sale_stages;
        delete dragDeal.sale_stages_num;
    }
    //交易插入的位置
    let dropIndex = destination.index;
    //插入列的数据对象
    let dropStageObj = this.stageDealMap[destination.droppableId];
    //插入拖动的交易
    if (_.get(dropStageObj, 'list[0]')) {
        dropStageObj.list.splice(dropIndex, 0, dragDeal);
    } else {
        dropStageObj.list = [dragDeal];
    }

    //移除源列的交易数据
    sourceStageObj.list = _.filter(sourceStageObj.list, deal => deal.id !== draggableId);
};


dealBoardStore.prototype.setLastDealId = function(id) {
    this.dealListObj.lastId = id;
};

//删除订单成功后，删除列表中对应的订单
dealBoardStore.prototype.afterDeleteDeal = function(dealId) {
    //过滤掉删除的订单
    this.dealListObj.list = _.filter(this.dealListObj.list, deal => deal.id !== dealId);
    this.dealListObj.total -= 1;
};

//修改订单成功后，更新列表中对应的内容（newDeal:修改了哪些属性，传哪些属性和订单id）
dealBoardStore.prototype.updateDeal = function(newDeal) {
    let editDeal = _.find(this.dealListObj.list, deal => deal.id === newDeal.id);
    if (editDeal) {
        _.each(newDeal, (value, key) => {
            editDeal[key] = value;
            if (key === 'oppo_status') {
                editDeal.sale_stages = value;
            }
        });
    }
};
//添加完订单后的处理
dealBoardStore.prototype.afterAddDeal = function(newDeal) {
    let stageDealObj = newDeal.sale_stages ? this.stageDealMap[newDeal.sale_stages] : {};
    if (_.isObject(stageDealObj) && _.isArray(stageDealObj.list)) {
        this.stageDealMap[newDeal.sale_stages].list.unshift(newDeal);
    }
};

export default alt.createStore(dealBoardStore, 'dealBoardStore');
