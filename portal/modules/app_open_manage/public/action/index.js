import { asyncDispatcher } from './../utils';
const userAjax = require('MOD_DIR/user_manage/public/ajax/user-ajax');
const roleAjax = require('MOD_DIR/rolePrivilege_role/public/ajax/role-ajax');
function OpenAppAction() {
    this.generateActions(
        
    );
    this.getUserList = asyncDispatcher(userAjax.getCurUserList);
    this.getRoleList = asyncDispatcher(roleAjax.getRoleList);
}

module.exports = alt.createActions(OpenAppAction);