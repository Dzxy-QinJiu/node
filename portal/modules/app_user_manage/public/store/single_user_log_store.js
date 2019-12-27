const SingleUserLogAction = require('../action/single_user_log_action');
const ShareObj = require('../util/app-id-share-util');
const datePickerUtils = require('CMP_DIR/datepicker/utils');

function SingleUserLogStore(){
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(SingleUserLogAction);
}

// 操作日志相关的初始变量
SingleUserLogStore.prototype.logInitialState = function() {
    this.curPage = 1;
    this.pageSize = 10;
    this.total = 0;
    this.auditLogList = [];
    this.logListLoading = 'loading';
    this.listenScrollBottom = false;
    this.appTerminalType = ''; // 应用终端类型，默认全部
    // 获取单个用户日志失败的错误提示
    this.getUserLogErrorMsg = '';
};

SingleUserLogStore.prototype.resetState = function() {
    this.isLoading = true;
    this.userOwnAppArray = [];
    this.selectedLogAppId = '';
    // 选择产品对应的终端类型
    this.selectAppTerminals = [];
    this.searchName = '';
    this.defaultRange = 'week';
    // 默认显示审计日志（对应的是过滤掉心跳服务和角色权限），this.typeFilter = ''显示全部日志
    this.typeFilter = ['心跳服务', '角色权限'];
    this.selectLogType = ''; // 选择的日志类型
    const timeObj = datePickerUtils.getThisWeekTime(); // 本周
    this.startTime = datePickerUtils.getMilliseconds(timeObj.start_time); //开始时间
    this.endTime = datePickerUtils.getMilliseconds(timeObj.end_time, true); //结束时间
    this.logInitialState();
};

//恢复默认状态
SingleUserLogStore.prototype.dismiss = function() {
    this.resetState();
};

//展开关闭操作详情
SingleUserLogStore.prototype.toggleOperateDetail = function(userLog) {
    let curLog = _.find(this.auditLogList, userLogInformation => userLogInformation.sort_id === userLog.sort_id);
    curLog.detailShow = !curLog.detailShow;
};
SingleUserLogStore.prototype.getLogsBySearch = function() {
    this.logInitialState();
};

SingleUserLogStore.prototype.resetLogState = function() {
    this.logInitialState();
};

SingleUserLogStore.prototype.changUserIdKeepSearch = function() {
    this.isLoading = true;
    this.userOwnAppArray = [];
    this.selectedLogAppId = '';
    this.logInitialState();
};

// 获取单个用户审计日志的信息
SingleUserLogStore.prototype.getSingleAuditLogList = function(result) {
    this.isLoading = false;
    if (result.loading){
        this.logListLoading = 'loading';
    } else if (result.error){
        this.logListLoading = '';
        this.getUserLogErrorMsg = result.errorMsg;
    } else {
        this.getUserLogErrorMsg = '';
        this.logListLoading = '';
        this.auditLogList = this.auditLogList.concat(result.data.user_logs);
        this.curPage++;
        this.total = result.data.total;
        if (this.auditLogList.length < this.total) {
            this.listenScrollBottom = true;
        } else {
            this.listenScrollBottom = false;
        }
    }
};

//获取用户应用列表
SingleUserLogStore.prototype.getSingleUserAppList = function(obj) {
    if (obj.error) {
        this.logListLoading = '';
        this.getUserLogErrorMsg = obj.errorMsg || Intl.get('errorcode.53', '获取应用列表失败！');
    } else {
        this.selectedLogAppId = obj.appId;
        this.userOwnAppArray = obj.appList;
        if (obj.appId) {
            let matchSelectApp = _.find(obj.appList, item => item.app_id === obj.appId);
            if (matchSelectApp) {
                this.selectAppTerminals = matchSelectApp.terminals || [];
            }
        }
    }
};

SingleUserLogStore.prototype.setSelectedAppId = function(appId){
    let matchSelectApp = _.find(this.userOwnAppArray, item => item.app_id === appId);
    if (matchSelectApp) {
        this.selectAppTerminals = matchSelectApp.terminals || [];
    }
    this.selectedLogAppId = appId;
    ShareObj.share_differ_user_keep_app_id = this.selectedLogAppId;
};

// 记录搜索框中输入的内容
SingleUserLogStore.prototype.handleSearchEvent = function(searchName) {
    this.searchName = searchName;
};

// 根据时间选择日志
SingleUserLogStore.prototype.changeSearchTime = function({startTime,endTime,range}) {
    this.startTime = startTime;
    this.endTime = endTime;
    this.defaultRange = range;
};
// 选择終端类型
SingleUserLogStore.prototype.setAppTerminalsType = function(value) {
    this.appTerminalType = value;
};

//使用alt导出store
module.exports = alt.createStore(SingleUserLogStore , 'SingleUserLogStore');