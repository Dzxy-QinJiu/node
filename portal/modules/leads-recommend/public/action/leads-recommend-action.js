/**
 * Copyright (c) 2019-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2019-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/23.
 */
var leadsRecommendAjax = require('../ajax/leads-recommend-ajax');
var clueCustomerAjax = require('MOD_DIR/clue_customer/public/ajax/clue-customer-ajax');
import {deleteEmptyProperty, handleRecommendClueFilters} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
function LeadsRecommendActions() {
    this.generateActions(
        'resetState',
        'getSalesManList',//获取销售团队列表
        'setSalesMan',//获取销售人员及团队的id
        'setUnSelectDataTip',//未选择销售人员的提醒信息
        'setKeyWord',//设置关键字
        'saveSettingCustomerRecomment',
        'updateRecommendClueLists',
        'remarkLeadExtractedByOther',//给被别人提取过的线索加一个标识
        'initialRecommendClues',//初始化推荐线索相关条件及状态
        'setPageSize',//设置pageSize
        'updateSelectedRecommendClues',//更新选中状态的线索
        'onceUpdateRecommendClueLists',//一次性更新需要处理的线索
    );
    //获取销售列表
    this.getSalesManList = function(cb) {
        //客户所属销售（团队）下拉列表的数据获取
        clueCustomerAjax.getSalesManList().then((list) => {
            this.dispatch(list);
            if (cb) cb();
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    };

    //获取个人客户推荐配置
    this.getSettingCustomerRecomment = function(condition, callback) {
        //引导页设置了推荐条件后跳转过来时，用引导页设置的推荐条件
        if(!_.isEmpty(condition)){
            handleRecommendClueFilters(condition);
            this.dispatch({list: [condition]});
            _.isFunction(callback) && callback(condition);
        } else {
            leadsRecommendAjax.getSettingCustomerRecomment().then((list) => {
                var data = _.get(list,'[0]', {});
                deleteEmptyProperty(data);
                handleRecommendClueFilters(data);
                this.dispatch({list: list});
                _.isFunction(callback) && callback(data);
            },(errorMsg) => {
                this.dispatch({list: []});
                _.isFunction(callback) && callback();
            });
        }
    };

    //获取推荐线索列表
    this.getRecommendClueLists = function(obj, isRequest = true) {
        this.dispatch({loading: true, error: false});
        if(isRequest) {
            leadsRecommendAjax.getRecommendClueLists(obj).then((data) => {
                this.dispatch({loading: false, error: false, data});
            },(errorMsg) => {
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
        }else {
            this.dispatch({loading: false, error: false, data: obj});
        }
    };

    //一次性更新需要处理的线索
    this.onceUpdateRecommendClueLists = function(updateClueIds, cb) {
        this.dispatch(updateClueIds);
        _.isFunction(cb) && cb();
    };

    // 获取所有成员
    this.getAllSalesUserList = function(cb) {
        getAllSalesUserList((allUserList) => {
            this.dispatch(allUserList);
            if (cb) cb(allUserList);
        });
    };
}
module.exports = alt.createActions(LeadsRecommendActions);