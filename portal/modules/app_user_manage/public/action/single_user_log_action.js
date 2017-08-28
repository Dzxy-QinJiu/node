/**
 * 单个用户日志的action
 */
var AppUserStore = require('../store/app-user-store');
var UserAuditLogStore = require('../store/user_audit_log_store');
var userAuditLogAjax = require('../ajax/user_audit_log_ajax');
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
var ShareObj = require("../util/app-id-share-util");
var _ = require('underscore');

function SingleUserLogAction() {

    this.generateActions(
        // 切换用户时，恢复到默认状态
        "dismiss",
        //获取单个用户的应用列表
        "getSingleUserAppList",
        // 获取个人日志信息
        "getSingleAuditLogList",
        // 设置应用的app
        "setSelectedAppId",
        // 更改时间选择日志
        "changeSearchTime",
        // 处理搜索框中内容的变化
        "handleSearchEvent",
        // 根据时间显示日志信息
        "getLogsByTime",
        // 根据选择的app显示日志信息
        "getLogsByApp",
        // 根据搜索内容显示日志信息
        "getLogsBySearch",
        //  切换用户时，保持搜索框内容
        "changUserIdKeepSearch",
        // 过滤类型
        'filterType',
        // 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
        'getUserLoginInfo',
    );

    // 获取单个用户的应用列表
    this.getSingleUserAppList = function (searchObj) {
        var _this = this;
        userAuditLogAjax.getSingleUserAppList(searchObj).then(function (result) {
            var userOwnAppArray = result.apps;
            // 存储应用id的变量
            var userOwnAppArrayAppIdList = [];
            if (_.isArray(userOwnAppArray) && userOwnAppArray.length >= 1) {
                userOwnAppArrayAppIdList = _.pluck(userOwnAppArray, 'app_id');
            }
            // 上一个用户选择应用id
            var lastSelectAppId = ShareObj.share_differ_user_keep_app_id;
            let index = _.indexOf(userOwnAppArrayAppIdList,lastSelectAppId);
            // 获取UI界面上的app
            var selectApp =  AppUserStore.getState().selectedAppId || ShareObj.share_online_app_id ||
                UserAuditLogStore.getState().selectAppId;
            var selectedLogAppId = '';
            // selectAPP == ''是针对全部应用
            if (selectApp == '') {
                if (_.isArray(userOwnAppArray) && userOwnAppArray.length >= 1 && index == -1) {
                    selectedLogAppId = userOwnAppArray[0].app_id;
                }else {
                    selectedLogAppId = lastSelectAppId;
                }
            } else {
                selectedLogAppId = selectApp;
            }
            
            let getLogListQueryParam = {
                appid: selectedLogAppId,
                user_id: searchObj.user_id
            };
            if (_.isObject(searchObj)) {
                if (searchObj.starttime) {
                    getLogListQueryParam.starttime = searchObj.starttime;
                }
                if (searchObj.endtime) {
                    getLogListQueryParam.endtime = searchObj.endtime;
                }
                if (searchObj.search) {
                    getLogListQueryParam.search = searchObj.search;
                }
                if (searchObj.type_filter) {
                    getLogListQueryParam.type_filter = searchObj.type_filter;
                }
            }
            // 日志列表信息
            _this.actions.getSingleAuditLogList(getLogListQueryParam);
            
            let loginParam = {
                appid: selectedLogAppId,
                user_id: searchObj.user_id
            };
            if (_.isObject(searchObj)) {
                if (searchObj.starttime) {
                    loginParam.starttime = searchObj.starttime;
                }
                if (searchObj.endtime) {
                    loginParam.endtime = searchObj.endtime;
                }
            }
            // 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
            _this.actions.getUserLoginInfo(loginParam);
            _this.dispatch(
                {
                    appId: selectedLogAppId,
                    appList: userOwnAppArray
                }
            );
        }, function (errorMsg) {
            _this.dispatch({error: true, errorMsg: errorMsg});
        });
    };


    // 获取单个用户的审计日志信息
    this.getSingleAuditLogList = function (searchObj) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        userAuditLogAjax.getSingleAuditLogList(searchObj).then(function (data) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch({loading: false, error: false, data: data});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    // 用户登录信息（时长、次数、首次和最后一次登录时间、登录时长统计、登录频次统计）
    this.getUserLoginInfo = function (loginParam){
        this.dispatch({loading: true, error: false});
        userAuditLogAjax.getUserLoginInfo(loginParam).then((data) => {
            this.dispatch({loading: false,error: false, data:data});
        },(errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(SingleUserLogAction);