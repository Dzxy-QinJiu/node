module.exports = {
    module: 'schedule_management/server/action/schedule-management-controller',
    routes: [
        {//获取日程列表
            method: 'get',
            path: '/rest/get/schedule/list',
            handler: 'getScheduleList',
            passport: {
                needLogin: true
            },
        }, {
            method: 'put',
            path: '/rest/change/schedule/:scheduleId/:status',
            handler: 'handleScheduleStatus',
            passport: {
                needLogin: true
            },
        }, {
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
        },
    ]
};
