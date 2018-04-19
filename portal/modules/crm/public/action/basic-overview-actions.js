var util = require("../utils/contact-util");
var crmAjax = require("../ajax");
function CRMActions() {
    this.generateActions({
        'setBasicState': 'setBasicState'
    });

    this.getBasicData = function (curCustomer) {
        var basicData = curCustomer || {};
        setTimeout(() => {
            this.dispatch(basicData);
        });
    };
    this.getCrmUserList = function (queryParams) {
        this.dispatch({errorMsg: "", loading: true});
        crmAjax.getCrmUserList(queryParams).then((result) => {
            this.dispatch({loading: false, errorMsg: "", result: result});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg || Intl.get("failed.get.crm.list", "获取客户列表失败")});
        });
    };
}

module.exports = alt.createActions(CRMActions);
