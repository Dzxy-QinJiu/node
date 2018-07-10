import { asyncDispatcher } from './../utils';
const userAjax = require('MOD_DIR/user_manage/public/ajax/user-ajax');
const roleAjax = require('MOD_DIR/rolePrivilege_role/public/ajax/role-ajax');
import openAppAjax from './../ajax/index';

function OpenAppAction() {
    this.generateActions(
        
    );
    this.getRoleList = asyncDispatcher(openAppAjax.getRoleList);
    this.getAllUsers = asyncDispatcher(openAppAjax.getAllUsers);
}

module.exports = alt.createActions(OpenAppAction);