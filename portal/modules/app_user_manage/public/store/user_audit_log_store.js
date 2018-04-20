var UserAuditLogAction = require("../action/user_audit_log_action");
var ShareObj = require("../util/app-id-share-util");
var DateSelectorUtils = require("../../../../components/datepicker/utils");
var AppUserUtil = require("../util/app-user-util");
import { ALL_LOG_INFO, AUDIT_LOG} from "PUB_DIR/sources/utils/consts";
import { storageUtil } from "ant-utils";
// 用户审计日志的store
function UserAuditLogStore(){
    this.resetState();
    // bindActions()将action与store绑定到一起
    this.bindActions(UserAuditLogAction);
}
UserAuditLogStore.prototype.resetAuditLog = function () {
    //是否是第一次加载，第一次加载的时候
    this.firstLoading = true;
    //是否处于loading状态
    this.appUserListResult = "loading";
    // 获取用户日志
    this.auditLogList = [];
    // 当前数据最后一条数据的id
    this.sortId = '';
    // 获取用户审计日志出错的处理
    this.getUserLogErrorMsg = "";
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
},
UserAuditLogStore.prototype.resetState = function () {
    // 今天
    var timeObj = DateSelectorUtils.getTodayTime();
    //开始时间
    this.startTime = DateSelectorUtils.getMilliseconds(timeObj.start_time);
    //结束时间
    this.endTime = DateSelectorUtils.getMilliseconds(timeObj.end_time, true);
    // 获取用户的应用信息是数组
    this.userAppArray = [];
    //选中用户的应用产品
    this.selectAppId = '';
    // 记录input框中的输入的内容
    this.searchName = '';
    this.resetAuditLog();
},
// 获取应用产品的信息
UserAuditLogStore.prototype.getUserApp = function(result){
   if (result.error){
        this.getUserLogErrorMsg = result.errorMsg;
    } else {
       this.userAppArray = result.data;
       var storageValue = JSON.parse(storageUtil.local.get(AppUserUtil.saveSelectAppKeyUserId));
       var lastSelectAppId = storageValue && storageValue.logViewAppId ?  storageValue.logViewAppId : '';
       if(lastSelectAppId){
           //缓存中存在最后一次选择的应用，直接查看该应用的审计日志
           this.selectAppId=lastSelectAppId;
       }else{
             // 不存在（首次）
           if(ShareObj.app_id){
                // 已有用戶有选择的应用时，用户审计日志也要展示该应用的
               this.selectAppId = ShareObj.app_id;
           }else{
                // 已有用户应用选择框中选择全部时，用户审计日志默认展示第一个应用的
               if( _.isArray(this.userAppArray) && (this.userAppArray.length >= 1) ){
                   this.selectAppId = this.userAppArray[0].app_id;
               }
           }
       }
       
    }
};

// 获取用户审计日志的信息
UserAuditLogStore.prototype.getAuditLogList = function (result) {
    if (result.loading){
        this.appUserListResult = "loading";
        this.getUserLogErrorMsg = "";
    }else if (result.error){
        this.appUserListResult = "";
        this.getUserLogErrorMsg = result.errorMsg;
    } else {
        this.firstLoading = false;
        this.appUserListResult = "";
        this.getUserLogErrorMsg = "";
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
UserAuditLogStore.prototype.handleSearchEvent = function (searchName) {
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
    this.selectAppId = appId;
    ShareObj.app_id = this.selectAppId;
    let obj = AppUserUtil.getLocalStorageObj('logViewAppId', this.selectAppId );
    storageUtil.local.set(AppUserUtil.saveSelectAppKeyUserId, JSON.stringify(obj));
    this.sortId = '';
    this.firstLoading = true;
    this.auditLogList = [];
};

// 设置排序参数
UserAuditLogStore.prototype.setSort = function(sorter){
    this.sortField = sorter && sorter.sortField ;
    this.sortOrder = sorter && sorter.sortOrder;
    this.sortId = '';
    this.auditLogList = [];
};
// 刷新审计日志列表
UserAuditLogStore.prototype.handleRefresh = function(){
    this.resetAuditLog();
};

// 用户类型的过滤
UserAuditLogStore.prototype.handleFilterUserType = function () {
    this.sortId = '';
    this.auditLogList = [];
    this.firstLoading = true;
};

// 过滤日志类型
UserAuditLogStore.prototype.handleFilterLogType = function () {
    this.sortId = '';
    this.auditLogList = [];
    this.firstLoading = true;
};

module.exports = alt.createStore(UserAuditLogStore);