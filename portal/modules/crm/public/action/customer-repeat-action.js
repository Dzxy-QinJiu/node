var customerAjax = require('../ajax/index');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
function CustomerRepeatAction() {
    this.generateActions(
        'setSelectedCustomer',//设置选中的客户
        'setMergeRepeatCustomers',//设置要合并的客户们
        'setDelModalShow',//是否展示确认删除客户的提示
        'setRightPanelShow',//是否展示右侧面板的设置
        'setCurCustomer',//设置当前要展示的客户
        'setRepeatCustomerLoading',//设置是否正在加载重复的客户列表
        'setMergePanelShow',//是否展示客户合并面板
        'toggleSearchInput',//展示、隐藏搜索框
        'setFilterObj',//搜索内容的设置
        'resetPage',//重置获取数据的页数
        'afterMergeRepeatCustomer',//合并完重复客户后的处理
        'editBasicSuccess',//修改基本资料后，更新重复客户列表
        'updateCustomerDefContact',//修改默认联系人后，更新重复客户列表
        'setInitialRepeatCustomerList',//从父组件把重复客户传到子组件中
        'setInitData'//初始值的设置
    );
    //获取重复客户列表
    this.getRepeatCustomerList = function(queryParams) {
        var _this = this;
        customerAjax.getRepeatCustomerList(queryParams).then(function(data) {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            _this.dispatch(data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('crm.188', '获取重复客户列表失败!'));
        });
    };
    //删除选中的重复客户
    this.delRepeatCustomer = function(customerIdArray, callback) {
        var _this = this;
        customerAjax.delRepeatCustomer(customerIdArray).then(function(data) {
            if (_.isObject(data) && data.result === 'success') {
                _this.dispatch(customerIdArray);
                callback({error: false, successMsg: Intl.get('crm.138', '删除成功')});
            } else {
                callback({error: true, errorMsg: Intl.get('crm.139', '删除失败')});
            }
        }, function(errorMsg) {
            callback({error: true, errorMsg: errorMsg || Intl.get('crm.139', '删除失败')});
        });
    };
    //修改后刷新客户列表中对应的客户数据
    this.refreshRepeatCustomer = function(customerId) {
        var _this = this;
        customerAjax.getCustomerById(customerId).then(function(data) {
            _this.dispatch(data);
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('crm.189', '更新客户列表失败!'));
        });
    };
    //合并重复客户
    this.mergeRepeatCustomer = function(mergeObj, callback) {
        customerAjax.mergeRepeatCustomer(mergeObj).then(function(data) {
            let resultObj = {};
            if (data && data.result === 'success') {
                //合并成功
                resultObj = {error: false};
            } else {
                //合并失败
                resultObj = {error: true, errorMsg: Intl.get('crm.190', '合并重复客户失败!')};
            }
            if (callback) {
                callback(resultObj);
            }
        }, function(errorMsg) {
            //合并失败
            let resultObj = {error: true, errorMsg: errorMsg || Intl.get('crm.190', '合并重复客户失败!')};
            if (callback) {
                callback(resultObj);
            }
        });
    };
}

module.exports = alt.createActions(CustomerRepeatAction);
