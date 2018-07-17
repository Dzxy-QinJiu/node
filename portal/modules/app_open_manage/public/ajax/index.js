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

export default openAppAjax;
