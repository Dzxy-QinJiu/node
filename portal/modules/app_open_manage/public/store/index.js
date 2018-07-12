const OpenAppAction = require('../action');
import { resultHandler } from '../utils';
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
    this.appList.data = data;
});

OpenAppStore.prototype.getRoleList = resultHandler('roleList', function({ data }) {
    this.roleList.data = data.map(x => {
        x.userList = [];
        return x;
    });
    if (_.get(data, 'length')) {
        setTimeout(() => {
            data.forEach(item => {
                OpenAppAction.getRoleUserList({
                    query: {
                        role_id: item.role_id
                    }
                });
            });
        });
    }
});

OpenAppStore.prototype.getAllUsers = resultHandler('userList', function({ data }) {
    this.userList.data = data;
});

OpenAppStore.prototype.getRoleUserList = resultHandler('roleUserList', function({ data, paramObj }) {
    // this.roleList.data[paramObj.query.role_id].userList = data;
    this.roleList.data.find(x => x.role_id === paramObj.query.role_id).userList = data;
    // this.roleUserList.data = _.uniqBy(this.roleUserList.data.concat(data), "user_id");
    // this.userList.data = _.uniqBy(this.roleUserList.data.concat(data), "user_id");
});

OpenAppStore.prototype.changeRoleUser = function(params) {
    const roleItem = this.roleList.data.find(x => x.role_id === params.role_id);
    roleItem.userList = params.ids.map(userId => {
        return this.userList.data.find(x => x.user_id === userId);
    });
};


module.exports = alt.createStore(OpenAppStore, 'OpenAppStore');