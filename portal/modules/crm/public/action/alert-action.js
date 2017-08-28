/**
 * 提醒的action
 */
var alertAjax = require('../ajax/alert-ajax');

function AlertAction() {
    this.generateActions(
        'showAddForm',
        'showEditForm',
        'cancelEdit'
    );

    //获取提醒列表
    this.getAlertList = function (customer_id) {
        const _this = this;
        const reqData = {
            customer_id: customer_id,
            status: "all",
            page_size: 1000
        };
        alertAjax.getAlertList(reqData).then(function (resData) {
            const list = _.isArray(resData.result) ? resData.result : [];
            _this.dispatch(list);
        });
    };
    //添加提醒
    this.addAlert = function (reqData, cb) {
        alertAjax.addAlert(reqData).then(function (resData) {
            cb(resData);
        });
    };
    //编辑提醒
    this.editAlert = function (reqData, cb) {
        alertAjax.editAlert(reqData).then(function (resData) {
            cb(resData);
        });
    };
    //删除提醒
    this.deleteAlert = function (reqData, cb) {
        alertAjax.deleteAlert(reqData).then(function (resData) {
            cb(resData);
        });
    };
}

module.exports = alt.createActions(AlertAction);
