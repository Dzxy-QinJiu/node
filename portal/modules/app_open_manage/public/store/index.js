const OpenAppAction = require('../action');
import { resultHandler } from '../utils';
import { APP_STATUS } from '../consts';
function OpenAppStore() {
    this.resetState();
    this.bindActions(OpenAppAction);
}

OpenAppStore.prototype.resetState = function() {
    this.appList = {
        loading: false,
        errorMsg: '',
        data: []
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
    this.roleUserList = {
        loading: false,
        errorMsg: '',
        data: []
    };    
};

OpenAppStore.prototype.getAppList = resultHandler('appList', function({data}) {
    this.appList.data = [{
        tags_name: data.tags_name,
        tags_description: data.tags_description,
        tags: data.tags,
        status: APP_STATUS.ENABLED
    }];
});

OpenAppStore.prototype.getAppRoleList = resultHandler('roleList', function({ data }) {
    this.roleList.data = data.map(x => {
        x.userList = [];
        return x;
    });    
});

OpenAppStore.prototype.getAllUsers = resultHandler('userList', function({ data }) {
    this.userList.data = data;
});


OpenAppStore.prototype.changeRoleUser = function(params) {
    const roleItem = this.roleList.data.find(x => x.role_id === params.role_id);
    roleItem.userList = params.ids.map(userId => {
        return this.userList.data.find(x => x.user_id === userId);
    });
};


module.exports = alt.createStore(OpenAppStore, 'OpenAppStore');