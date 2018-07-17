import { asyncDispatcher } from './../utils';
const userAjax = require('MOD_DIR/user_manage/public/ajax/user-ajax');
const roleAjax = require('MOD_DIR/rolePrivilege_role/public/ajax/role-ajax');
import openAppAjax from './../ajax/index';

function OpenAppAction() {
    this.generateActions(
        'changeRoleUser'
    );
    this.getAppList = asyncDispatcher(openAppAjax.getAppList);
    this.getAppRoleList = asyncDispatcher(openAppAjax.getAppRoleList);
    this.getAllUsers = asyncDispatcher(openAppAjax.getAllUsers);
}

module.exports = alt.createActions(OpenAppAction);