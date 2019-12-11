var AppUserActions = require('../action/app-user-actions');
var ShareObj = require('../util/app-id-share-util');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
var AppUserUtil = require('../util/app-user-util');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import { storageUtil } from 'ant-utils';
import { packageTry } from 'LIB_DIR/func';
import publicPrivilege from 'PUB_DIR/privilege-const';
//app用户的store
function AppUserStore() {
    this.resetState();
    //绑定action方法
    this.bindActions(AppUserActions);
}

AppUserStore.prototype.resetState = function() {
    //是否处于loading状态
    this.appUserListResult = 'loading';
    //获取app列表错误信息
    this.getAppListErrorMsg = '';
    //应用数组
    this.appList = [];
    //获取应用失败的信息
    this.appListErrorMsg = '';
    //应用用户数组
    this.appUserList = [];
    //是否监听滚动
    this.listenScrollBottom = true;
    //用于下拉加载的userId
    this.lastUserId = '';
    //首先获取localStorage中保存的页数
    this.pageSize = 20;
    //应用用户总条数
    this.appUserCount = 0;
    //表单类型(添加/修改/空)
    this.appUserFormType = '';
    //是否显示右侧面板
    this.isShowRightPanel = false;
    //获取app用户列表错误信息
    this.getAppUserListErrorMsg = '';
    //要显示详情的用户
    this.detailUser = {};
    //添加app用户错误信息
    this.addAppUserErrorMsg = '';
    //选中的应用id(全部应用)
    this.selectedAppId = '';
    //右侧面板类型
    this.rightPanelType = 'detail';
    //选中的用户对象
    this.selectedUserRows = [];
    //选中的用户对象的副本，加载完新数据后，计算选中上一次已经选中的
    this.selectedUserRowsCopy = [];
    //输入框中的值
    this.keywordValue = '';
    //筛选区域是否是展开的
    this.filterAreaExpanded = false;
    //过滤字段的对应关系
    //键值对存储结构 user_type=xxx   outdate=xxx   user_status=xxx customer_unknown=xxx
    this.filterFieldMap = {};
    //角色过滤相关属性
    this.filterRoles = {
        //只有oplate成员有GET_USERLIST_BY_ROLE权限，才在界面上显示
        shouldShow: hasPrivilege(publicPrivilege.APP_QUERY_PERMISSION),
        //当前应用对应的角色列表
        roles: [],
        //选中的角色
        selectedRole: '',
        //角色当前处在的状态(loading,error,'')
        rolesResult: 'loading',
        //错误信息
        errorMsg: ''
    };
    //团队过滤相关属性
    this.filterTeams = {
        //当前团队的列表
        teamlists: [],
        //选中的团队列表
        selectedTeams: [],
        //角色当前处在的状态(loading,error,'')
        teamsResult: 'loading',
        //错误信息
        errorMsg: ''
    };
    //我能看的团队树列表
    this.teamTreeList = [];
    // 选中的用户数
    this.selectUserCount = 0;
    //是否是“从客户页面查看用户”点击跳转过来的，如果是，则customer_id有值
    this.customer_id = '';
    //排序字段
    this.sort_field = '';
    //排序顺序
    this.sort_order = '';
    // 安全域列表
    this.realmList = [];
    // 用户查询条件列表
    this.userConditions = [];
    //uem过滤字段的对应关系
    //键值对存储结构 user_type=xxx   outdate=xxx   user_status=xxx customer_unknown=xxx
    this.uemFilterFieldMap = {};
};
//恢复初始值
AppUserStore.prototype.setInitialData = function() {
    this.resetState();
};

//关键词改变
AppUserStore.prototype.keywordValueChange = function(keyword) {
    this.keywordValue = keyword;
    this.clearSelectedRows();
};

//FromAction-显示用户详情
AppUserStore.prototype.showUserDetail = function(user) {
    this.detailUser = user;
};

AppUserStore.prototype.showBatchOperate = function() {
    this.isShowRightPanel = true;
    this.rightPanelType = 'batch';
    this.detailUser = {};
};

