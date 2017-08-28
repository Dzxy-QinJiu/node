var AppUserUtil = require("../util/app-user-util");
var UserApplyActions = require("../action/user-apply-actions");
const FORMAT = oplateConsts.DATE_FORMAT;

//用户审批界面使用的store
function UserApplyStore() {
    //初始化state数据
    this.resetState();
    //绑定action
    this.bindActions(UserApplyActions);
}

//初始化数据
UserApplyStore.prototype.resetState = function () {
    //分页相关
    this.pagination = {
        current: 1,
        total: 0,
        pageSize: 20
    };
    //申请列表
    this.applyListObj = {
        // "" loading error
        loadingResult: "loading",
        //获取的列表
        list: [],
        //错误信息
        errorMsg: ""
    };
    //默认进去显示"申请列表"，筛选过后，再显示具体的标签
    this.ifClickedFilterLabel = false;
    //左侧选中的要查看详情的项
    this.selectedDetailItem = {};
    //选中的查看详情的数组下标
    this.selectedDetailItemIdx = -1;
    //用户审批关键字
    this.searchKeyword = '';
    //保存上次的关键字
    this.oldSearchKeyword = '';
    //默认不显示输入框
    this.searchInputShow = false;
    //筛选类别 all(全部) pass(已通过) reject(已驳回)  false(待审批)
    this.applyListType = 'all';
    //是否显示更新数据提示
    this.showUpdateTip = false;
    // 下拉加载
    this.listenScrollBottom = true;
    //记录所有apps
    this.allApps = [];
};

//是否显示更新数据提示,flag:true/false
UserApplyStore.prototype.setShowUpdateTip = function (flag) {
    this.showUpdateTip = flag;
};

//获取申请列表
UserApplyStore.prototype.getApplyList = function (obj) {
    if (obj.loading) {
        this.applyListObj.loadingResult = 'loading';
        this.applyListObj.errorMsg = '';
    } else if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        this.applyListObj.errorMsg = obj.errorMsg;
    } else {
        this.applyListObj.loadingResult = '';
        if (this.pagination.current == 1) {
            this.applyListObj.list = obj.data.result;
            this.selectedDetailItem = this.applyListObj.list[0];
            this.selectedDetailItemIdx = 0;
        } else {
            this.applyListObj.list = this.applyListObj.list.concat(obj.data.result);
        }
        this.pagination.current++;
        this.pagination.total = obj.data.total;
        this.applyListObj.errorMsg = '';
    }
};
//根据id获取申请
UserApplyStore.prototype.getApplyById = function (obj) {
    if (obj.error) {
        this.applyListObj.loadingResult = 'error';
        this.applyListObj.errorMsg = obj.errorMsg;
    } else {
        if (obj.loading) {
            this.applyListObj.loadingResult = 'loading';
            this.applyListObj.errorMsg = '';
        } else {
            this.applyListObj.loadingResult = '';
            this.applyListObj.list = this.applyListObj.list.concat(obj.data.detail);
            //获取单个申请时，走的获取申请详情的接口，这里记录下获取回来的所有app的信息
            this.allApps = obj.data.apps;
            if (this.pagination.current == 1) {
                this.selectedDetailItem = this.applyListObj.list[0];
                this.selectedDetailItemIdx = 0;
            }
            this.pagination.total = 1;
            this.applyListObj.errorMsg = '';
        }
    }
};
//分页改变
UserApplyStore.prototype.paginationChange = function (page) {
    this.pagination.current = page;
    this.applyListObj.list = [];
    this.listenScrollBottom = true;
};

// 下拉加载
UserApplyStore.prototype.changeListenScrollBottom = function (flag) {
    this.listenScrollBottom = flag;
};

//更改用户审批筛选类型
UserApplyStore.prototype.changeApplyListType = function (type) {
    this.applyListType = type;
    this.paginationChange(1);
    this.ifClickedFilterLabel = true;
    this.showUpdateTip = false;
};

//输入框的值改变
UserApplyStore.prototype.changeSearchInputValue = function (value) {
    this.searchKeyword = value;
    this.paginationChange(1);
    this.showUpdateTip = false;
};

//设置当前要查看详情的申请
UserApplyStore.prototype.setSelectedDetailItem = function ({obj, idx}) {
    this.selectedDetailItem = obj;
    this.selectedDetailItemIdx = idx;
};
//使用alt导出store
module.exports = alt.createStore(UserApplyStore, 'UserApplyStore');