var util = require("../utils/contact-util");

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
}

module.exports = alt.createActions(CRMActions);
