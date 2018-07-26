import { ajaxPro } from './../utils';

const openAppAjax = {};

openAppAjax.getAppList = params => {
    // return ajaxPro('getAppList', params);    
    return Promise.resolve({
        tags_name: '合同管理',
        tags_description: '合同管理可以帮您管理合同,统计和分析合同数据',
        tags: ['contract'],
        status: 1
    });
};

openAppAjax.getAllUsers = params => {
    // return ajaxPro('getAllUsers', params);    
    return Promise.resolve([
        {
            user_name: 'tedt',
            user_id: '2'
        },
        {
            user_name: '3dt',
            user_id: '22'
        },
        {            
            'user_id': '111',
            'nick_name': '昵称1',
            'user_name': '用户名1',            
            'status': '1',            
            'user_client': '[]',
        },
        {            
            'user_id': '121',
            'nick_name': '昵称2',
            'user_name': '用户名2',            
            'status': '1',            
            'user_client': '[]',
        },
        {            
            'user_id': '113',
            'nick_name': '昵称3',
            'user_name': '用户名3',            
            'status': '1',            
            'user_client': '[]',
        }
    ]);
};

openAppAjax.getAppRoleList = params => {
    // return ajaxPro('getAppRoleList', params);   
    return Promise.resolve([
        {
            role_id: '1',
            role_name: '角色asdasd1',
            tag_codes: ['1','2'],
            tags: ['tag1'],
            userList: [{            
                'user_id': '111',
                'nick_name': '昵称1',
                'user_name': '用户名1',            
                'status': '1',            
                'user_client': '[]',
            },
            {            
                'user_id': '121',
                'nick_name': '昵称2',
                'user_name': '用户名2',            
                'status': '1',            
                'user_client': '[]',
            }]
        },
        {
            role_id: '12',
            role_name: '角色teST2',
            tag_codes: ['1','2'],
            tags: ['tag2'],
            userList: []
        }
    ]); 
};

openAppAjax.editRoleToUsers = params => {
    return ajaxPro('editRoleToUsers', params);
};

openAppAjax.openApp = params => ajaxPro('openApp', params);

export default openAppAjax;
