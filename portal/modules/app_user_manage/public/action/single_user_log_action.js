/**
 * 单个用户日志的action
 */
var AppUserStore = require('../store/app-user-store');
var userAuditLogAjax = require('../ajax/user_audit_log_ajax');
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
const LogAnalysisUtil = require("./log-analysis-util");

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
        let getLogParam = {
            user_id: searchObj.user_id,
            page: searchObj.page,
            type_filter: searchObj.type_filter
        };
        if (_.isObject(searchObj)) {
            if (searchObj.starttime) {
                getLogParam.starttime = searchObj.starttime;
            }
            if (searchObj.endtime) {
                getLogParam.endtime = searchObj.endtime;
            }
            if (searchObj.search) {
                getLogParam.search = searchObj.search;
            }
        }
        let userOwnAppList = [];
        if (selectedAppId) { // 已选中应用
            getLogParam.appid = selectedAppId;
        } else { // 全部应用条件下查看
            let appUserList = AppUserStore.getState().appUserList;
            if (appUserList.length) {
                let selectUserInfo =  _.find(appUserList,  item => item.user.user_id === searchObj.user_id);
                userOwnAppList = selectUserInfo && selectUserInfo.apps || [];
                getLogParam.appid = LogAnalysisUtil.handleSelectAppId(userOwnAppList);
            } else {
                userAuditLogAjax.getSingleUserAppList(searchObj).then( (result) => {
                    if (_.isObject(result) && result.apps) {
                        userOwnAppList = result.apps;
                        getLogParam.appid = LogAnalysisUtil.handleSelectAppId(userOwnAppList);
                        // 日志列表信息
                        this.actions.getSingleAuditLogList(getLogParam);
                        this.dispatch(
                            {
                                appId:  getLogParam.appid,
                                appList: userOwnAppList
                            }
                        );
                    }
                }, () => {
                    // 日志列表信息
                    this.actions.getSingleAuditLogList();
                    this.dispatch(
                        {
                            appId:  '',
                            appList: userOwnAppList
                        }
                    );
                } );
            }
            return;
        }
        // 日志列表信息
        this.actions.getSingleAuditLogList(getLogParam);
        this.dispatch(
            {
                appId:  getLogParam.appid,
                appList: userOwnAppList
            }
        );
    };


    // 获取单个用户的审计日志信息
    this.getSingleAuditLogList = function (searchObj) {
        if (searchObj && searchObj.appid) {
            this.dispatch({loading: true, error: false});
            userAuditLogAjax.getSingleAuditLogList(searchObj).then( (data) => {
                scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
                this.dispatch({loading: false, error: false, data: data});
            },  (errorMsg) =>{
                this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            });
        } else {
            this.dispatch({loading: false, error: true, errorMsg: Intl.get('user.log.get.log.fail', '获取操作日志信息失败！')});
        }

    };
}

module.exports = alt.createActions(SingleUserLogAction);