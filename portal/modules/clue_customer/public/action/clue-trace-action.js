/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/6/10.
 */
var clueTraceAjax = require('../ajax/clue-trace-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
function ClueTraceAction() {
    this.generateActions(
        'setContent',
        'setDetailContent',
        'setUpdateId',
        'setInitial',
        'dismiss',
        'updateItem',
        'setContent',
        'setLoading',
        'changeTimeRange',
        'setFilterType'
    );
    //获取线索跟进记录列表
    this.getClueTraceList = function(queryObj, bodyData, callback) {
        this.dispatch({loading: true,error: false});
        clueTraceAjax.getClueTraceList(queryObj, bodyData).then((data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false,error: false,data: data});
            if(_.isFunction(callback)) callback();
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //增加线索跟进记录
    this.addClueTrace = function(queryObj, callback) {
        this.dispatch({loading: true,error: false});
        clueTraceAjax.addClueTrace(queryObj).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
            _.isFunction(callback) && callback(data.customer_trace);
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //更新线索跟进记录
    this.updateClueTrace = function(queryObj, callback) {
        this.dispatch({loading: true,error: false});
        clueTraceAjax.updateClueTrace(queryObj).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(ClueTraceAction);