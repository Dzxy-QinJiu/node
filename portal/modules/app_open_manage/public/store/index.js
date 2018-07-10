const OpenAppAction = require('../action');
import { resultHandler } from '../utils';
function OpenAppStore() {
    this.resetState();
    this.bindActions(OpenAppAction);
}

OpenAppStore.prototype.resetState = function() {
    this.appInfo = {
        data: [],
        loading: false,
        errorMsg: ''
    };
    this.userList = {
        data: [],
        loading: false,
        errorMsg: ''
    };
    this.roleList = {
        data: [],
        loading: false,
        errorMsg: ''
    };
};

OpenAppStore.prototype.getRoleList = resultHandler('roleList', function({ data }) {
    this.roleList.data = data;
});

OpenAppStore.prototype.getAllUsers = resultHandler('userList', function({ data }) {
    this.userList.data = data;
});

module.exports = alt.createStore(OpenAppStore, 'OpenAppStore');