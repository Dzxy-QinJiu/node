/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/6.
 */
var AppUserListActions = require("../action/app-user-list-actions");
function AppUserListStore() {
    this.setInitState();
    this.bindActions(AppUserListActions);
}
//设置初始化数据
AppUserListStore.prototype.setInitState = function () {
    //某个客户下的用户列表
    this.userListsOfCustomer = {
        loading: true,
        errMsg: "",
        data: {}
    };
    this.curApplyType = "";//申请类型
    this.appList = [];
};
//获取某个客户下的用户列表
AppUserListStore.prototype.getCrmUserList = function (result) {
    var userListsOfCustomer = this.userListsOfCustomer;
    userListsOfCustomer.loading = result.loading;
    if (result.error) {
        userListsOfCustomer.errMsg = result.errMsg;
    } else if (result.resData) {
        userListsOfCustomer.data = result.resData;
        //根据应用的数量从小到大排序，是方便页面上进行布局，因为都是左浮动的，从小到大可以避免中间有卡住的情况
        userListsOfCustomer.data.data =  _.sortBy(userListsOfCustomer.data.data, "apps");
    }
};
//申请类型的修改
AppUserListStore.prototype.onChangeApplyType = function (curApplyType) {
    this.curApplyType = curApplyType;
};
AppUserListStore.prototype.getAppList = function (result) {

    this.appList = _.isArray(result) ? result : [];
};

//（取消）选择用户时，（取消）选择用户下的所有应用
AppUserListStore.prototype.onChangeUserCheckBox = function (checkObj) {
    var crmUserList = this.userListsOfCustomer.data.data;
    if (_.isArray(crmUserList)) {
        let userObj = _.find(crmUserList, (obj) => obj.user.user_id === checkObj.userId);
        if (userObj) {
            //用户的（取消）选择处理
            userObj.user.checked = checkObj.checked;
            //用户下应用的（取消）选择处理
            if (_.isArray(userObj.apps) && userObj.apps.length) {
                _.each(userObj.apps, app => {
                    app.checked = checkObj.checked;
                });
            }
        }
    }
};

//（取消）选择应用时的处理
AppUserListStore.prototype.onChangeAppCheckBox = function (checkObj) {
    var crmUserList = this.userListsOfCustomer.data.data;
    if (_.isArray(crmUserList)) {
        let userObj = _.find(crmUserList, (obj) => obj.user.user_id === checkObj.userId);
        if (userObj) {
            //应用的（取消）选择处理
            if (_.isArray(userObj.apps) && userObj.apps.length) {
                let app = _.find(userObj.apps, app => app.app_id === checkObj.appId);
                if (app) {
                    app.checked = checkObj.checked;
                }
            }
            //用户的（取消）选择处理
            if (checkObj.checked) {//选中时
                let notCheckedApp = _.find(userObj.apps, app => !app.checked);
                //该用户下没有未选中的应用时，将用户的checked设为选中
                if (!notCheckedApp) {
                    userObj.user.checked = checkObj.checked;
                }
            } else {//取消选中时
                delete userObj.user.checked;
            }
        }
    }
};
module.exports = alt.createStore(AppUserListStore, 'AppUserListStore');

