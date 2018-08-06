import { ajaxPro } from './../utils';

const openAppAjax = {};

openAppAjax.getAppList = params => {
    return ajaxPro('getAppList', params);   
};

openAppAjax.getAllUsers = params => {
    return ajaxPro('getAllUsers', params);   
    
};

openAppAjax.getAppRoleList = params => {
    return ajaxPro('getAppRoleList', params);      
};

openAppAjax.editRoleToUsers = params => {
    return ajaxPro('editRoleToUsers', params);
};

openAppAjax.openApp = params => ajaxPro('openApp', params);

export default openAppAjax;
