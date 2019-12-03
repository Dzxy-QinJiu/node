//日程管理
var crmPrivilegeConst = require('../../public/privilege-const').default;

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
            privileges: [crmPrivilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
        {
            method: 'post',
            path: '/rest/customer/add/schedule',
            handler: 'addSchedule',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
        {
            method: 'put',
            path: '/rest/customer/edit/schedule/:scheduleId',
            handler: 'editSchedule',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
        {
            method: 'delete',
            path: '/rest/customer/delete/schedule',
            handler: 'deleteSchedule',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.MEMBER_SCHEDULE_MANAGE]
        },{
            method: 'put',
            path: '/rest/customer/change/schedule/:scheduleId/:status',
            handler: 'handleScheduleStatus',
            passport: {
                needLogin: true
            },
            privileges: [crmPrivilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
    ]
};