//FromAction-获取App用户列表
AppUserStore.prototype.getAppUserList = function(result) {
    if(result.loading) {
        this.appUserListResult = 'loading';
        if(!this.lastUserId) {
            this.appUserList = [];
            this.listenScrollBottom = false;
        }
        //从客户页面跳转过来的，查看客户的用户的
        if(result.customer_id) {
            this.customer_id = result.customer_id;
        }
    } else if(result.error) {
        this.appUserListResult = 'error';
        this.getAppUserListErrorMsg = result.errorMsg;
        this.listenScrollBottom = false;
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
    } else {
        this.appUserListResult = '';
        var currentList = result.data.data || [];
        if(!_.isArray(currentList)) {
            currentList = [];
        }
        if(result.data.total > 0) {
            for(var i = 0, len = currentList.length; i < len; i++){
                currentList[i].isShownExceptionTab = (
                    _.find(currentList[i].apps, app => {return app.exception_mark_date;}) ? true : false
                );
            }
            if(!this.lastUserId) {
                this.appUserCount = result.data.total;
                if(typeof this.appUserCount === 'string') {
                    this.appUserCount = parseInt(this.appUserCount);
                }
            }
        } else if(!this.lastUserId) {
            this.appUserCount = 0;
        }
        //对是否还能下拉加载处理开始
        if(currentList.length >= this.pageSize && !('stopScroll' in result)) {
            this.listenScrollBottom = true;
        } else {
            this.listenScrollBottom = false;
            if ('stopScroll' in result){
                this.appUserList = this.appUserList.concat(currentList);
                this.selectedAppId = result.data.app_id;
            }
        }
        //对是否还能下拉加载处理结束
        if(currentList.length > 0 && !('stopScroll' in result)) {
            this.appUserList = this.appUserList.concat(currentList);
            this.lastUserId = _.get(this.appUserList, `[${this.appUserList.length - 1}].user.user_id`,'');
        }
        //为appUserList添加key字段
        this.appUserList.forEach(function(item) {
            item.key = item.user && item.user.user_id || _.uniqueId('user_list_');
        });
        //选中逻辑处理
        //上次选中了保存下来的备份
        var justSelected = _.map(this.selectedUserRowsCopy , (obj) => obj.user.user_id);
        //当前用户列表，抽取user_id数组
        var currentRowsUserIds = _.map(this.appUserList , (obj) => obj.user.user_id);
        //如果上次选中的，还在当前列表中，则是选中的
        var currentSelected = _.filter(justSelected , (user_id) => currentRowsUserIds.indexOf(user_id) >= 0);
        //保存selectedUserRows
        this.selectedUserRows = _.filter(this.appUserList , (item) => currentSelected.indexOf(item.user.user_id) >= 0);
        this.selectedUserRowsCopy = this.selectedUserRows.slice();
        //告诉外部，选中的行有变化
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE,this.selectedUserRows);
        //隐藏页面下拉加载滚动条
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
    }
};
//FromAction-设置选中的用户列表
AppUserStore.prototype.setSelectedUserRows = function(rows) {
    this.selectedUserRows = rows;
    this.selectUserCount = rows.length;
    this.selectedUserRowsCopy = rows.slice();
    //告诉外部，选中的行有变化
    setTimeout(() => {
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE,this.selectedUserRows);
    });
};
//清除刚才选中的行
AppUserStore.prototype.clearSelectedRows = function() {
    this.selectedUserRows = [];
    this.selectedUserRowsCopy = [];
    //告诉外部，选中的行有变化
    AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE,this.selectedUserRows);
};
//FromAction-设置下拉加载的
AppUserStore.prototype.setLastUserId = function(userId) {
    this.lastUserId = userId;
    //切换分页的时候，清除刚才选中的行
    this.clearSelectedRows();
};
//设置选中的appid
AppUserStore.prototype.setSelectedAppId = function(appId) {
    var oldSelectedAppId = this.selectedAppId;
    this.selectedAppId = appId;
    ShareObj.app_id = this.selectedAppId;
    this.selectedAppId = ShareObj.app_id;
    // this.selectedAppId 为空时，对应的是全部应用
    if(this.selectedAppId){
        let obj = AppUserUtil.getLocalStorageObj('logViewAppId',this.selectedAppId );
        storageUtil.local.set(AppUserUtil.saveSelectAppKeyUserId, JSON.stringify(obj));
    }
    this.lastUserId = '';
    //切换应用的时候，清除刚才选中的行
    this.clearSelectedRows();
    //如果是切换到全部应用，则清除筛选条件
    //如果是切换到全部应用，则去掉排序
    if(!appId) {
        this.filterFieldMap = {};
        this.uemFilterFieldMap = {};
        this.filterAreaExpanded = false;
    }
    //如果之前是全部应用，切换到某一个应用，并且没有排序条件，则默认按照开通时间倒序
    if(!oldSelectedAppId && appId && !this.sort_field && !this.sort_order) {
        this.sort_field = 'grant_create_date';
        this.sort_order = 'desc';
    }
    //切换应用之后，需要把上次选中的角色过滤的角色清除
    this.filterRoles.selectedRole = '';
};
//FromAction-获取app列表
AppUserStore.prototype.getAppList = function(obj) {
    if(obj.loading) {
        this.appList = _.isArray(ShareObj.share_app_list) ? ShareObj.share_app_list : [];
        this.selectedAppId = ShareObj.app_id || '';
    } else if(!obj.error) {
        this.appList = obj.result;
        ShareObj.share_app_list = this.appList;
        if(obj.selected_app_id) {
            this.selectedAppId = obj.selected_app_id;
            ShareObj.app_id = this.selectedAppId;
        }
    }else if (obj.error){
        this.appListErrorMsg = obj.result;
    }
};
//FromAction-直接显示没有用户数据
AppUserStore.prototype.showNoUserData = function() {
    //调用获取用户，设置列表为空，总数为0
    this.getAppUserList({
        data: {
            data: [],
            total: 0
        }
    });
};
//FromAction-显示App用户的表单
AppUserStore.prototype.showAppUserForm = function() {
    this.isShowRightPanel = true;
    this.rightPanelType = 'addOrEditUser';
    this.appUserFormType = 'add';
    this.detailUser = {};
};
//FromAction-隐藏App用户的表单
AppUserStore.prototype.closeRightPanel = function() {
    this.isShowRightPanel = false;
    this.appUserFormType = '';
    this.detailUser = {};
};
//FromAction-设置右侧面板类型
AppUserStore.prototype.setRightPanelType = function(type) {
    this.rightPanelType = type;
};

