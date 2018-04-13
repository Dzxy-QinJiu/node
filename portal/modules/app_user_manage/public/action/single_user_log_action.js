/**
 * 单个用户日志的action
 */
var AppUserStore = require('../store/app-user-store');
var UserAuditLogStore = require('../store/user_audit_log_store');
var userAuditLogAjax = require('../ajax/user_audit_log_ajax');
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
var ShareObj = require("../util/app-id-share-util");

function SingleUserLogAction() {
    this.generateActions(
        "dismiss", // 切换用户时，恢复到默认状态
        "getSingleUserAppList",  //获取单个用户的应用列表
        "getSingleAuditLogList",  // 获取个人日志信息
        "setSelectedAppId",  // 设置应用的app
        "changeSearchTime",  // 更改时间选择日志
        "handleSearchEvent",  // 处理搜索框中内容的变化
        "getLogsBySearch",  // 根据搜索内容显示日志信息
        "changUserIdKeepSearch", //  切换用户时，保持搜索框内容
        'resetLogState'
    ); 

    // 获取单个用户的应用列表
    this.getSingleUserAppList = function (searchObj, selectedAppId) {
        userAuditLogAjax.getSingleUserAppList(searchObj).then( (result) => {
            let userOwnAppArray = result.apps;
            // 存储应用id的变量
            let userOwnAppArrayAppIdList = [];
            if (_.isArray(userOwnAppArray) && userOwnAppArray.length >= 1) {
                userOwnAppArrayAppIdList = _.pluck(userOwnAppArray, 'app_id');
            }
            // 上一个用户选择应用id
            let lastSelectAppId = ShareObj.share_differ_user_keep_app_id;
            let index = _.indexOf(userOwnAppArrayAppIdList,lastSelectAppId);
            // 获取UI界面上的app
            var selectApp =  selectedAppId||AppUserStore.getState().selectedAppId || ShareObj.share_online_app_id ||
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
                user_id: searchObj.user_id,
                page: searchObj.page,
                type_filter: searchObj.type_filter
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
            }
            // 日志列表信息
            this.actions.getSingleAuditLogList(getLogListQueryParam);
            this.dispatch(
                {
                    appId: selectedLogAppId,
                    appList: userOwnAppArray
                }
            );
        },  (errorMsg) =>{
            this.dispatch({error: true, errorMsg: errorMsg});
        });
    };


    // 获取单个用户的审计日志信息
    this.getSingleAuditLogList = function (searchObj) {
        this.dispatch({loading: true, error: false});
        userAuditLogAjax.getSingleAuditLogList(searchObj).then( (data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, data: data});
        },  (errorMsg) =>{
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(SingleUserLogAction);