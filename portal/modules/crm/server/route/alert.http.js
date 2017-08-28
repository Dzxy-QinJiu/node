module.exports = {
    module: 'crm/server/action/alert-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/customer/alert',
            handler: 'getAlertList',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'post',
            path: '/rest/customer/alert',
            handler: 'addAlert',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'put',
            path: '/rest/customer/alert',
            handler: 'editAlert',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'delete',
            path: '/rest/customer/alert',
            handler: 'deleteAlert',
            passport: {
                needLogin: true
            },
        },
    ]
};