//从右侧面板更改（昵称，备注），同步到用户列表中
AppUserStore.prototype.updateUserInfo = function(userInfo) {
    var targetUser = _.find(this.appUserList , (singleUser) => {
        var userId = singleUser.user && singleUser.user.user_id;
        return userId === userInfo.user_id;
    });
    if(targetUser) {
        $.extend(targetUser.user , userInfo);
    }
};
// 用户生成线索客户之后，把刚才的用户的apps中的clue_created属性设置为true
AppUserStore.prototype.updateUserAppsInfo = function(userInfo) {
    var editUserId = userInfo.user && userInfo.user.user_id;
    var targetUser = _.find(this.appUserList , (singleUser) => {
        var userId = singleUser.user && singleUser.user.user_id;
        return userId === editUserId;
    });
    if (targetUser && _.isArray(targetUser.apps) && targetUser.apps.length === 1){
        //生成线索客户后，要在对应应用的字段上加上clue_created 属性为true
        targetUser.apps[0].clue_created = true;
    }
};

//从右侧面板更改“客户”。同步到用户列表中
AppUserStore.prototype.updateCustomerInfo = function({tag,customer_id,customer_name,user_id,sales_id,sales_name}) {
    var targetUser = _.find(this.appUserList , (singleUser) => {
        var userId = singleUser.user && singleUser.user.user_id;
        return userId === user_id;
    });
    if(targetUser) {
        targetUser.customer = targetUser.customer || {};
        targetUser.sales = targetUser.sales || {};
        targetUser.customer.customer_id = customer_id;
        targetUser.customer.customer_name = customer_name;
        targetUser.sales.sales_id = sales_id;
        targetUser.sales.sales_name = sales_name;
    }
};

//切换筛选区域展开状态
AppUserStore.prototype.toggleFilterExpanded = function() {
    this.filterAreaExpanded = !this.filterAreaExpanded;
};

//toggle搜索过滤条件
AppUserStore.prototype.toggleSearchField = function({field,value}) {
    var filterFieldMap = this.filterFieldMap;
    if(!value) {
        delete filterFieldMap[field];
        if(field === 'tag_all') {//标签筛选”全部“时，清空筛选对象中所有标签属性的值
            delete filterFieldMap.create_tag;
            delete filterFieldMap.contract_tag;
            delete filterFieldMap.qualify_label;
            delete filterFieldMap.tag_all;
        }
    } else {
        //如果是按团队搜索，按团队搜索支持多选
        if (field === 'team_ids'){
            !filterFieldMap[field] && (filterFieldMap.team_ids = []);
            //在已有团队列表中搜索当前选中的团队
            var index = filterFieldMap[field].indexOf(value);
            //如果原列表中有该团队，将其删除
            if (index >= 0 ){
                filterFieldMap[field].splice(index,1);
                //如果选中的团队为空，将该字段删掉
                filterFieldMap[field].length === 0 && (delete filterFieldMap[field]);
            }else{
                //如果原列表中没有该团队，将其加上
                filterFieldMap[field].push(value);
            }
        } else if(field === 'create_tag'){
            filterFieldMap.tag_all = value;
            filterFieldMap.create_tag = value;
            filterFieldMap.contract_tag = '';
            filterFieldMap.qualify_label = '';
        } else if(field === 'contract_tag'){
            filterFieldMap.tag_all = value;
            filterFieldMap.contract_tag = value;
            filterFieldMap.create_tag = '';
            filterFieldMap.qualify_label = '';
        } else if(field === 'qualify_label'){
            filterFieldMap.tag_all = value;
            filterFieldMap.qualify_label = value;
            filterFieldMap.create_tag = '';
            filterFieldMap.contract_tag = '';
        } else {
            filterFieldMap[field] = value;
        }

    }
    this.lastUserId = '';
};

//uem toggle搜索过滤条件
AppUserStore.prototype.uemToggleSearchField = function({field,value}) {
    var uemFilterFieldMap = this.uemFilterFieldMap;
    if(!value) {
        delete uemFilterFieldMap[field];

    } else {
        uemFilterFieldMap[field] = value;
    }
    this.lastUserId = '';
};

