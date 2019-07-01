/**
 * 单个用户日志的action
 */
var userAuditLogAjax = require('../ajax/user_audit_log_ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
const LogAnalysisUtil = require('./log-analysis-util');
import { userBasicInfoEmitter } from 'PUB_DIR/sources/utils/emitters';

function handleLogParams(_this, getLogParam, userOwnAppList) {
    getLogParam.appid = LogAnalysisUtil.handleSelectAppId(userOwnAppList);
    _this.dispatch(
        {
            appId: getLogParam.appid,
            appList: userOwnAppList
        }
    );
}

function SingleUserLogAction() {
    this.generateActions(
        'dismiss', // 切换用户时，恢复到默认状态
        'getSingleUserAppList', //获取单个用户的应用列表
        'getSingleAuditLogList', // 获取个人日志信息
        'setSelectedAppId', // 设置应用的app
        'changeSearchTime', // 更改时间选择日志
        'handleSearchEvent', // 处理搜索框中内容的变化
        'getLogsBySearch', // 根据搜索内容显示日志信息
        'changUserIdKeepSearch', //  切换用户时，保持搜索框内容
        'resetLogState',
        'toggleOperateDetail'//展开关闭操作详情
    ); 

    // 获取单个用户的应用列表
    this.getSingleUserAppList = function(searchObj, selectedAppId, appLists) {

        if (_.isObject(searchObj)) {
            let getLogParam = {
                user_id: searchObj.user_id,
                page: searchObj.page,
                type_filter: searchObj.type_filter
            };
            if (searchObj.starttime) {
                getLogParam.starttime = searchObj.starttime;
            }
            if (searchObj.endtime) {
                getLogParam.endtime = searchObj.endtime;
            }
            if (searchObj.search) {
                getLogParam.search = searchObj.search;
            }

            if (selectedAppId) { // 已选中应用
                getLogParam.appid = selectedAppId;
                this.actions.getUserBasicInfo(searchObj);
            } else { // 全部应用条件下查看
                if (appLists.length) {
                    handleLogParams(this, getLogParam, appLists);
                    this.actions.getUserBasicInfo(searchObj);
                } else {
                    userAuditLogAjax.getSingleUserAppList(searchObj).then( (result) => {
                        // 触发用户的基本信息
                        const userInfo = {
                            data: _.get(result, 'user'),
                            loading: false,
                            errorMsg: ''
                        };
                        userBasicInfoEmitter.emit(userBasicInfoEmitter.GET_USER_BASIC_INFO, userInfo);
                        if (_.isObject(result) && result.apps) {
                            handleLogParams(this, getLogParam, result.apps);
                            // 日志列表信息
                            this.actions.getSingleAuditLogList(getLogParam);
                        }
                    }, () => {
                        // 获取应用列表失败的处理
                        this.dispatch({error: true, errorMsg: Intl.get('user.log.get.log.fail', '获取操作日志信息失败！')});
                    } );
                    return;
                }
            }
            // 日志列表信息
            this.actions.getSingleAuditLogList(getLogParam);
        } else {
            // 请求参数错误
            this.dispatch({ error: true, errorMsg: Intl.get('user.log.param.error', '请求参数错误!') });
        }
    };

    this.getUserBasicInfo = function(searchObj) {
        // 触发用户的基本信息
        userAuditLogAjax.getSingleUserAppList(searchObj).then( (result) => {
            const userInfo = {
                data: _.get(result, 'user'),
                loading: false,
                errorMsg: ''
            };
            userBasicInfoEmitter.emit(userBasicInfoEmitter.GET_USER_BASIC_INFO, userInfo);
        }, (errorMsg) => {
            const userInfo = {
                data: null,
                loading: false,
                errorMsg: errorMsg || Intl.get('user.info.get.user.info.failed', '获取用户信息失败')
            };
            userBasicInfoEmitter.emit(userBasicInfoEmitter.GET_USER_BASIC_INFO, userInfo);
        } );
    };

    // 获取单个用户的审计日志信息
    this.getSingleAuditLogList = function(searchObj) {
        this.dispatch({ loading: true, error: false });
        let promise = null;
        //查询全部应用的日志调用另一个接口
        if (searchObj.appid.includes(',')) {
            let data = {
                ...searchObj,
                app_id: searchObj.appid,
                page_num: searchObj.page
            };
            delete data.appid;
            promise = userAuditLogAjax.getSingleUserAllAuditLog({
                params: {
                    user_id: searchObj.user_id
                },
                data
            });
        } else {
            promise = userAuditLogAjax.getSingleAuditLogList(searchObj);
        }
        promise.then((data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({ loading: false, error: false, data: data });
        }, (errorMsg) => {
            this.dispatch({ loading: false, error: true, errorMsg: errorMsg || Intl.get('errorcode.7', '获取审计日志失败') });
        });
    };
  
}

module.exports = alt.createActions(SingleUserLogAction);