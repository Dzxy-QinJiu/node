/**
 * 动态的action
 */
var crmAjax = require('../ajax');

function DynamicAction() {
    this.generateActions(
        //获取动态列表
        'getDynamicList'
    );

    //获取动态列表
    this.getDynamicList = function(customer_id) {
        var _this = this;
        crmAjax.getDynamicList(customer_id).then(function(list) {
            if (!_.isArray(list)) list = [];
            _this.dispatch(list);
        });
    };
}

module.exports = alt.createActions(DynamicAction);
