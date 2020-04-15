/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
var customerRecordAjax = require('../ajax/customer-record-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
import {isOrganizationEefung} from 'PUB_DIR/sources/utils/common-method-util'; //判断是否在蚁坊域
import {getAllApplyLists} from 'MOD_DIR/apply_approve_list/public/ajax/apply_approve_list_ajax';
import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
function CustomerRecordAction() {
    this.generateActions(
        'setType',
        'setContent',
        'setDetailContent',
        'setUpdateId',
        'setInitial',
        'dismiss',
        'setModalDialogFlag',
        'updateItem',
        'changeAddButtonType',
        'setContent',
        'setLoading',
        'changeTimeRange',
        'setFilterType'
    );
    //获取客户跟踪列表
    this.getCustomerTraceList = function(queryObj, bodyData, callback) {
        customerRecordAjax.getCustomerTraceRecordList(queryObj, bodyData).then((data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false,error: false,data: data});
            if(_.isFunction(callback)) callback(data);
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };
    //获取跟进记录的分类统计
    this.getCustomerTraceStatistic = function(queryParams) {
        customerRecordAjax.getCustomerTraceStatistic(queryParams).then((data) => {
            //如果是在蚁坊域，才将两个接口的数据整合到一起
            if(isOrganizationEefung()) {
                let queryObj = {
                    sort_field: 'create_time',
                    order: 'descend',
                    page_size: 0, //只获取已通过的舆情报告的总数,不获取报告列表
                    type: APPLY_APPROVE_TYPES.OPINION_REPORT,
                    comment_unread: false,
                    status: 'pass',
                    customer_id: queryParams.customer_id
                };
                getAllApplyLists(queryObj).then((reportResult) => {
                    data.public_opinion_report = _.get(reportResult, 'total', 0);
                    this.dispatch({loading: false,error: false,data: data});
                }, () => {
                    this.dispatch({loading: false,error: false,data: data});
                });
            } else {
                this.dispatch({loading: false,error: false,data: data});
            }
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
        });
    };

    //增加客户跟踪记录
    this.addCustomerTrace = function(queryObj, callback, errCallback) {
        this.dispatch({loading: true,error: false});
        customerRecordAjax.addCustomerTrace(queryObj).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
            _.isFunction(callback) && callback(data.customer_trace);
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
            _.isFunction(errCallback) && errCallback(errorMsg);
        });
    };
    //更新客户跟踪记录
    this.updateCustomerTrace = function(queryObj, callback, errCallback) {
        this.dispatch({loading: true,error: false});
        customerRecordAjax.updateCustomerTrace(queryObj).then((data) => {
            this.dispatch({loading: false,error: false,data: data});
            _.isFunction(callback) && callback();
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg});
            _.isFunction(errCallback) && errCallback(errorMsg);
        });
    };
    //获取舆情报告列表
    this.getPublicOpinionReports = function(queryObj, callback) {
        let result = {data: null, error: false};
        getAllApplyLists(queryObj).then((data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            result.data = data;
            this.dispatch(result);
            if (_.isFunction(callback)) callback();
        }, (error) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            result.data = error;
            result.error = true;
            this.dispatch(result);
        });
    };
}
module.exports = alt.createActions(CustomerRecordAction);