//更新一个用户的一个应用成功后，同步列表中的数据
AppUserStore.prototype.updateAppInfo = function(updateInfo) {
    //首先找到这个用户
    var target_user_id = updateInfo.user_id;
    var target_user = _.find(this.appUserList , (appUser) => appUser && appUser.user && appUser.user.user_id === target_user_id);
    if(target_user) {
        if(_.isArray(target_user.apps)) {
            //找到这个应用
            var updateAppInfo = updateInfo.app_info;
            var target_app_index = _.findIndex(target_user.apps , (app) => app && app.app_id === updateAppInfo.app_id);
            if(target_app_index >= 0) {
                //删掉旧的，填进去新的
                target_user.apps.splice(target_app_index , 1 , updateAppInfo);
            }
        }
    }
};

//全部停用之后，更新用户列表中的数据
AppUserStore.prototype.updateDisableAllApps = function(updateInfo) {
    //先找用户
    var target_user_id = updateInfo.user_id;
    var target_user = _.find(this.appUserList , (appUser) => appUser && appUser.user && appUser.user.user_id === target_user_id);
    if(target_user) {
        //将应用全部设置为禁用
        if(_.isArray(target_user.apps)) {
            _.each(target_user.apps , (app) => {
                app.is_disabled = 'true';
            });
        }
    }
};

//为用户添加新的应用之后，更新用户列表
AppUserStore.prototype.updateAddAppInfo = function(updateInfo) {
    //先找用户
    var target_user_id = updateInfo.user_id;
    var target_user = _.find(this.appUserList , (appUser) => appUser && appUser.user && appUser.user.user_id === target_user_id);
    if(target_user) {
        //如果是全部应用，把应用列表连接起来
        if(!this.selectedAppId) {
            if(_.isArray(target_user.apps)) {
                if(_.isArray(updateInfo.app_info_array))
                    target_user.apps = updateInfo.app_info_array.concat(target_user.apps).slice();
            }
        }
    }
};

//修改应用单个字段之后，更新用户列表中的数据
AppUserStore.prototype.updateAppField = function(result) {
    //修改的字段
    var appFields = [
        'status',
        'is_two_factor',
        'multilogin',
        'over_draft'
    ];
    //先找用户
    var target_user_id = result.user_id;
    var target_user = _.find(this.appUserList , (appUser) => appUser && appUser.user && appUser.user.user_id === target_user_id);
    if(target_user) {
        if(_.isArray(target_user.apps)) {
            var target_app = _.find(target_user.apps , (app) => app && app.app_id === result.client_id);
            if(target_app) {
                for(var i = 0, len = appFields.length; i < len; i++) {
                    var key = appFields[i];
                    //如果存在，则修改
                    if(key in result) {
                        //开通状态字段特殊处理
                        if(key === 'status') {
                            target_app.is_disabled = result[key] === '1' ? 'false' : 'true';
                        } else {
                            //其他字段直接赋值
                            target_app[key] = result[key];
                        }
                        break;
                    }
                }
            }
        }
    }
};

//表格排序改变
AppUserStore.prototype.changeTableSort = function(sorter) {
    this.sort_field = sorter && sorter.sort_field || '';
    this.sort_order = sorter && sorter.sort_order || '';
    this.lastUserId = '';
};

//显示申请用户的表单
AppUserStore.prototype.showApplyUserForm = function() {
    this.isShowRightPanel = true;
    this.rightPanelType = 'applyUser';
};

//批量推送，修改所属客户，更新用户列表
AppUserStore.prototype.batchPushChangeCustomer = function(result) {
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //获取要修改的userid数组
    var targetUserIds = _.map(tasks , 'taskDefine');
    //过滤掉userId非法数据(userId必须是一个字符串)
    targetUserIds = _.filter(targetUserIds , (userId) => typeof userId === 'string');
    //如果没有userIds，则不进行更新
    if(!targetUserIds.length) {
        return;
    }
    //对数组做哈希，加快遍历速度
    var targetUserIdsMap = _.keyBy(targetUserIds);
    //如果没有customer_id，则不进行更新
    if(!taskParams.data || !taskParams.data.customer_id) {
        return;
    }
    //改变后的客户id
    var changedCustomerId = taskParams.data.customer_id;
    //如果没有customer_name，则不进行更新
    if(!taskParams.extra || !taskParams.extra.customer_name) {
        return;
    }
    //改变后的客户名称
    var changedCustomerName = taskParams.extra.customer_name;
    //改变后的销售id(sales_id有可能为空)
    var changedSalesId = taskParams.extra.sales_id || '';
    //改变后的销售名称(sales_name有可能为空)
    var changedSalesName = taskParams.extra.sales_name || '';
    //遍历用户列表
    _.each(this.appUserList , (user) => {
        var user_id = user && user.user && user.user.user_id || '';
        //如果是当时批量修改操作的用户
        if(user_id && targetUserIdsMap[user_id]) {
            //更新客户数据
            if(user.customer) {
                user.customer.customer_id = changedCustomerId;
                user.customer.customer_name = changedCustomerName;
            }
            //更新销售数据
            if(user.sales) {
                user.sales.sales_id = changedSalesId;
                user.sales.sales_name = changedSalesName;
            }
        }
    });
};
//批量推送，修改用户类型，更新用户列表
AppUserStore.prototype.batchPushChangeGrantType = function(result) {
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //获取要修改的userid数组
    var targetUserIds = _.map(tasks , 'taskDefine');
    //过滤掉userId非法数据(userId必须是一个字符串)
    targetUserIds = _.filter(targetUserIds , (userId) => typeof userId === 'string');
    //如果没有userIds，则不进行更新
    if(!targetUserIds.length) {
        return;
    }
    //对数组做哈希，加快遍历速度
    var targetUserIdsMap = _.keyBy(targetUserIds);
    //获取要修改的应用
    var targetAppIds = taskParams.app_ids;
    //保证应用id是字符串
    targetAppIds = _.filter(targetAppIds , (app_id) => typeof app_id === 'string');
    //如果没有targetAppIds,则不进行更新
    if(!targetAppIds.length) {
        return;
    }
    //对应用做哈希，加快遍历速度
    var targetAppIdsMap = _.groupBy(targetAppIds);
    //如果没有用户类型，则不进行更新
    if(!taskParams.data || !taskParams.data.user_type) {
        return;
    }
    //修改后的用户类型
    var changedUserType = taskParams.data.user_type;
    //遍历用户列表
    _.each(this.appUserList , (user) => {
        var user_id = user && user.user && user.user.user_id || '';
        //如果是当时批量修改操作的用户
        if(user_id && targetUserIdsMap[user_id]) {
            var user_apps = user.apps;
            if(!_.isArray(user_apps)) {
                return;
            }
            _.each(user_apps , (app) => {
                var app_id = app && app.app_id || '';
                if(app_id && targetAppIdsMap[app_id]) {
                    app.user_type = changedUserType;
                }
            });
        }
    });
};

