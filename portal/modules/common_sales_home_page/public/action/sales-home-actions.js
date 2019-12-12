var salesHomeAjax = require('../ajax/sales-home-ajax');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var scrollBarEmitter = require('PUB_DIR/sources/utils/emitters').scrollBarEmitter;
var salesClueAjax = require('MOD_DIR/clue_customer/public/ajax/clue-customer-ajax');
var userData = require('../../../../public/sources/user-data');
import UserAjax from '../../../common/public/ajax/user';
import {afterGetExtendUserInfo} from 'PUB_DIR/sources/utils/common-method-util';
function SalesHomeActions() {
    this.generateActions(
        'setInitState',//设置初始化数据
        'afterHandleStatus',//修改日程状态后的处理
        'afterHandleMessage',//处理消息后的处理
        'afterRemarkClue',//标记日程无效后的处理
        'removeClueItem'
    );
    this.getPhoneTotal = function(reqData) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getPhoneTotal(reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        }
        );
    };
    //获取客户统计总数
    this.getCustomerTotal = function(reqData) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getCustomerTotal(reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        });
    };
    //获取最近联系的客户
    this.getTodayContactCustomer = function(rangParams, pageSize, sorter) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getTodayContactCustomer(rangParams, pageSize, sorter).then((result) => {
            this.dispatch({loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        });
    };

    //获取日程管理列表
    this.getScheduleList = function(queryObj, type) {
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
                errorMsg: errorMsg || Intl.get('schedule.get.schedule.list.failed', '获取日程管理列表失败')
            });
        });
    };
    //获取即将到期的客户
    this.getExpireCustomer = function(queryObj) {
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
    this.getSystemNotices = function(queryObj, status, type) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getSystemNotices(queryObj, status).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({type: type, loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({type: type, loading: false, error: true, errMsg: errorMsg});
        });
    };
    //获取重复客户列表
    this.getRepeatCustomerList = function(queryParams) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getRepeatCustomerList(queryParams).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg || Intl.get('crm.188', '获取重复客户列表失败!')});
        });
    };
    //修改某条日程管理的状态
    this.handleScheduleStatus = function(reqData, cb) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.handleScheduleStatus(reqData).then((resData) => {
            this.dispatch({error: false, loading: false, result: resData});
            cb(resData);
        }, (errMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errMsg || Intl.get('crm.failed.alert.todo.list', '修改待办事项状态失败')
            });
            cb(errMsg);
        });
    };
    //获取新分配，但未联系的客户
    this.getNewDistributeCustomer = function(condition, rangParams, pageSize, pageNum, sorter) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.getNewDistributeCustomer(condition, rangParams, pageSize, pageNum, sorter).then((resData) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, resData: resData});
        }, (errMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errMsg: errMsg || Intl.get('sales.frontpage.fail.new.distribute.customer', '获取新分配的客户失败')
            });
        });
    };
    //查询最近登录的客户
    this.getRecentLoginCustomers = function(condition, rangParams, pageSize, pageNum, sorter) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.getRecentLoginCustomers(condition, rangParams, pageSize, pageNum, sorter).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('failed.get.crm.list', '获取客户列表失败')
            });
        });
    };
    //查询销售线索
    this.getClueCustomerList = function(constObj, unexist_fields) {
        this.dispatch({error: false, loading: true});
        salesHomeAjax.getClueCustomerList(constObj, unexist_fields).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, clueCustomerObj: result});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get('failed.to.get.clue.customer.list', '获取线索列表失败')
            });
        });
    };

    //获取是否展示邮件激活提示
    this.getShowActiveEmailOrClientConfig = function(isShowPhoneSet) {
        //先获取个人资料
        var user_id = userData.getUserData().user_id;
        UserAjax.getUserByIdAjax().resolvePath({
            user_id: user_id
        }).sendRequest().success((data) => {
            afterGetExtendUserInfo(data, this, isShowPhoneSet);
        });
    };
    //邮箱激活
    this.activeUserEmail = function(bodyObj, callback) {
        salesHomeAjax.activeUserEmail(bodyObj).then(function(data) {
            if (callback) {
                if (data) {
                    callback({error: false, data: data});
                } else {
                    callback({error: true, errorMsg: Intl.get('user.info.active.user.email.failed','激活失败')});
                }
            }
        }, function(errorMsg) {
            if (callback) {
                callback({error: true, errorMsg: errorMsg || Intl.get('user.info.active.user.email.failed','激活失败')});
            }
        });
    };
    //设置邮箱激活不再提醒
    this.setWebsiteConfig = function(queryObj,callback) {
        this.dispatch({emailLoading: true, error: false});
        salesHomeAjax.setWebsiteConfig(queryObj).then((resData) => {
            if (callback && _.isFunction(callback)){
                callback();
            }
        },(errorMsg) => {
            if (callback && _.isFunction(callback)){
                callback(errorMsg || Intl.get('failed.set.no.tip','设置失败'));
            }
        }
        );

    };

    //获取将要到期的合同
    this.getContractExpireRemind = function(reqData) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getContractExpireRemind(reqData).then((resData) => {
            this.dispatch({loading: false, error: false, resData: resData});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg});
        });
    };

    //在客户panel中点击了添加跟进，此时需要将页面中跟进的客户删除，并且今日已跟进客户+1
    this.updatePageNewDistributeCustomer = function (customer_id) {
        this.dispatch(customer_id);
    };
}

module.exports = alt.createActions(SalesHomeActions);
