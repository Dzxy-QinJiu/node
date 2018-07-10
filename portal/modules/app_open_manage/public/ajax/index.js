import { ajaxPro } from './../utils';

const openAppAjax = {};

openAppAjax.getAllUsers = params => {
    // return ajaxPro("getAllUsers", params)
    return Promise.resolve([
        {
            user_name: 'tedt',
            user_id: '2'
        },
        {
            user_name: '3dt',
            user_id: '22'
        }
    ]);
};

openAppAjax.getRoleList = params => {
    return Promise.resolve([
        {
            role_id: '1',
            role_name: '角色1',
            tag_codes: ['1','2'],
            tags: ['tag1']
        },
        {
            role_id: '12',
            role_name: '角色2',
            tag_codes: ['1','2'],
            tags: ['tag2']
        }
    ]);
};

export default openAppAjax;
