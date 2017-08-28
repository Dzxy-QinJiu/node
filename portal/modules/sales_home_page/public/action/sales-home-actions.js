var salesHomeAjax = require("../ajax/sales-home-ajax");
var _ = require("underscore");

function SalesHomeActions() {
    this.generateActions(
        'setListIsLoading',//设置是否正在加载数据列表
        'setActiveView',//设置当前要展示的视图
        'changeSearchTime',//搜索时间的切换
        'selectSalesTeam',//选择要展示的销售团队
        'selectSalesman',//选择要展示的销售人员
        'returnSalesTeamList',//返回销售团队列表
        'returnSalesMemberList',//返回销售成员列表
        'getExpireUser'//获取过期用户列表
    );

    //获取当前登录销售的角色（销售/经理/总监）
    this.getSalesType = function () {
        var _this = this;
        salesHomeAjax.getSalesType().then(function (list) {
                _this.dispatch(list);
                if (list.indexOf('sales') >= 0) {
                    //TODO 普通销售：sales
                } else if (list.indexOf('salesleader') >= 0 || list.indexOf('salesseniorleader') >= 0) {//基层领导：salesleader，高层领导：salesseniorleader
                    //获取销售(团队)-客户列表
                    _this.actions.getSalesCustomerList();
                    //获取销售(团队)-电话列表
                    _this.actions.getSalesPhoneList();
                    //获取销售(团队)-用户列表
                    _this.actions.getSalesUserList();
                    //获取销售(团队)-合同列表
                    _this.actions.getSalesContractList();
                }
            }, function (errorMsg) {
                _this.dispatch(errorMsg);
            }
        );
    };
    //获取销售团队列表
    this.getSalesTeamList = function (type) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getSalesTeamList(type).then(function (resData) {
            _this.dispatch({loading: false, error: false, resData: resData, type: type});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    //获取某销售团队的成员列表
    this.getSalesTeamMembers = function (teamId) {
        var _this = this;
        if (_this.dispatched) {
            _this.dispatch({loading: true, error: false});
        }
        salesHomeAjax.getSalesTeamMembers(teamId).then(function (resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取客户统计总数
    this.getCustomerTotal = function (reqData) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getCustomerTotal(reqData).then(function (resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取客户统计总数
    this.getUserTotal = function (reqData) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getUserTotal(reqData).then(function (resData) {
            _this.dispatch({loading: false, error: false, resData: resData});
        }, function (errorMsg) {
            _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };

    //获取销售-客户列表
    this.getSalesCustomerList = function (timeRange) {
        var _this = this;
        salesHomeAjax.getSalesCustomerList(timeRange).then(function (data) {
                _this.dispatch(data);
            }, function (errorMsg) {
                _this.dispatch(errorMsg);
            }
        );
    };
    //获取销售-电话列表
    this.getSalesPhoneList = function (reqData, type) {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getSalesPhoneList(reqData, type).then(function (resData) {
                _this.dispatch({loading: false, error: false, resData: resData});
            }, function (errorMsg) {
                _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            }
        );
    };
    //获取销售-用户列表
    this.getSalesUserList = function (timeRange) {
        var _this = this;
        salesHomeAjax.getSalesUserList(timeRange).then(function (data) {
                _this.dispatch(data);
            }, function (errorMsg) {
                _this.dispatch(errorMsg);
            }
        );
    };
    //获取销售-合同列表
    this.getSalesContractList = function (timeRange) {
        var _this = this;
        salesHomeAjax.getSalesContractList(timeRange).then(function (data) {
                _this.dispatch(data);
            }, function (errorMsg) {
                _this.dispatch(errorMsg);
            }
        );
    };
    //获取过期用户列表
    this.getExpireUser = function () {
        var _this = this;
        _this.dispatch({loading: true, error: false});
        salesHomeAjax.getExpireUser().then(function (resData) {
                _this.dispatch({loading: false, error: false, resData: resData});
            }, function (errorMsg) {
                _this.dispatch({loading: false, error: true, errorMsg: errorMsg});
            }
        );
    };
}

module.exports = alt.createActions(SalesHomeActions);
