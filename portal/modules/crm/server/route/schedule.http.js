module.exports = {
    module: 'crm/server/action/schedule-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/customer/get/schedule',
            handler: 'getScheduleList',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'post',
            path: '/rest/customer/add/schedule',
            handler: 'addSchedule',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'put',
            path: '/rest/customer/edit/schedule/:scheduleId',
            handler: 'editSchedule',
            passport: {
                needLogin: true
            },
        },
        {
            method: 'delete',
            path: '/rest/customer/delete/schedule',
            handler: 'deleteSchedule',
            passport: {
                needLogin: true
            },
        },{
            method: 'put',
            path: '/rest/customer/change/schedule/:scheduleId/:status',
            handler: 'handleScheduleStatus',
            passport: {
                needLogin: true
            },
        },
    ]
};
