var UserAuditLogAction = require('../action/user_audit_log_action');
var ShareObj = require('../util/app-id-share-util');
var DateSelectorUtils = require('antc/lib/components/datepicker/utils');
var AppUserUtil = require('../util/app-user-util');
import { ALL_LOG_INFO, AUDIT_LOG} from 'PUB_DIR/sources/utils/consts';
import { storageUtil } from 'ant-utils';
import {isKetaoOrganizaion} from 'PUB_DIR/sources/utils/common-method-util';
// 用户审计日志的store
function UserAuditLogStore(){
    this.resetState();
    // bindActions()将action与store绑定到一起
    this.bindActions(UserAuditLogAction);
}
UserAuditLogStore.prototype.resetAuditLog = function() {
    //是否是第一次加载，第一次加载的时候
    this.firstLoading = true;
    //是否处于loading状态
    this.appUserListResult = 'loading';
    // 获取用户日志
    this.auditLogList = [];
    // 当前数据最后一条数据的id
    this.sortId = '';
    // 获取用户审计日志出错的处理
    this.getUserLogErrorMsg = '';
    // 每次加载日志的条数
    this.loadSize = 20;
    // 日志的总条数
    this.total = 0;
    //初始化选中“一周”
    this.defaultRange = 'day';
    //排序字段
    this.sortField = 'timestamp';
    //排序方向
    this.sortOrder = 'desc';
    // 默认显示审计日志（对应的是过滤掉心跳服务和角色权限），this.typeFilter = ''显示全部日志
    this.typeFilter = ['心跳服务', '角色权限'];
    this.selectLogType = ''; // 选择的日志类型
    // 下拉加载
    this.listenScrollBottom = true;
    //团队和销售列表
    this.teamTreeList = [];
    this.teamList = {
        list: [],
        errMsg: '' // 获取失败的提示
    };
    //销售列表
    // 成员数据
    this.memberList = {
        list: [],
        errMsg: '' // 获取失败的提示
    };

},
UserAuditLogStore.prototype.resetState = function() {
    // 今天
    const timeObj = DateSelectorUtils.getTodayTime();
    //开始时间
    this.startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
    //结束时间
    this.endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
    // 获取用户的应用信息是数组
    this.userAppArray = [];
    //获取用户的应用信息出错
    this.userAppArrayErrMsg = '';
    //选中用户的应用产品
    this.selectAppId = '';
    // 选择产品对应的终端类型
    this.selectAppTerminals = [];
    // 记录input框中的输入的内容
    this.searchName = '';
    this.resetAuditLog();
},
// 获取应用产品的信息
UserAuditLogStore.prototype.getUserApp = function(result){
    if (result.error){
        this.userAppArrayErrMsg = result.errorMsg;
    } else {
        this.userAppArray = result.data;
        // 选中的appId
        this.selectAppId = _.get(result, 'selectAppId');
        let matchSelectApp = _.find(result.data, item => item.app_id === this.selectAppId);
        // 判断选中应用的多终端信息
        if (matchSelectApp) {
            this.selectAppTerminals = matchSelectApp.terminals;
        }
    }
};
// 获取用户审计日志的信息
UserAuditLogStore.prototype.getAuditLogList = function(result) {
    if (result.loading){
        this.appUserListResult = 'loading';
        this.getUserLogErrorMsg = '';
    }else if (result.error){
        this.appUserListResult = '';
        this.getUserLogErrorMsg = result.errorMsg;
    } else {
        this.firstLoading = false;
        this.appUserListResult = '';
        this.getUserLogErrorMsg = '';
        this.auditLogList = this.auditLogList.concat(result.data.user_logs);
        if (!result.data.user_logs.length) {
            this.listenScrollBottom = false;
        }
        else {
            this.listenScrollBottom = true;
        }
        var length = this.auditLogList.length;
        this.sortId = length > 0 ? this.auditLogList[length - 1].sort_id : '';
        this.total = result && result.data && result.data.total || 0;
    }
};

// 记录搜索框中输入的内容
UserAuditLogStore.prototype.handleSearchEvent = function(searchName) {
    this.searchName = searchName;
    this.sortId = '';
    this.firstLoading = true;
    this.auditLogList = [];
};

// 根据时间选择日志
UserAuditLogStore.prototype.changeSearchTime = function({startTime,endTime, range}) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.defaultRange = range;
    this.sortId = '';
    this.firstLoading = true;
    this.auditLogList = [];
};

// 设置选中的appid
UserAuditLogStore.prototype.setUserLogSelectedAppId = function(appId){
    let matchSelectApp = _.find(this.userAppArray, item => item.app_id === appId);
    if (matchSelectApp) {
        this.selectAppTerminals = matchSelectApp.terminals;
    }
    this.selectAppId = appId;
    ShareObj.app_id = this.selectAppId;
    // 客套组织下，直接显示客套产品，所以不用存储
    if (!isKetaoOrganizaion()) {
        let obj = AppUserUtil.getLocalStorageObj('logViewAppId', this.selectAppId );
        storageUtil.local.set(AppUserUtil.saveSelectAppKeyUserId, JSON.stringify(obj));
    }
    this.sortId = '';
    this.firstLoading = true;
    this.auditLogList = [];
};

// 设置排序参数
UserAuditLogStore.prototype.setSort = function(sorter){
    this.sortField = sorter && sorter.sortField;
    this.sortOrder = sorter && sorter.sortOrder;
    this.sortId = '';
    this.auditLogList = [];
};
// 刷新审计日志列表
UserAuditLogStore.prototype.handleRefresh = function(){
    this.resetAuditLog();
};

// 用户类型的过滤
UserAuditLogStore.prototype.handleFilterUserType = function() {
    this.sortId = '';
    this.auditLogList = [];
    this.firstLoading = true;
};

// 过滤日志类型
UserAuditLogStore.prototype.handleFilterLogType = function() {
    this.sortId = '';
    this.auditLogList = [];
    this.firstLoading = true;
};

// 过滤产品的多終端类型
UserAuditLogStore.prototype.handleFilterAppTerminalType = function() {
    this.sortId = '';
    this.auditLogList = [];
    this.firstLoading = true;
};

//获取团队列表
UserAuditLogStore.prototype.getTeamList = function(result) {
    if (result.errorMsg) {
        this.teamList.errMsg = result.errorMsg;
    } else if (result.teamList) {
        this.teamTreeList = result.teamTreeList;
        this.teamList.errMsg = '';
        let resData = result.teamList;
        if (_.isArray(resData) && resData.length) {
            this.teamList.list = _.map(resData, (item) => {
                return {
                    name: item.group_name,
                    id: item.group_id
                };
            });
        }
    }
};
// 获取成员信息
UserAuditLogStore.prototype.getSaleMemberList = function(result) {
    if (result.error) {
        this.memberList.errMsg = result.errMsg;
    } else if (result.resData) {
        this.memberList.errMsg = '';
        let resData = result.resData;
        let memberList = [];
        if (_.isArray(resData) && resData.length) {
            _.each(resData, (item) => {
                if (item.status) {
                    memberList.push({name: item.nick_name, id: item.user_id, user_name: item.user_name});
                }
            });
        }
        this.memberList.list = memberList;
    }
};

module.exports = alt.createStore(UserAuditLogStore);