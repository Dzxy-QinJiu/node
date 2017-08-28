var AlertActions = require("../action/alert-action");

function AlertStore() {
    this.alertList = [];
    this.alertListBak = [];

    this.bindActions(AlertActions);
}

AlertStore.prototype.getAlertList = function(list) {
    this.alertList = list;
};

AlertStore.prototype.showAddForm = function(newAlert) {
    this.clearEditState();
    this.alertListBak = JSON.parse(JSON.stringify(this.alertList));
    this.alertList.unshift(newAlert);
};

AlertStore.prototype.showEditForm = function(alert) {
    this.clearEditState();
    this.alertListBak = JSON.parse(JSON.stringify(this.alertList));
    let theAlert = _.find(this.alertList, item => item.id == alert.id);
    theAlert.edit = true;
};

AlertStore.prototype.clearEditState = function() {
    let theAlert = _.find(this.alertList, item => item.edit == true);
    if (theAlert) {
        if (theAlert.id) {
            delete theAlert.edit;
        }
        else {
            this.alertList.splice(0,1);
        }
    }
};

AlertStore.prototype.cancelEdit = function() {
    this.alertList = this.alertListBak;
};

module.exports = alt.createStore(AlertStore , 'AlertStore');