//批量推送，修改开通状态，更新用户列表
AppUserStore.prototype.batchPushChangeGrantStatus = function(result) {
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //获取要修改的userid数组
    var targetUserIds = _.map(tasks , 'taskDefine');
    //过滤掉userId非法数据(userId必须是一个字符串)
    targetUserIds = _.filter(targetUserIds , (userId) => typeof userId === 'string');
    //如果没有userIds，则不进行更新
    if(!targetUserIds.length) {
        return;
    }
    //对数组做哈希，加快遍历速度
    var targetUserIdsMap = _.keyBy(targetUserIds);
    //获取要修改的应用
    var targetAppIds = taskParams.app_ids;
    //保证应用id是字符串
    targetAppIds = _.filter(targetAppIds , (app_id) => typeof app_id === 'string');
    //如果没有targetAppIds,则不进行更新
    if(!targetAppIds.length) {
        return;
    }
    //对应用做哈希，加快遍历速度
    var targetAppIdsMap = _.groupBy(targetAppIds);
    //没有数据，不进行更新
    if(!taskParams.data) {
        return;
    }
    //修改后的开通状态(0或1)
    var changedUserStatus = taskParams.data.status + '';
    //如果不是已知的值，不进行更新
    if(changedUserStatus !== '0' && changedUserStatus !== '1') {
        return;
    }
    //推送之前用的值是0（关闭）和1（开启）
    if(changedUserStatus === '0') {
        //0对应disabled为true
        changedUserStatus = 'true';
    } else if(changedUserStatus === '1') {
        //1对应disabled为false
        changedUserStatus = 'false';
    }
    //遍历用户列表
    _.each(this.appUserList , (user) => {
        var user_id = user && user.user && user.user.user_id || '';
        //如果是当时批量修改操作的用户
        if(user_id && targetUserIdsMap[user_id]) {
            var user_apps = user.apps;
            if(!_.isArray(user_apps)) {
                return;
            }
            _.each(user_apps , (app) => {
                var app_id = app && app.app_id || '';
                if(app_id && targetAppIdsMap[app_id]) {
                    app.is_disabled = changedUserStatus;
                }
            });
        }
    });
};

