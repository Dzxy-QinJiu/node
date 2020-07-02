/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/6/26.
 */
/**
 * 日程管理的action
 */
var scheduleAjax = require('../ajax/schedule-ajax');
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
function ScheduleAction() {
    this.generateActions(
        'resetState',
        'showAddForm',
        'showEditForm',
        'cancelEdit',
        'afterAddSchedule',
        'afterDelSchedule',
        'afterHandleStatus',
        'toggleScheduleContact'
    );

    //获取日程管理列表
    this.getScheduleList = function(queryObj) {
        this.dispatch({loading: true,error: false});
        scheduleAjax.getScheduleList(queryObj).then((resData) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, data: resData});
        },(errorMsg) => {
            this.dispatch({loading: false,error: true,errorMsg: errorMsg || Intl.get('fail.get.clue.schedule.list', '获取联系计划列表失败')});
        });
    };
    //添加日程管理
    this.addSchedule = function(reqData, cb) {
        scheduleAjax.addSchedule(reqData).then((resData) => {
            cb(resData);
        },(errMsg) => {
            cb(errMsg);
        });
    };
    //编辑日程管理
    this.editSchedule = function(reqData, cb) {
        scheduleAjax.editSchedule(reqData).then(function(resData) {
            cb(resData);
        });
    };
    //删除日程管理
    this.deleteSchedule = function(reqData, cb) {
        scheduleAjax.deleteSchedule(reqData).then((resData) => {
            cb(resData);
        },(errMsg) => {
            cb(errMsg);
        });
    };
    //修改某条日程管理的状态
    this.handleScheduleStatus = function(reqData, cb) {
        scheduleAjax.handleScheduleStatus(reqData).then(function(resData) {
            cb(resData);
        },(errMsg) => {
            cb(errMsg);
        });
    };
}

module.exports = alt.createActions(ScheduleAction);
