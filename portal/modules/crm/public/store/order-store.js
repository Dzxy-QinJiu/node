const OrderActions = require("../action/order-actions");
const routes = require("../../common/route");

function OrderStore() {
    this.orderList = [];
    this.stageList = [];
    this.appList = [];
    this.isFormShow = false;

    this.bindActions(OrderActions);
}

OrderStore.prototype.getOrderList = function (customer) {
    this.orderList = customer.sales_opportunities || [];
};

OrderStore.prototype.getSysStageList = function (result) {
    this.stageList = result.result || [];
};

OrderStore.prototype.getAppList = function (result) {
    this.appList = _.isArray(result)? result : [];
};

OrderStore.prototype.showForm = function (id) {
    if (id) {
        this.orderList.forEach(order => {
            if (order.id === id) order.isEdit = true;
        });
    }
    else {
        this.orderList.unshift({isEdit: true});
    }
};

OrderStore.prototype.hideForm = function (id) {
    if (id) {
        this.orderList.forEach(order => {
            if (order.id === id) order.isEdit = false;
        });
    }
    else {
        this.orderList.shift();
    }
};

module.exports = alt.createStore(OrderStore, 'OrderStore');
