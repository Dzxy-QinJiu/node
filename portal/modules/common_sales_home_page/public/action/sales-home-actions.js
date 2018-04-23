var salesHomeAjax = require("../ajax/sales-home-ajax");
import {hasPrivilege} from "CMP_DIR/privilege/checker";
var scrollBarEmitter = require("PUB_DIR/sources/utils/emitters").scrollBarEmitter;

function SalesHomeActions() {
    this.generateActions(
        'setInitState',//设置初始化数据
        'afterHandleStatus',//修改日程状态后的处理
        'afterHandleMessage'//处理消息后的处理
    );
    this.getPhoneTotal = function (reqData) {
        let type = 'manager';
        if (hasPrivilege("CALL_RECORD_VIEW_USER")) {
            type = 'user';
        }
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getPhoneTotal(reqData, type).then((resData) => {
                this.dispatch({loading: false, error: false, resData: resData});
            }, (errorMsg) => {
                this.dispatch({loading: false, error: true, errMsg: errorMsg});
            }
        );
    };
    //获取客户统计总数
    this.getCustomerTotal = function (reqData) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getCustomerTotal(reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        });
    };
    //获取最近联系的客户
    this.getTodayContactCustomer = function (rangParams, pageSize, sorter) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getTodayContactCustomer(rangParams, pageSize, sorter).then((result) => {
            this.dispatch({loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        });
    };

    //获取日程管理列表
    this.getScheduleList = function (queryObj, type) {
        //左侧过期未完成的日程数据
        this.dispatch({error: false, loading: true});
        salesHomeAjax.getScheduleList(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({type: type, error: false, loading: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({
                type: type,
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get("schedule.get.schedule.list.failed", "获取日程管理列表失败")
            });
        });
    };
    //获取即将到期的客户
    this.getExpireCustomer = function (queryObj) {
        this.dispatch({loading: true, error: false});
        var dataType = queryObj.dataType;
        delete queryObj.dataType;
        salesHomeAjax.getExpireCustomer(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({type: dataType, loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({type: dataType, loading: false, error: true, errMsg: errorMsg});
        });
    };
    //获取关注客户登录，停用客户登录等系统消息
    this.getSystemNotices = function (queryObj, status, type) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getSystemNotices(queryObj, status).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({type: type, loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({type: type, loading: false, error: true, errMsg: errorMsg});
        });
    };
    //获取重复客户列表
    this.getRepeatCustomerList = function (queryParams) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getRepeatCustomerList(queryParams).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg || Intl.get("crm.188", "获取重复客户列表失败!")});
        });
    };
    //修改某条日程管理的状态
    this.handleScheduleStatus = function (reqData, cb) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.handleScheduleStatus(reqData).then((resData) => {
            this.dispatch({error: false, loading: false, result: resData});
            cb(resData);
        }, (errMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errMsg || Intl.get("crm.failed.alert.todo.list", "修改待办事项状态失败")
            });
            cb(errMsg);
        });
    };
    //获取新分配，但未联系的客户
    this.getNewDistributeCustomer = function (condition, rangParams, pageSize, sorter, queryObj) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.getNewDistributeCustomer(condition, rangParams, pageSize, sorter, queryObj).then((resData) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errMsg: errMsg || Intl.get("sales.frontpage.fail.new.distribute.customer", "获取新分配的客户失败")
            });
        });
    };
    //查询最近登录的客户
    this.getRecentLoginCustomers = function (condition, rangParams, pageSize, sorter, queryObj) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.getRecentLoginCustomers(condition, rangParams, pageSize, sorter, queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get("failed.get.crm.list", "获取客户列表失败")
            });
        });
    };
}

module.exports = alt.createActions(SalesHomeActions);
