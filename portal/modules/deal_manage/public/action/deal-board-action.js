/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import dealAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import DealFilterStore from '../store/deal-filter';
function dealBoardAction() {
    this.generateActions(
        'setInitData',
        //修改订单成功后，更新列表中对应的内容
        'updateDeal',
        //删除订单成功后，删除列表中对应的订单
        'afterDeleteDeal',
        //设置用于翻页的当前页数
        'setPageNum',
        //拖动交易结束的处理
        'dragDealEnd',
        //设置是否正在拖动数据
        'setIsSavingDragData',
        //设置各阶段订单数据的初始值
        'setInitStageDealData',
        //添加完订单后的处理
        'afterAddDeal',
        //关闭订单后的处理
        'afterCloseDeal',
        //修改订单阶段后的处理
        'afterEditDealStage'
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
    this.getStageDealList = function(stage, searchObj, pageNum, type) {
        let params = {
            page_size: 20,
            page_num: pageNum,
            sort_field: 'time',
            sort_order: 'descend'
        };
        //‘update’表明此个刷新列表是通过emitter的触发进行的刷新，page_size 需要-1来获取值
        if(_.isEqual(type, 'update')) {
            params.page_size = 19;
        }
        let bodyData = {
            query: {sales_opportunities: [{sale_stages: stage}]},
            term_fields: ['sale_stages']
        };
        if (searchObj.field) {
            bodyData.query[searchObj.field] = searchObj.value;
        }
        // 自定义相关的参数
        const filterStoreData = DealFilterStore.getState();
        // 自定义相关的参数
        if (!_.isEmpty(filterStoreData.custom_variables)) {
            const custom_variables = {
                custom_variables: filterStoreData.custom_variables
            };
            bodyData.query.sales_opportunities[0] = _.extend(bodyData.query.sales_opportunities[0], custom_variables);
        } else {
            bodyData.query.sales_opportunities = [{sale_stages: stage}];
        }
        this.dispatch({loading: true, stage});
        dealAjax.getDealList(params, bodyData).then((data) => {
            this.dispatch({loading: false, stage, data: data});
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, (errorMsg) => {
            this.dispatch({loading: false, stage, errorMsg: errorMsg || Intl.get('deal.list.get.failed', '获取订单列表失败')});
        });
    };
    //各阶段总预算的获取
    this.getStageTotalBudget = function(query) {
        dealAjax.getStageTotalBudget(query).then((data) => {
            this.dispatch(data);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        });
    };
}

export default alt.createActions(dealBoardAction);
