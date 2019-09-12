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
    //各阶段数据对象组成的map{stageName:{isLoading: false, errorMsg: '', list: [], total: 0, pageNum: 1, listenScrollBottom: true}}
    this.stageDealMap = {};
    //正在保存拖动后的数据
    this.isSavingDragData = false;
};
//设置是否正在保存拖拽的数据
dealBoardStore.prototype.setIsSavingDragData = function(flag) {
    this.isSavingDragData = flag;
};
//各阶段总预算的获取
dealBoardStore.prototype.getStageTotalBudget = function(totalBudgetList) {
    if (_.isArray(totalBudgetList)) {
        _.each(totalBudgetList, item => {
            if (item.name) {
                this.stageDealMap[item.name].totalBudget = item.budget;
            }
        });
    }
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
        pageNum: 1,//用来翻页的页数
        listenScrollBottom: true,//是否监听下拉加载
        totalBudget: 0//总预算
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
        if (curStageDealObj.pageNum === 1) {
            curStageDealObj.list = dealList;
        } else {
            curStageDealObj.list = curStageDealObj.list.concat(dealList);
            //去重,以防新增了订单(或修改订单阶段)后,前端已加入list中,下拉后取到的数据里会有新加的订单,此时会重复
            curStageDealObj.list = _.uniqBy(curStageDealObj.list, 'id');
        }
        curStageDealObj.total = _.get(resultObj, 'data.total', 0);
        let curListLength = _.get(curStageDealObj, 'list.length');
        if (curListLength >= curStageDealObj.total) {
            curStageDealObj.listenScrollBottom = false;
        }
        if(_.get(dealList,'[0]')){
            curStageDealObj.pageNum++;
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
        dragDeal.oppo_status = destination.droppableId;
        delete dragDeal.sale_stages;
        delete dragDeal.sale_stages_num;
    }else{
        dragDeal.sale_stages = destination.droppableId;
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


dealBoardStore.prototype.setPageNum = function(num) {
    this.dealListObj.pageNum = num;
};

//删除订单成功后，删除列表中对应的订单
dealBoardStore.prototype.afterDeleteDeal = function(deal) {
    //过滤掉删除的订单
    let stageDealObj = deal.sale_stages ? this.stageDealMap[deal.sale_stages] : {};
    if (_.isObject(stageDealObj) && _.isArray(stageDealObj.list)) {
        this.stageDealMap[deal.sale_stages].list = _.filter(stageDealObj.list, item => item.id !== deal.id);
        this.stageDealMap[deal.sale_stages].total--;
    }
};

//修改订单成功后，更新列表中对应的内容（newDeal:修改了哪些属性，传哪些属性和订单id）
dealBoardStore.prototype.updateDeal = function(newDeal) {
    let stageDealObj = {};
    //丢单原因的修改
    if (newDeal.property === 'lose_reson') {
        stageDealObj = this.stageDealMap.lose || {};
    } else {//订单的预算、备注、应用、预计成交的修改
        stageDealObj = newDeal.sale_stages ? this.stageDealMap[newDeal.sale_stages] : {};
    }
    if (_.isObject(stageDealObj) && _.isArray(stageDealObj.list)) {
        let editDeal = _.find(stageDealObj.list, deal => deal.id === newDeal.id);
        if (editDeal) {
            editDeal[newDeal.property] = newDeal[newDeal.property];
        }
    }
};

//关闭订单后的处理
dealBoardStore.prototype.afterCloseDeal = function(newDeal) {
    let stageDealObj = newDeal.sale_stages ? this.stageDealMap[newDeal.sale_stages] : {};
    if (_.isObject(stageDealObj) && _.isArray(stageDealObj.list)) {
        let editDeal = _.find(stageDealObj.list, deal => deal.id === newDeal.id);
        if (editDeal) {
            editDeal.oppo_status = newDeal.oppo_status;//win/lose
            if (newDeal.oppo_status === 'lose') {//丢单的话，丢单原因的修改
                editDeal.lose_reason = newDeal.lose_reason;
            }
            delete editDeal.sale_stages;
        }
        //将关闭的订单加入到对应的赢单/丢单列表中
        this.stageDealMap[newDeal.oppo_status].list.unshift(editDeal);
        this.stageDealMap[newDeal.oppo_status].total++;
        //从原阶段列表中过滤掉
        stageDealObj.list = _.filter(stageDealObj.list, deal => deal.id !== newDeal.id);
        stageDealObj.total--;
    }
};

//修改订单阶段
dealBoardStore.prototype.afterEditDealStage = function(newDeal) {
    //根据修改前的订单阶段，找到订单所在原阶段列
    let oldStageDealObj = newDeal.old_stages ? this.stageDealMap[newDeal.old_stages] : {};
    if (_.isObject(oldStageDealObj) && _.isArray(oldStageDealObj.list)) {
        let editDeal = _.find(oldStageDealObj.list, deal => deal.id === newDeal.id);
        if (editDeal) {
            editDeal.sale_stages = newDeal.sale_stages;
            //根据修改后的订单阶段,找到订单所在新阶段列
            let stageDealObj = newDeal.sale_stages ? this.stageDealMap[newDeal.sale_stages] : {};
            //将修改后的订单加入到修改订单阶段后所在列表中
            if (_.isObject(stageDealObj) && _.isArray(stageDealObj.list)) {
                stageDealObj.list.unshift(editDeal);
                stageDealObj.total++;
            }
            //从原阶段列表中过滤掉
            oldStageDealObj.list = _.filter(oldStageDealObj.list, deal => deal.id !== newDeal.id);
            oldStageDealObj.total--;
        }
    }
};
//添加完订单后的处理
dealBoardStore.prototype.afterAddDeal = function(newDeal) {
    let stageDealObj = newDeal.sale_stages ? this.stageDealMap[newDeal.sale_stages] : {};
    if (_.isObject(stageDealObj) && _.isArray(stageDealObj.list)) {
        this.stageDealMap[newDeal.sale_stages].list.unshift(newDeal);
        this.stageDealMap[newDeal.sale_stages].total++;
    }
};

export default alt.createStore(dealBoardStore, 'dealBoardStore');
