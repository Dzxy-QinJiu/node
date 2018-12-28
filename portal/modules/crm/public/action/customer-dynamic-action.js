/**
 * 动态的action
 */
var crmAjax = require('../ajax');

function CustomerDynamicAction() {
    this.generateActions(
        //获取动态列表
        'getDynamicList'
    );

    //获取动态列表
    this.getDynamicList = function(customer_id) {
        this.dispatch({loading: true});
        crmAjax.getDynamicList(customer_id).then(list => {
            if (!_.isArray(list)) list = [];
            this.dispatch({loading: false, list: list});
        }, errorMsg => {
            this.dispatch({loading: false, errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(CustomerDynamicAction);
