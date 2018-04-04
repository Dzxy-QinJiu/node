var EventEmitter = require("events");
var CryptoJS = require("crypto-js");
var classNames = require("classnames");
var UserData = require('../../../../public/sources/user-data').getUserData();
import { ALL_LOG_INFO } from "PUB_DIR/sources/utils/consts";
const storageUtil = require("LIB_DIR/utils/storage-util.js");
//缓存在localStorage中的用户列表每页多少条的key
exports.localStorageUserViewPageSizeKey = 'app_user_manage.user_view.page_size';
//缓存在localStorage中的客户对应的用户列表每页多少条的key
exports.localStorageCustomerViewPageSizeKey = 'app_user_manage.customer_view.page_size';
//缓存在localStorage中的用户审计日志列表每页多少条的key
exports.localStorageLogViewPageSizeKey = 'app_user_manage.log_view.page_size';
// 审计日志和在线用户选择应用时，将应用保存到localStorage中，将当前用户user_id作为key
exports.saveSelectAppKeyUserId = JSON.stringify(UserData ? UserData.user_id : "");
// 获取存储在localStorage中的审计日志和在线用户应用的对象
exports.getLocalStorageObj = function (property ,selectApp){
    let localObj = {};
    let localValue = storageUtil.get(JSON.stringify(UserData ? UserData.user_id : ""));
    if(localValue){
        localObj =  JSON.parse(localValue);
    }
    localObj[property] = selectApp;
    return localObj;
};

//emitter使用的事件提取常量
exports.EMITTER_CONSTANTS = {
    //更新用户基本信息
    UPDATE_USER_INFO : 'updateUserInfo',
    //更新用户的客户信息
    UPDATE_CUSTOMER_INFO : 'updateCustomerInfo',
    //重新获取用户列表
    FETCH_USER_LIST : 'fetchUserList',
    //移除表格当前行样式
    REMOVE_CURRENT_ROW_CLASS : 'removeCurrentRowClass',
    //编辑单个应用
    UPDATE_APP_INFO : "updateAppInfo",
    //全部停用
    UPDATE_DISABLE_ALL_APPS : "updateDisableAllApps",
    //添加应用之后，更新应用列表
    UPDATE_ADD_APP_INFO : "updateAddAppInfo",
    //向右滑动面板
    PANEL_SWITCH_RIGHT : "panelSwitchRight",
    //向左滑动面板
    PANEL_SWITCH_LEFT : "panelSwitchLeft",
    //更新应用单个字段
    UPDATE_APP_FIELD : "updateAppField",
    //选中的行改变
    SELECTED_USER_ROW_CHANGE : "selectedUserRowChange",
	//用户列表滚动条置顶
    CHANGE_USER_LIST_SCROLL_TOP : "changeUserListScrollTop",
    //回复列表滚动到最后
    REPLY_LIST_SCROLL_TO_BOTTOM : "replyListScrollToBottom"
};

