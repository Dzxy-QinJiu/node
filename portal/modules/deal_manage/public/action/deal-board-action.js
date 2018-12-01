/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import dealAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
function dealBoardAction() {
    this.generateActions(
        'setInitData',
        //添加订单成功后，将新加的订单加入列表中
        'addOneDeal',
        //修改订单成功后，更新列表中对应的内容
        'updateDeal',
        //删除订单成功后，删除列表中对应的订单
        'afterDeleteDeal',
        //设置下拉加载的lastId
        'setLastDealId',
        //拖动交易结束的处理
        'dragDealEnd',
        //设置是否正在拖动数据
        'setIsSavingDragData'
    );
    this.getStageList = function(callback) {
        this.dispatch({isLoadingStage: true});
        commonDataUtil.getDealStageList(stageList => {
            //加上赢单和丢单
            stageList = _.concat(stageList, [{name: 'win'}, {name: 'lose'}]);
            this.dispatch({isLoadingStage: false, stageList});
            if (callback) callback(stageList);
        });
    };
    //获取各阶段的订单列表
    this.getStageDealList = function(stage, lastDealId) {
        let params = {
            page_size: 20,
            sort_field: 'time',
            sort_order: 'descend'
        };
        let query = {};
        if (lastDealId) {
            query.id = lastDealId;
            query.cursor = true;
        }
        let bodyData = {query: {sale_stages: stage}};

        this.dispatch({loading: true, stage});
        dealAjax.getDealList(params, bodyData, query).then((data) => {
            this.dispatch({loading: false, stage, data: data});
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, (errorMsg) => {
            this.dispatch({loading: false, stage, errorMsg: errorMsg || Intl.get('deal.list.get.failed', '获取订单列表失败')});
        });
    };
}

export default alt.createActions(dealBoardAction);
