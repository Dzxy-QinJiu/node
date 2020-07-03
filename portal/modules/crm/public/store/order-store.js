import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
const OrderActions = require('../action/order-actions');
const routes = require('../../common/route');

function OrderStore() {
    this.orderListLoading = false;
    this.orderList = [];
    this.stageList = [];
    this.appList = [];
    this.isFormShow = false;
    this.crmUserList = [];
    this.isLoadingCrmUsers = false;//是否正在加载客户开通的用户列表
    this.crmUsersErrorMsg = '';//获取客户开通的用户列表的错误提示
    this.applyType = '';//申请类型
    this.listenScrollBottom = true;//是否监听滚动
    this.pageNum = 1;//当前是第几页
    this.pageSize = 20;//一页展示的条数
    this.total = 0;//一共开通了多少用户
    this.isAddFormShow = false;//是否展示添加订单面板
    this.bindActions(OrderActions);
}

OrderStore.prototype.setOrderListLoading = function(flag) {
    this.orderListLoading = flag;
};

OrderStore.prototype.setPageNum = function(num) {
    this.pageNum = num;
};

OrderStore.prototype.setCrmUsersLoading = function(flag) {
    this.isLoadingCrmUsers = flag;
};

OrderStore.prototype.getCrmUserList = function(obj) {
    if (obj.errorMsg) {
        this.isLoadingCrmUsers = false;
        this.crmUsersErrorMsg = obj.errorMsg;
        this.listenScrollBottom = false;
    } else {
        this.isLoadingCrmUsers = false;
        this.crmUsersErrorMsg = '';
        if (obj.result && _.isArray(obj.result.data)) {
            if (this.pageNum === 1) {
                this.crmUserList = obj.result.data;
            } else {
                this.crmUserList = this.crmUserList.concat(obj.result.data);
            }
            this.pageNum++;
            this.total = obj.result.total || 0;
        }
        this.listenScrollBottom = this.total > this.crmUserList.length;
        scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
    }
};

//（取消）选择用户时，（取消）选择用户下的所有应用
OrderStore.prototype.onChangeUserCheckBox = function(checkObj) {
    if (_.isArray(this.crmUserList)) {
        let userObj = _.find(this.crmUserList, (obj) => obj.user.user_id === checkObj.userId);
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
OrderStore.prototype.onChangeAppCheckBox = function(checkObj) {
    if (_.isArray(this.crmUserList)) {
        let userObj = _.find(this.crmUserList, (obj) => obj.user.user_id === checkObj.userId);
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
//申请类型的修改
OrderStore.prototype.onChangeApplyType = function(applyType) {
    this.applyType = applyType;
};
//获取要合并重复客户的订单列表（通过参数传过来的）
OrderStore.prototype.getMergeOrderList = function(customer) {
    this.orderList = customer.sales_opportunities || [];
};
//获取客户详情的订单列表(通过接口获取)
OrderStore.prototype.getOrderList = function(data) {
    this.setOrderListLoading(false);
    if (data.result && _.isArray(data.result)) {
        this.orderList = data.result;
    } else {
        this.orderList = [];
    }
};
//删除订单后的处理
OrderStore.prototype.afterDelOrder = function(delOrderId) {
    this.orderList = _.filter(this.orderList, item => item.id !== delOrderId);
};

//修改订单后的处理
OrderStore.prototype.afterEditOrder = function(order) {
    let editOrder = _.find(this.orderList, item => item.id === order.id);
    if(editOrder){
        if (order.oppo_status) {//订单状态的修改（丢单、赢单）
            editOrder.oppo_status = order.oppo_status;
            if (_.has(order,'lose_reason')){//丢单原因
                editOrder.lose_reason = order.lose_reason;
            }
        } else {
            if (_.has(order,'budget')){
                editOrder.budget = order.budget;
            }
            if (_.has(order,'remarks')){
                editOrder.remarks = order.remarks;
            }
            if (_.has(order,'predict_finish_time')){
                editOrder.predict_finish_time = order.predict_finish_time;
            }
            if(_.has(order,'sale_stages')) {
                editOrder.sale_stages = order.sale_stages;
            }
            if(_.has(order, 'apps')) {
                editOrder.apps = order.apps;
            }

            editOrder.isEdit = false;
        }
    }
};
//添加订单后的处理
OrderStore.prototype.afterAddOrder = function(order) {
    this.isAddFormShow = false;
    this.orderList.unshift(order);//将新加的订单加入订单列表的头部
};

OrderStore.prototype.getSysStageList = function(result) {
    this.stageList = _.get(result, 'result', []);
};

OrderStore.prototype.getAppList = function(result) {
    this.appList = _.isArray(result) ? result : [];
};

OrderStore.prototype.showForm = function(id) {
    if (id) {
        this.orderList.forEach(order => {
            if (order.id === id) order.isEdit = true;
        });
    } else {
        this.isAddFormShow = true;
    }
};

OrderStore.prototype.hideForm = function(id) {
    if (id) {
        this.orderList.forEach(order => {
            if (order.id === id) order.isEdit = false;
        });
    }
    else {
        this.isAddFormShow = false;
    }
};

module.exports = alt.createStore(OrderStore, 'OrderStore');