//获取当前视图
exports.getCurrentView = function() {
    //当前界面视图
    var currentView = "user";
    //从href中获取
    if (window.location.href.indexOf("/user/log") >= 0){
        currentView = "log";
    }
    return currentView;
};
//根据user_id从用户列表中找到一个具体的用户
exports.getUserByFromUserList = function(userList,userId){
    return _.find(userList , function(item) {
        return item.user.user_id == userId;
    }) || {};
};
//右侧面板固定高度常量
exports.LAYOUT_CONSTANTS = {
    TOP_DELTA : 69,
    BOTTOM_DELTA : 26
};
// 单个用户的日志面板固定高度常量
exports.USER_LOG_LAYOUT_CONSTANTS = {
    TOP_DELTA: 135,
    BOTTOM_DELTA: 26,
};
//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();
//获取客户对应的用户的类型(转试用、转正式)
exports.getCustomerUserType = function() {
    var types = window.location.href.match(/\/(try|formal)\//);
    return types && types[1];
};


//用户类型常量(数据库中的值)
const USER_TYPE_VALUE_MAP = {
    TRIAL_USER : "试用用户", //试用
    SIGN_USER : "正式用户", //签约
    PRESENT_USER : "special", //赠送
    TRAINING_USER : "training",//培训
    EMPLOYEE_USER : "internal"//员工
};

//用户类型文本的map
const USER_TYPE_TEXT_MAP = {
    TRIAL_USER : Intl.get("common.trial", "试用"),
    SIGN_USER : Intl.get("common.official", "签约"),
    PRESENT_USER : Intl.get("user.type.presented", "赠送"),
    TRAINING_USER : Intl.get("user.type.train", "培训"),
    EMPLOYEE_USER : Intl.get("user.type.employee", "员工")
};

//用户类型的值常量
exports.USER_TYPE_VALUE_MAP = USER_TYPE_VALUE_MAP;
//用户类型的文本常量
exports.USER_TYPE_TEXT_MAP = USER_TYPE_TEXT_MAP;

//根据数据库中保存的值，获取用户类型的文本
function getUserTypeText(user_type_value){
    var KEY = _.findKey(USER_TYPE_VALUE_MAP , (value) => value === user_type_value);
    return KEY && USER_TYPE_TEXT_MAP[KEY] || '';
}
exports.getUserTypeText = getUserTypeText;

//批量操作权限
var BATCH_PRIVILEGE = {
    //管理员有批量管理用户的权限
    ADMIN : "USER_BATCH_OPERATE",
    SALES : "GRANT_DELAY_APPLY",
    //批量开通、修改应用
    BATCH_GRANT_APPLICATION : "BATCH_GRANT_APPLICATION",
    //批量延期
    BATCH_UPDATE_GRANT_DELAY : "BATCH_UPDATE_GRANT_DELAY",
    //批量修改开通时间
    BATCH_UPDATE_GRANT_PERIOD : "BATCH_UPDATE_GRANT_PERIOD",
    //批量修改角色
    BATCH_UPDATE_GRANT_ROLES : "BATCH_UPDATE_GRANT_ROLES",
    //批量修改开通状态
    BATCH_UPDATE_GRANT_STATUS : "BATCH_UPDATE_GRANT_STATUS",
    //批量修改类型
    BATCH_UPDATE_GRANT_TYPE : "BATCH_UPDATE_GRANT_TYPE",
    //批量修改用户所属客户
    BATCH_UPDATE_USER_CUSTOMER : "BATCH_UPDATE_USER_CUSTOMER",
    //批量修改密码
    BATCH_UPDATE_USER_PASSWORD : "BATCH_UPDATE_USER_PASSWORD",

};

//导出批量操作权限
exports.BATCH_PRIVILEGE = BATCH_PRIVILEGE;

//整合task保存的参数，有一些额外信息，是不需要发送到服务端的
/**
 * @param batch_data 批量操作，发送给服务端的数据
 * @param app_id     应用id
 * @param extranInfo 额外信息，不发给服务器，但是更新页面的时候会用到
 */
function formatTaskParams(batch_data , app_id , extranInfo) {
    var app_ids = [];
    if(app_id) {
        if(_.isArray(app_id)) {
            app_ids = app_id.slice();
        } else if(_.isString(app_id)){
            if(/^\[.*\]$/.test(app_id)) {
                try {
                    app_ids = JSON.parse(app_id);
                }catch(e){}
            } else {
                app_ids = [app_id];
            }
        }
    }
    var dataParams = $.extend(true,{},batch_data);
    delete dataParams.user_ids;
    var extra = $.extend(true,{},extranInfo);
    var taskParams = {
        data : dataParams,
        app_ids : app_ids,
        extra : extra
    };
    return taskParams;
}

//整合task保存的参数，有一些额外信息，是不需要发送到服务端的
exports.formatTaskParams = formatTaskParams;

//用户表格中，获取应用名称的列表
exports.getAppNameList = function(apps,rowData) {
    let appList = [];
    if(_.isArray(apps)){
        let cls = classNames({
            app_ellipsis : apps.length > 1
        });
        appList = apps.map(function(app, i) {
            return (
                <li key={i} className={cls} title={app.app_name}>
                    {app.app_name}
                </li>
            );
        });
    }
    return (
        <ul className="appList">
            {appList}
        </ul>
    );
};

//用户表格中，获取用户类型的列表
exports.getAccountTypeList = function(apps,rowData) {
    let appList = [];
    if(_.isArray(apps)){
        let cls = classNames({
            app_ellipsis : apps.length > 1
        });
        appList = apps.map(function(app, i) {
            var text = getUserTypeText(app.user_type);
            return (
                <li key={i} className={cls} title={text}>
                    {text ? text : <span>&nbsp;</span>}
                </li>
            );
        });
    }
    return (
        <ul className="appList">
            {appList}
        </ul>
    );
};

//用户表格中，获取时间的列表
exports.getTimeList = function(field,rowData) {
    let apps = rowData ? rowData.apps : [];
    let appList = [];
    if(_.isArray(apps)){
        let cls = classNames({
            app_ellipsis : apps.length > 1
        });
        appList = apps.map(function(app, i) {
            let time = moment(new Date(+app[field])).format(oplateConsts.DATE_FORMAT);
            if(time === 'Invalid date') {
                time = Intl.get("common.unknown", "未知");
            }
            if(app[field] == 0) {
                time = Intl.get("user.nothing", "无");
            }
            return (
                <li key={i} className={cls} title={time}>
                    {time}
                </li>
            );
        });
    }
    return (
        <ul className="appList">
            {appList}
        </ul>
    );
};
//用户表格中，获取用户状态的列表
exports.getAppStatusList = function(apps,rowData) {
    let appList = [];
    if(_.isArray(apps)){
        let cls = classNames({
            app_ellipsis : apps.length > 1
        });
        appList = apps.map(function(app, i) {
            var text = app.is_disabled === true || app.is_disabled === 'true' ? Intl.get("common.stop", "停用"): (app.is_disabled === false || app.is_disabled === 'false'? Intl.get("common.enabled", "启用"): '');
            var disabled = (text === Intl.get("common.stop", "停用") ? 'is_disabled':'');
            return (
                <li key={i} className={cls +' '+ disabled} title={text}>
                    {text ? text : <span>&nbsp;</span>}
                </li>
            );
        });
    }
    return (
        <ul className="appList">
            {appList}
        </ul>
    );
};

// 审计日志和单个用户审计日志中，过滤心跳服务和角色权限多选框中全部和其他选项的处理
exports.handleFilterLogOptions = (option) => {
    const optionLength = option.length;
    const firstItem = option[0];
    const lastItem = option[optionLength - 1];

    if (optionLength === 0 || lastItem === ALL_LOG_INFO) {
        option = ALL_LOG_INFO;
    } else if (firstItem === ALL_LOG_INFO) {
        option.shift();
    }
    return option;
};