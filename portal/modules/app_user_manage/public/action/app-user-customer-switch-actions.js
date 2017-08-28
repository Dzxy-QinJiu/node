/**
 * 显示客户对应的用户的action
 */
//用户的ajax
var AppUserAjax = require("../ajax/app-user-ajax");
var crmAjax = require("../../../crm/public/ajax");

function AppUserCustomerSwitchAction() {

    this.generateActions(
        //获取客户的用户列表
        'getCustomerUserList',
        //获取客户信息
        'getCustomerInfo',
        //设置用户页数
        'setCustomerUserPage',
        //设置一页多少条
        'setCustomerPageSize',
        //设置搜索关键词
        'setSearchKeyword',
        //显示右侧面板
        'showRightPanel',
        //隐藏右侧面板
        'closeRightPanel',
        //设置选中的用户列表
        'setSelectedCustomerUserRows'
    );

    //获取客户对应的用户列表
    this.getCustomerUserList = function (obj) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        AppUserAjax.getCustomerUserList(obj).then(function (data) {
            _this.dispatch({loading: false, error: false, data: data});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取客户基本信息
    this.getCustomerInfo = function (customerId) {
        var _this = this;
        crmAjax.queryCustomer({id: customerId}, 1, 1).then(function (data) {
            var customerInfo = {};
            if (data && $.isArray(data.result) && data.result[0]) {
                customerInfo = data.result[0];
            }
            _this.dispatch(customerInfo);
        }, function () {
            _this.dispatch({});
        });
    };

}

module.exports = alt.createActions(AppUserCustomerSwitchAction);