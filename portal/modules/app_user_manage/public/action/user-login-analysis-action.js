/**
 * 单个用户分析的action
 */
var AppUserStore = require('../store/app-user-store');
var UserAuditLogStore = require('../store/user_audit_log_store');
var userAuditLogAjax = require('../ajax/user_audit_log_ajax');
var ShareObj = require('../util/app-id-share-util');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import UserScoreCommonAjax from '../../../common/public/ajax/user-score';
import USER_MANAGE_PRIVILEGE from '../privilege-const';

function UserLoginAnalysisAction() {
    this.generateActions(
        'resetState', // 切换用户时，恢复到默认状态
        'getSingleUserAppList', //获取单个用户的应用列表
        'setSelectedAppId', // 设置应用的app
        'getUserLoginInfo', // 用户登录信息（时长、次数、首次和最后一次登录时间）
        'getUserLoginChartInfo', // 用户登录统计图中登录时长、登录频次
        'setSelectedAppTerminals', // 设置选择应用的多终端类型
        'setAppTerminalsType', // 设置选择多终端类型
    );
    // 获取单个用户的应用列表
    this.getSingleUserAppList = function(searchObj, selectedAppId, appLists){
        let userOwnAppArray = _.cloneDeep(appLists);
        // 存储应用id的变量
        let userOwnAppArrayAppIdList = _.map(userOwnAppArray, 'app_id');

        // 获取UI界面上的app
        // share_online_app_id 在线用户和单个用户审计日志记录下的appId
        let selectApp = selectedAppId || AppUserStore.getState().selectedAppId || ShareObj.share_online_app_id ||
            UserAuditLogStore.getState().selectAppId;

        // 上一个用户选择应用id
        let lastSelectAppId = ShareObj.share_differ_user_keep_app_id;
        let selectedAppIdIndex = _.indexOf(userOwnAppArrayAppIdList,lastSelectAppId);

        let selectedLogAppId = '';
        // selectAPP === ''是针对全部应用
        if (selectApp === '') {
            if (_.isArray(userOwnAppArray) && userOwnAppArray.length >= 1 && selectedAppIdIndex === -1) {
                selectedLogAppId = userOwnAppArray[0].app_id;
            }else {
                selectedLogAppId = lastSelectAppId;
            }
        } else {
            selectedLogAppId = selectApp;
        }
        if (selectedLogAppId) {
            const matchAppInfo = _.find(userOwnAppArray, appItem => appItem.app_id === selectedLogAppId);
            let create_time = matchAppInfo && matchAppInfo.create_time || '';
            let loginParam = {
                appid: selectedLogAppId,
                user_id: searchObj.user_id,
                starttime: +create_time,
                endtime: new Date().getTime()
            };
            // 用户登录分数
            let reqData = {
                app_id: selectedLogAppId,
                account_id: searchObj.user_id
            };
            let type = 'self';
            if (hasPrivilege(USER_MANAGE_PRIVILEGE.USER_ANALYSIS_MANAGER)) {
                type = 'all';
            }
            this.actions.getLoginUserScore(reqData, type);

            // 用户登录信息（时长、次数、首次和最后一次登录时间）
            this.actions.getUserLoginInfo(loginParam);
            let lastLoginParam = {...loginParam, timeType: _.get(searchObj, 'timeType'), starttime: _.get(searchObj, 'starttime') || moment().subtract(6, 'month').valueOf()};
            // 用户登录统计图中登录时长、登录频次
            this.actions.getUserLoginChartInfo(lastLoginParam);

            // 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
            this.actions.getLoginUserActiveStatistics(lastLoginParam, type);
        }
        this.dispatch(
            {
                appId: selectedLogAppId,
                appList: userOwnAppArray,
            }
        );
    };

    // 获取用户的分数
    this.getLoginUserScore = function(reqData, type) {
        this.dispatch({paramsObj: reqData, loading: true, error: false});
        userAuditLogAjax.getLoginUserScore(reqData, type).then((data) => {
            this.dispatch({paramsObj: reqData, loading: false, error: false, data: data});
        },(errorMsg) => {
            this.dispatch({paramsObj: reqData, loading: false,error: true, errorMsg: errorMsg});
        });
    };

    // 用户登录信息（时长、次数、首次和最后一次登录时间）
    this.getUserLoginInfo = function(loginParam){
        if (loginParam && loginParam.appid) {
            this.dispatch({paramsObj: loginParam, loading: true, error: false});
            userAuditLogAjax.getUserLoginInfo(loginParam).then( (data) => {
                this.dispatch({paramsObj: loginParam, loading: false, error: false, data: data});
            },(errorMsg) => {
                this.dispatch({paramsObj: loginParam, loading: false, error: true, errorMsg: errorMsg});
            });
        } else {
            this.dispatch({paramsObj: loginParam, loading: false, error: true, errorMsg: Intl.get('user.log.login.fail', '获取登录信息失败！')});
        }
    };

    // 用户登录统计图中登录时长、登录频次
    this.getUserLoginChartInfo = function(loginParam){
        if (loginParam && loginParam.appid) {
            this.dispatch({paramsObj: loginParam, loading: true, error: false});
            let reqData = _.clone(loginParam);
            delete reqData.timeType;
            userAuditLogAjax.getUserLoginChartInfo(reqData).then((data) => {
                this.dispatch({paramsObj: loginParam, loading: false, error: false, data: data});
            },(errorMsg) => {
                this.dispatch({paramsObj: loginParam, loading: false,error: true, errorMsg: errorMsg});
            });
        } else {
            this.dispatch({paramsObj: loginParam, loading: false, error: true, errorMsg: Intl.get('user.log.login.fail', '获取登录信息失败！')});
        }
    };
    // 获取登录用户活跃统计信息（登录时长，登录次数，活跃天数）
    this.getLoginUserActiveStatistics = function(loginParam, type){
        if (loginParam && loginParam.appid) {
            this.dispatch({paramsObj: loginParam, loading: true, error: false});
            let reqData = _.clone(loginParam);
            delete reqData.timeType;
            userAuditLogAjax.getLoginUserActiveStatistics(reqData, type).then( (data) => {
                this.dispatch({paramsObj: loginParam, loading: false, error: false, data: data});
            },(errorMsg) => {
                this.dispatch({paramsObj: loginParam, loading: false, error: true, errorMsg: errorMsg});
            });
        } else {
            this.dispatch({paramsObj: loginParam, loading: false, error: true, errorMsg: Intl.get('user.login.last.failed', '获取用户最近登录统计信息失败')});
        }
    };
    this.getUserScoreIndicator = function() {
        UserScoreCommonAjax.getUserScoreIndicatorAjax().sendRequest().success((result) => {
            this.dispatch({
                list: _.cloneDeep(result)
            });
        }).error(

        );
    };
    this.getUserEngagementRule = function() {
        UserScoreCommonAjax.getUserEngagementRuleAjax().sendRequest().success((result) => {
            this.dispatch({
                list: _.cloneDeep(result)
            });
        }).error(errorMsg => {

        }
        );
    };
    this.getUserScoreLists = function() {
        UserScoreCommonAjax.getUserScoreListsAjax().sendRequest().success((result) => {
            this.dispatch({
                list: _.cloneDeep(result)
            });
        }).error(errorMsg => {
        }
        );

    };
}

module.exports = alt.createActions(UserLoginAnalysisAction);