//批量推送，修改开通时间，更新用户列表
AppUserStore.prototype.batchPushChangeGrantPeriod = function(result) {
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //获取要修改的userid数组
    var targetUserIds = _.map(tasks , 'taskDefine');
    //过滤掉userId非法数据(userId必须是一个字符串)
    targetUserIds = _.filter(targetUserIds , (userId) => typeof userId === 'string');
    //如果没有userIds，则不进行更新
    if(!targetUserIds.length) {
        return;
    }
    //对数组做哈希，加快遍历速度
    var targetUserIdsMap = _.keyBy(targetUserIds);
    //获取要修改的应用
    var targetAppIds = taskParams.app_ids;
    //保证应用id是字符串
    targetAppIds = _.filter(targetAppIds , (app_id) => typeof app_id === 'string');
    //如果没有targetAppIds,则不进行更新
    if(!targetAppIds.length) {
        return;
    }
    //对应用做哈希，加快遍历速度
    var targetAppIdsMap = _.groupBy(targetAppIds);
    //没有开始时间，结束时间，肯定不对，不进行更新
    if(!_.isObject(taskParams.data) || !('start_time' in taskParams.data) || !('end_time' in taskParams.data)) {
        return;
    }
    //修改后的开始时间容错处理,转换成整形
    var changedUserStartTime = taskParams.data.start_time;
    if(/^\d+$/.test(changedUserStartTime)) {
        changedUserStartTime = parseInt(changedUserStartTime);
    } else {
        changedUserStartTime = null;
    }
    //修改后的结束时间容错处理,转换成整形
    var changedUserEndTime = taskParams.data.end_time;
    if(/^\d+$/.test(changedUserEndTime)) {
        changedUserEndTime = parseInt(changedUserEndTime);
    } else {
        changedUserEndTime = null;
    }
    //遍历用户列表
    _.each(this.appUserList , (user) => {
        var user_id = user && user.user && user.user.user_id || '';
        //如果是当时批量修改操作的用户
        if(user_id && targetUserIdsMap[user_id]) {
            var user_apps = user.apps;
            if(!_.isArray(user_apps)) {
                return;
            }
            _.each(user_apps , (app) => {
                var app_id = app && app.app_id || '';
                if(app_id && targetAppIdsMap[app_id]) {
                    app.start_time = changedUserStartTime;
                    app.end_time = changedUserEndTime;
                }
            });
        }
    });
};

//批量推送，批量延期，更新用户列表
AppUserStore.prototype.batchPushChangeGrantDelay = function(result) {
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //获取要修改的userid数组
    var targetUserIds = _.map(tasks , 'taskDefine');
    //过滤掉userId非法数据(userId必须是一个字符串)
    targetUserIds = _.filter(targetUserIds , (userId) => typeof userId === 'string');
    //如果没有userIds，则不进行更新
    if(!targetUserIds.length) {
        return;
    }
    //对数组做哈希，加快遍历速度
    var targetUserIdsMap = _.keyBy(targetUserIds);
    //获取要修改的应用
    var targetAppIds = taskParams.app_ids;
    //保证应用id是字符串
    targetAppIds = _.filter(targetAppIds , (app_id) => typeof app_id === 'string');
    //如果没有targetAppIds,则不进行更新
    if(!targetAppIds.length) {
        return;
    }
    //对应用做哈希，加快遍历速度
    var targetAppIdsMap = _.groupBy(targetAppIds);
    //延期时间没有的话，就不更新了
    if(!taskParams.data || (!taskParams.data.delay && !taskParams.data.end_date)) {
        return;
    }
    //遍历用户列表
    _.each(this.appUserList , (user) => {
        var user_id = user && user.user && user.user.user_id || '';
        //如果是当时批量修改操作的用户
        if(user_id && targetUserIdsMap[user_id]) {
            var user_apps = user.apps;
            //没有应用就不更新了
            if(!_.isArray(user_apps)) {
                return;
            }
            _.each(user_apps , (app) => {
                var app_id = app && app.app_id || '';
                if(app_id && targetAppIdsMap[app_id]) {
                    var end_time = app.end_time;
                    if(/^\d+$/.test(end_time)) {
                        end_time = parseInt(end_time);
                        if(end_time > 0) {
                            if (taskParams.data) {
                                if (taskParams.data.delay) { // 延期时间
                                    app.end_time += taskParams.data.delay;
                                } else if (taskParams.data.end_date) { // 到期时间
                                    app.end_time = taskParams.data.end_date;
                                }
                            }

                        }
                    }
                }
            });
        }
    });
};

