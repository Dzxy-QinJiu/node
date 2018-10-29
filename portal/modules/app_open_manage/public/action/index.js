import { asyncDispatcher } from './../utils';
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