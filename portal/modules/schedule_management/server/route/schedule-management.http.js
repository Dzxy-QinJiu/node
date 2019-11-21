import schedule_management_privilegeConst from '../../public/privilege-config'
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
            privileges: [schedule_management_privilegeConst.MEMBER_SCHEDULE_MANAGE]
        }, {
            method: 'put',
            path: '/rest/change/schedule/:scheduleId/:status',
            handler: 'handleScheduleStatus',
            passport: {
                needLogin: true
            },
            privileges: [schedule_management_privilegeConst.MEMBER_SCHEDULE_MANAGE]
        }, {
            method: 'post',
            path: '/rest/customer/add/schedule',
            handler: 'addSchedule',
            passport: {
                needLogin: true
            },
            privileges: [schedule_management_privilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
        {
            method: 'put',
            path: '/rest/customer/edit/schedule/:scheduleId',
            handler: 'editSchedule',
            passport: {
                needLogin: true
            },
            privileges: [schedule_management_privilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
        {
            method: 'delete',
            path: '/rest/customer/delete/schedule',
            handler: 'deleteSchedule',
            passport: {
                needLogin: true
            },
            privileges: [schedule_management_privilegeConst.MEMBER_SCHEDULE_MANAGE]
        },
    ]
};
