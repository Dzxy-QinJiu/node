/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var scheduleManagementAjax = require('../ajax/schedule-management-ajax');
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
let userData = require('PUB_DIR/sources/user-data');
function ScheduleManagementActions() {
    this.generateActions(
        'setInitState',
        'afterHandleStatus',
        'updateExpiredPanelState',
        'setExpiredScheduleInitState'
    );
    //获取日程列表
    this.getScheduleList = function(queryObj, listType) {
        //左侧过期未完成的日程数据
        this.dispatch({error: false, loading: true});
        this.dispatch({error: false, loading: true});
        scheduleManagementAjax.getScheduleList(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, scheduleListObj: result});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('schedule.expired.list.failed', '获取超时日程管理列表失败')
            });
        });
    };
    //修改某条日程管理的状态
    this.handleScheduleStatus = function(reqData, cb) {
        this.dispatch({error: false, loading: true});
        scheduleManagementAjax.handleScheduleStatus(reqData).then((resData) => {
            cb(resData);
        }, (errMsg) => {
            this.dispatch({error: false, loading: false, result: resData});
            cb(errMsg || Intl.get('crm.failed.alert.todo.list','修改待办事项状态失败'));
        });
    };
}
module.exports = alt.createActions(ScheduleManagementActions);
