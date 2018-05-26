var crmAjax = require("../ajax");
var scrollBarEmitter = require("../../../../public/sources/utils/emitters").scrollBarEmitter;
import {message} from "antd";

function CrmActions() {
    this.generateActions(
        //设置初始值
        "setInitialState",
        "setLoadingState",
        "setCurrentCustomer",
        "setCustomerId",
        "setRepeatCustomerShow",
        "afterMergeCustomer",
        //删除订单后，更新客户列表中的客户信息
        "updateAfterDelOrder",
        //修改基本资料后，更新客户列表
        "editBasicSuccess",
        //设置页码
        "setPageNum",
        //设置点击的页码
        "setNextPageNum",
        //拨打电话完增加跟进记录成功后更新列表的跟进内容
        "updateCurrentCustomerRemark",
        //修改默认联系人后，更新客户列表中该客户的默认联系人
        "updateCustomerDefContact"
    );

    this.queryCustomer = function(condition, rangParams, pageSize, sorter, queryObj) {
        this.dispatch({error: false, loading: true});
        crmAjax.queryCustomer(condition, rangParams, pageSize, sorter, queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({error: false, loading: false, result: result});
        }, (errorMsg) => {
            this.dispatch({
                error: true,
                loading: false,
                errorMsg: errorMsg || Intl.get("failed.get.crm.list", "获取客户列表失败")
            });
        });
    };

    this.addCustomer = function(newCus, cb) {
        var _this = this;
        crmAjax.addCustomer(newCus).then(function(data) {
            if (data && _.isArray(data.result)) {
                _this.dispatch(data.result[0]);
            }
            cb(data);
        }, function(errorMsg) {
            cb(errorMsg || Intl.get("crm.192", "添加客户失败!"));
        });
    };

    this.deleteCustomer = function(ids) {
        crmAjax.deleteCustomer(ids).then((data) => {
            if (data && data.code === 0) {
                message.success(Intl.get("crm.138", "删除成功"));
                this.dispatch(ids);
            } else {
                message.error(data && data.msg || Intl.get("crm.139", "删除失败"));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get("crm.139", "删除失败"));
        });
    };

    this.updateCustomer = function(newCus, cb) {
        crmAjax.updateCustomer(newCus).then(result => {
            if (_.isFunction(cb)) cb();
        }, errorMsg => {
            message.error(errorMsg || Intl.get("crm.customer.failed.interested", "修改失败"));
            if (_.isFunction(cb)) cb(errorMsg);
        });
    };

    //修改后刷新客户列表中对应的客户数据
    this.refreshCustomerList = function(customerId) {
        var _this = this;
        crmAjax.getCustomerById(customerId).then(function(data) {
            _this.dispatch(data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get("crm.189", "更新客户列表失败!"));
        });
    };
    //客户名唯一性的验证
    this.checkOnlyCustomerName = function(customerName, callback, customerId) {
        let queryObj = {name: customerName};
        if (customerId) {
            queryObj.customer_id = customerId;
        }
        crmAjax.checkOnlyCustomer(queryObj).then(function(data) {
            if (callback) {
                callback(data);
            }
        }, function(errorMsg) {
            if (callback) {
                callback(errorMsg || Intl.get("crm.193", "客户名唯一性验证失败！"));
            }
        });
    };
    //联系人电话唯一性的验证
    this.checkOnlyContactPhone = function(phone, callback) {
        crmAjax.checkOnlyCustomer({phone: phone}).then(function(data) {
            if (callback) {
                callback(data);
            }
        }, function(errorMsg) {
            if (callback) {
                callback(errorMsg || Intl.get("crm.194", "联系人电话唯一性验证失败"));
            }
        });
    };
    this.getIndustries = function(callback) {
        crmAjax.getIndustries().then((list) => {
            if (callback) {
                callback(list);
            }
        }, (errorMsg) => {
            if (callback) {
                callback(errorMsg);
            }
        });
    };
    //是否能继续添加客户,如果是0 是可以转入的，如果大于0，代表超出客户的数量
    this.getCustomerLimit = function(reqObj, callback) {
        crmAjax.getCustomerLimit(reqObj).then((data) => {
            _.isFunction(callback) && callback(data);
        }, (errorMsg) => {
            _.isFunction(callback) && callback(errorMsg);
        });
    };
}

module.exports = alt.createActions(CrmActions);
