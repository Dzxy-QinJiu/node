var AppUserCustomerSwitchActions = require("../action/app-user-customer-switch-actions");
var AppUserUtil = require("../util/app-user-util");
import { storageUtil } from "ant-utils";

//客户对应的用户的store
function AppUserCustomerSwitchStore() {
    //恢复默认值
    this.resetState();
    //绑定action方法
    this.bindActions(AppUserCustomerSwitchActions);
}

//恢复默认值
AppUserCustomerSwitchStore.prototype.resetState = function() {
    //是否是第一次加载，第一次加载的时候
    this.firstLoading = true;
    //是否处于loading状态
    this.customerUserListResult = "loading";
    //客户对应的用户数组
    this.customerUserList = [];
    //客户信息
    this.customerInfo = {};
    //客户对应的用户翻页页数
    this.customerUserPage = 1;
    //首先获取localStorage中保存的页数
    this.pageSize = parseInt(storageUtil.local.get(AppUserUtil.localStorageCustomerViewPageSizeKey));
    if(!this.pageSize || !_.isNumber(this.pageSize) || isNaN(this.pageSize)) {
        this.pageSize = 20;
    }
    //客户对应的用户总条数
    this.customerUserCount = 0;
    //是否显示右侧面板
    this.isShowRightPanel = false;
    //获取客户对应的用户的错误提示
    this.getCustomerUserListErrorMsg = "";
    //关键词
    this.searchKeyword = '';
    //窗口高度
    this.windowHeight = $(window).height();
    //选中的用户对象
    this.selectedCustomerUserRows = [];
};

//FromAction-获取客户基本信息
AppUserCustomerSwitchStore.prototype.getCustomerInfo = function(customerInfo) {
    this.customerInfo = customerInfo;
};

//FromAction-获取客户对应的用户信息
AppUserCustomerSwitchStore.prototype.getCustomerUserList = function(result) {
    this.selectedCustomerUserRows = [];
    if (result.loading) {
        this.customerUserListResult = "loading";
    } else if (result.error) {
        this.firstLoading = false;
        this.customerUserListResult = "error";
        this.getCustomerUserListErrorMsg = result.errorMsg;
    } else {
        this.firstLoading = false;
        this.customerUserListResult = "";
        this.customerUserList = result.data.data;
        this.customerUserCount = result.data.list_size;
    }
};
//FromAction-设置用户列表翻页页数
AppUserCustomerSwitchStore.prototype.setCustomerUserPage = function(page) {
    this.customerUserPage = page;
};
//FromAction-设置用户列表每页显示多少条
AppUserCustomerSwitchStore.prototype.setCustomerPageSize = function(pageSize) {
    this.pageSize = pageSize;
};
//FromAction-隐藏右侧面板
AppUserCustomerSwitchStore.prototype.closeRightPanel = function() {
    this.isShowRightPanel = false;
};
//FromAction-显示右侧面板
AppUserCustomerSwitchStore.prototype.showRightPanel = function() {
    this.isShowRightPanel = true;
};
//FromAction-设置搜索关键词
AppUserCustomerSwitchStore.prototype.setSearchKeyword = function(keyword) {
    this.searchKeyword = keyword;
};
//FromAction-设置选中的用户列表
AppUserCustomerSwitchStore.prototype.setSelectedCustomerUserRows = function(rows) {
    this.selectedCustomerUserRows = rows;
};


//使用alt导出store
module.exports = alt.createStore(AppUserCustomerSwitchStore, 'AppUserCustomerSwitchStore');