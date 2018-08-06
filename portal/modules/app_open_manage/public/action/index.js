import { asyncDispatcher } from './../utils';
const userAjax = require('MOD_DIR/user_manage/public/ajax/user-ajax');
const roleAjax = require('MOD_DIR/rolePrivilege_role/public/ajax/role-ajax');
import openAppAjax from './../ajax/index';

function OpenAppAction() {
    this.generateActions(
        'changeRoleUser',
        'changeRoleItemEdit',
        'changeAppStatus'
    );
    this.getAppList = asyncDispatcher(openAppAjax.getAppList);
    this.getAppRoleList = asyncDispatcher(openAppAjax.getAppRoleList);
    this.getAllUsers = asyncDispatcher(openAppAjax.getAllUsers);
    this.editRoleOfUsers = asyncDispatcher(openAppAjax.editRoleOfUsers, true);
    this.openApp = asyncDispatcher(openAppAjax.openApp, true);
}

module.exports = alt.createActions(OpenAppAction);