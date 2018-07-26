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
    this.editRoleResult = {
        loading: false,
        errorMsg: ''
    };
    this.openAppResult = {
        loading: false,
        errorMsg: ''  
    };
};

OpenAppStore.prototype.getAppList = resultHandler('appList', function({ data }) {
    this.appList.data = data.map(x => ({
        tags_name: x.name,
        tags_description: x.description,
        tags: x.tags,
        status: x.visible
    }));
});

OpenAppStore.prototype.getAppRoleList = resultHandler('roleList', function({ data }) {
    this.roleList.data = data.map(x => {
        x.rawUserList = x.userList;//用于判断修改的用户属于删除还是添加
        return x;
    });
});

OpenAppStore.prototype.getAllUsers = resultHandler('userList', function({ data }) {
    this.userList.data = data;
});

OpenAppStore.prototype.editRoleToUsers = resultHandler('editRoleResult');

OpenAppStore.prototype.changeRoleUser = function(params) {
    const roleItem = this.roleList.data.find(x => x.role_id === params.role_id);
    roleItem.userList = params.ids.map(userId => {
        return this.userList.data.find(x => x.user_id === userId);
    });
};

OpenAppStore.prototype.changeRoleItemEdit = function({ index, isShow }) {
    //取消编辑时，将角色下成员重置
    if (!isShow) {
        this.roleList.data[index].userList = this.roleList.data[index].rawUserList;
    }
    this.roleList.data[index].showEdit = isShow;
};

OpenAppStore.prototype.openApp = resultHandler('openAppResult');


module.exports = alt.createStore(OpenAppStore, 'OpenAppStore');