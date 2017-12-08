/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
var scheduleManagementAjax = require("../ajax/schedule-management-ajax");
var scrollBarEmitter = require("PUB_DIR/sources/utils/emitters").scrollBarEmitter;
let userData = require("PUB_DIR/sources/user-data");
function ScheduleManagementActions() {
    this.generateActions(
        'getState',
        'afterHandleStatus',
    );
    //获取日程列表
    this.getScheduleList = function (queryObj, listType) {
        //右侧日程列表会传第二个参数
        if (listType){
            this.dispatch({error: false, loading: true,isScheduleTableData:true});
        }else{
            this.dispatch({error: false, loading: true});
        }
        this.dispatch({error: false, loading: true});
        scheduleManagementAjax.getScheduleList(queryObj).then((result) => {
            if (listType){
                this.dispatch({error: false, loading: false, scheduleListObj: result,isScheduleTableData:true});
            }else{
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
                this.dispatch({error: false, loading: false, scheduleListObj: result});
            }

        }, (errorMsg) => {
            if (listType){
                this.dispatch({
                    error: true,
                    loading: false,
                    errorMsg: errorMsg || Intl.get("schedule.get.schedule.list.failed","获取日程管理列表失败"),
                    isScheduleTableData:true
                });
            }else{
                this.dispatch({
                    error: true,
                    loading: false,
                    errorMsg: errorMsg || Intl.get("schedule.expired.list.failed","获取超时日程管理列表失败")
                });
            }
        });
    };
    //修改某条日程管理的状态
    this.handleScheduleStatus = function (reqData, cb) {
        this.dispatch({error: false, loading: true});
        scheduleManagementAjax.handleScheduleStatus(reqData).then((resData) => {
            this.dispatch({error: false, loading: false, result: resData});
            cb(resData);
        }, (errMsg)=>{
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get("crm.failed.alert.todo.list","修改待办事项状态失败")
            });
            cb(errMsg)
        });
    }




















    //联系人电话唯一性的验证
    this.checkOnlyContactPhone = function (phone, callback) {
        scheduleManagementAjax.checkOnlyCustomer({phone: phone}).then(function (data) {
            if (callback) {
                callback(data);
            }
        }, function (errorMsg) {
            if (callback) {
                callback(errorMsg || Intl.get("crm.194", "联系人电话唯一性验证失败"));
            }
        });
    };
    //获取销售列表
    this.getSalesManList = function (cb) {
        var _this = this;
        let ajaxFunc = null;
        if (userData.isSalesManager()) {
            //销售领导、域管理员角色时，客户所属销售下拉列表的数据获取
            ajaxFunc = scheduleManagementAjax.getSalesManList();
        }
        if (ajaxFunc) {
            ajaxFunc.then(function (list) {
                _this.dispatch(list);
                if (cb) cb();
            }, function (errorMsg) {
                console.log(errorMsg);
            });
        }
    };
    //添加或更新跟进内容
    this.addCluecustomerTrace = function (submitObj,callback) {
        this.dispatch({error: false, loading: true});
        scheduleManagementAjax.addCluecustomerTrace(submitObj).then((result)=>{
            this.dispatch({error: false, loading: false, submitTip: result});
            _.isFunction(callback) && callback();
        },(errorMsg)=>{
            this.dispatch({error: true, loading: false, errorMsg: errorMsg || Intl.get("failed.submit.trace.content","添加跟进内容失败")})
        })
    };
    //把线索客户分配给对应的销售
    this.distributeCluecustomerToSale = function (submitObj,callback) {
        this.dispatch({error: false, loading: true});
        scheduleManagementAjax.distributeCluecustomerToSale(submitObj).then((result)=>{
            this.dispatch({error: false, loading: false});
            _.isFunction(callback) && callback();
        },(errorMsg)=>{
            this.dispatch({error: true, loading: false});
            _.isFunction(callback) && callback({errorMsg: errorMsg || Intl.get("failed.distribute.cluecustomer.to.sales","把线索客户分配给对应的销售失败")});
        })
    };
}
module.exports = alt.createActions(ScheduleManagementActions);