//批量推送，开通产品，更新用户列表
AppUserStore.prototype.batchPushChangeGrantUpdate = function(result) {
    //用户管理界面选中的应用
    var selectedAppId = this.selectedAppId;
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //获取要修改的userid数组
    var targetUserIds = _.map(tasks , 'taskDefine');
    //过滤掉userId非法数据(userId必须是一个字符串)
    targetUserIds = _.filter(targetUserIds , (userId) => typeof userId === 'string');
    //如果没有userIds，则不进行更新
    if(!targetUserIds.length) {
        return;
    }
    //对数组做哈希，加快遍历速度
    var targetUserIdsMap = _.keyBy(targetUserIds);
    if(!_.isObject(taskParams.data)) {
        return;
    }
    //添加/修改的应用列表
    var parseError = false;
    //products是json字符串
    var addOrEditAppsMap = taskParams.data.products;
    //解析json
    try {
        addOrEditAppsMap = JSON.parse(addOrEditAppsMap);
    } catch(e){
        parseError = true;
    }
    //解析出错，不更新列表
    if(parseError) {
        return;
    }

    //更新已经存在的应用
    function updateAppProps(targetEditApp) {
        //更新开始时间
        if('start_time' in taskParams.data) {
            targetEditApp.start_time = /^\d+$/.test(taskParams.data.start_time) ? parseInt(taskParams.data.start_time) : null;
        }
        //更新结束时间
        if('end_time' in taskParams.data) {
            targetEditApp.end_time = /^\d+$/.test(taskParams.data.end_time) ? parseInt(taskParams.data.end_time) : null;
        }
        //更新是否启用
        if('status' in taskParams.data) {
            var statusText = taskParams.data.status + '';
            if(statusText === '0') {
                targetEditApp.is_disabled = 'true';
            } else if(statusText === '1') {
                targetEditApp.is_disabled = 'false';
            }
        }
        //更新user_type
        if('user_type' in taskParams.data) {
            targetEditApp.user_type = taskParams.data.user_type;
        }
    }


    //如果用户界面选中了应用
    if(selectedAppId) {
        //如果修改的不是选中的应用，则什么都不做
        if(!addOrEditAppsMap[selectedAppId]){
            return;
        }
        //只更新选中的应用的四个属性（开始、结束、用户类型、是否启用）
        //遍历用户列表
        _.each(this.appUserList , (user) => {
            var user_id = user && user.user && user.user.user_id || '';
            //如果是当时批量修改操作的用户
            if(user_id && targetUserIdsMap[user_id]) {
                //应用数组
                var user_apps = user.apps;
                //没有应用就不更新了
                if(!_.isArray(user_apps)) {
                    return;
                }
                //找到这个应用
                var targetEditApp = _.find(user_apps , (app) => app.app_id === selectedAppId);
                //找不到就不更新了
                if(!targetEditApp) {
                    return;
                }
                updateAppProps(targetEditApp);
            }
        });
    } else {
        //全部应用的时候，情况比较复杂
        //如果用户有这个应用，则更新这个应用
        //如果用户没有这个应用，则添加这个应用
        //遍历用户列表
        _.each(this.appUserList , (user) => {
            var user_id = user && user.user && user.user.user_id || '';
            //如果是当时批量修改操作的用户
            if(user_id && targetUserIdsMap[user_id]) {
                //保证user.apps是个数组
                if(!_.isArray(user.apps)) {
                    user.apps = [];
                }
                //已存在的应用数组
                var user_apps = user.apps;
                //添加/修改 的应用遍历
                _.each(addOrEditAppsMap , (appRolesPermissions , appId) => {
                    //查找是否已经添加了这个应用
                    var targetApp = _.find(user_apps , (app) => app.app_id === appId);
                    //添加了的应用直接更新
                    if(targetApp) {
                        updateAppProps(targetApp);
                    } else {
                    //没有添加的应用，先创建，再添加
                        var app_name = '';
                        //在应用列表中根据Id找到应用
                        var appWithName = _.find(this.appList , (app) => app.app_id === appId);
                        //记录app_name
                        if(appWithName) {
                            app_name = appWithName.app_name;
                        }
                        var newApp = {
                            app_id: appId,
                            app_name: app_name,
                            create_time: new Date().getTime(),
                            start_time: null,
                            end_time: null,
                            is_disabled: null,
                            user_type: null
                        };
                        //更新应用信息
                        updateAppProps(newApp);
                        //添加到user.apps中
                        user.apps.push(newApp);
                    }
                });
            }
        });
    }
};

/**
 *
 *

 params.data:
     customer:"36n90ur3nm_78bf5300-b73c-4b44-88eb-5d884dd9f6d1"
     description:"我是一个粉刷匠"
     email:"helloworld@sina.com"
     group_id:"36n90ur3nm_group36cgis3qc33SiVg4qq4kVbiH0JPDaD7V2"
     nick_name:"helloworld"
     number:"1"
     phone:"15550029302"
     products:"[{"client_id":"36n90ur3nm36d4u4t6135Y4bS1XO4j7bHd0tOWb1AGd",
     roles:[],"permissions":[],"status":"1","over_draft":"1","begin_date":"1485187200000",
     end_date:"1485792000000","is_two_factor":"1","user_type":Intl.get("common.trial.user", "试用用户"),"mutilogin":"1"}]"
     user_name:"helloworld"

 params.extra :
     customer_name:"36n90ur3nm_78bf5300-b73c-4b44-88eb-5d884dd9f6d1"
     sales_id:"3722pgujaa36fik9lm23kEjdGdqt4r98Km0dRlGzXVS"
     sales_name:"l9sale11"

 tasks:
 [
   {
      taskDefine:"36n90ur3nm369d073l80A0O1s7hm4uWbtR0v8aJHUM7",
      taskDetail:{
          userName:"helloworld"
      }
   }
 ]
 */
//批量推送，添加用户，更新用户列表
AppUserStore.prototype.batchPushChangeUserCreate = function(result) {
    //获取任务信息，java端推送过来的
    var taskInfo = result.taskInfo;
    //获取当时提交的参数，前端自己保存的
    var taskParams = result.taskParams;
    //如果更新必要参数没找到，则不进行更新
    if(!taskInfo || !taskParams) {
        return;
    }
    //获取任务列表
    var tasks = taskInfo.tasks;
    //对tasks正确性进行过滤
    tasks = _.filter(tasks , (task) => {
        if(task && _.isString(task.taskDefine) && _.isObject(task.taskDetail) && _.isString(task.taskDetail.userName)){
            return true;
        }
    });
    //如果任务列表为空，也不进行更新
    if(!_.isArray(tasks) || tasks.length === 0) {
        return;
    }
    //创建用户提交数据
    var taskParamsData = taskParams.data;
    //创建用户推送更新额外数据
    var taskParamsExtra = taskParams.extra;
    //如果缺少data和extra，不进行更新
    if(!_.isObject(taskParamsData) || !_.isObject(taskParamsExtra)) {
        return;
    }
    _.each(tasks,(task) => {
        var userName = task.taskDetail.userName;
        var userId = task.taskDefine;
        var userObj = {
            user: {
                user_id: userId,
                user_name: userName,
                nick_name: taskParamsData.number === '1' ? taskParamsData.nick_name : '',
                description: taskParamsData.description
            },
            key: userId,
            sales: {
                sales_id: taskParamsExtra.sales_id,
                sales_name: taskParamsExtra.sales_name
            },
            customer: {
                customer_id: taskParamsData.customer,
                customer_name: taskParamsExtra.customer_name
            },
            apps: []
        };
        var userApps = [];
        //解析json出错，就不更新了
        packageTry(() => {
            userApps = JSON.parse(taskParamsData.products);
        });
        //针对每个应用处理
        _.each(userApps , (app) => {
            var appName = '';
            var tmpApp = _.find(this.appList , (item) => item.app_id === app.client_id);
            if(tmpApp) {
                appName = tmpApp.app_name;
            }
            //开始时间
            var start_time = '';
            if(/^\d+$/.test(app.begin_date)) {
                start_time = parseInt(app.begin_date);
            }
            //结束时间
            var end_time = '';
            if(/^\d+$/.test(app.end_date)) {
                end_time = parseInt(app.end_date);
            }
            //是否禁用
            var is_disabled = '';
            if(/^\d+$/.test(app.status)) {
                is_disabled = app.status === '1' ? 'false' : 'true';
            }
            //生成应用对象
            var newApp = {
                app_id: app.client_id,
                app_name: appName,
                create_time: new Date().getTime(),
                start_time: start_time,
                end_time: end_time,
                user_type: app.user_type,
                is_disabled: is_disabled
            };
            userObj.apps.push(newApp);
        });
        this.appUserList.unshift(userObj);
    });
};



//根据应用id获取角色信息，用于在界面上“显示过滤角色”的列表
/**
 *
 *this.filterRoles = {
 *     //当前应用对应的角色列表
 *     roles : [],
 *     //选中的角色
 *     selectedRole : '',
 *     //角色当前处在的状态(loading,error,'')
 *     rolesResult : 'loading',
 *     //出错后的错误提示
 *     errorMsg : ''
 *};
 */
AppUserStore.prototype.getRolesByAppId = function(result) {
    var filterRoles = this.filterRoles;
    if(result.loading) {
        filterRoles.roles = [];
        filterRoles.rolesResult = 'loading';
        filterRoles.errorMsg = '';
    } else if(result.error) {
        filterRoles.roles = [];
        filterRoles.rolesResult = 'error';
        filterRoles.errorMsg = result.errorMsg;
    } else {
        filterRoles.roles = result.roleList;
        filterRoles.rolesResult = '';
        filterRoles.errorMsg = '';
    }
};
//团队过滤相关属性
/**
 *this.filterTeams = {
    //是否都有权限查看团队
    shouldShow: '',
    //当前团队的列表
    teamlists:[],
    //选中的团队列表
    selectedTeams:[],
    //角色当前处在的状态(loading,error,'')
    rolesResult : 'loading',
    //错误信息
    errorMsg : ''
};
 * */


//获取团队列表信息
AppUserStore.prototype.getTeamLists = function(result) {
    var filterTeams = this.filterTeams;
    if (result.loading){
        filterTeams.teamlists = [];
        filterTeams.teamsResult = 'loading';
        filterTeams.errorMsg = '';
    }else if (result.errorMsg){
        filterTeams.teamlists = [];
        filterTeams.teamsResult = 'error';
        filterTeams.errorMsg = result.errorMsg;
    }else{
        filterTeams.teamsResult = '';
        filterTeams.errorMsg = '';
        filterTeams.teamlists = result.teamList;
        this.teamTreeList = result.teamTreeList;
    }
};

//根据角色过滤用户
AppUserStore.prototype.filterUserByRole = function(role_id) {
    //有角色查询的时候，不能再查询过滤条件和关键词，不能再排序
    if(role_id) {
        this.filterFieldMap = {};
        this.keywordValue = '';
    }
    this.filterRoles.selectedRole = role_id;
    this.lastUserId = '';
};

// 安全域列表
AppUserStore.prototype.getRealmList = function(result) {
    if (result && result.error) {
        this.realmList = [];
    } else {
        this.realmList = result && result.list || [];
    }
};

// 用户查询的条件列表
AppUserStore.prototype.getUserCondition = function(result) {
    if(result && result.error){
        this.userConditions = [];
    }else {
        this.userConditions = result && result.list || [];
    }
};

//使用alt导出store
module.exports = alt.createStore(AppUserStore , 'AppUserStore');
