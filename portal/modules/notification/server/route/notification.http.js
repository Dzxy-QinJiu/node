import privilegeConst_notification from '../../public/privilege-const';
/**
 * author:周连毅
 * 说明：统计分析-用户分析-用户构成 的路由配置
 */

module.exports = {
    //定义controller
    module: 'notification/server/action/notification.action',
    //定义路由信息
    routes: [{
        //http方法
        'method': 'put',
        //清除未读数
        'path': '/rest/notification/unread_num/:type',
        //action中的方法
        'handler': 'clearUnreadNum',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
        //需要权限
        'privileges': []
    }, {
        //http方法
        'method': 'get',
        //获取申请消息、客户提醒未读数
        'path': '/rest/notification/unread_num',
        //action中的方法
        'handler': 'getUnreadCount',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
        // eslint-disable-next-line no-undef
        'privileges': [privilegeConst_notification.USERAPPLY_BASE_PERMISSION]
    }, {
        //http方法
        'method': 'get',
        //获取系统消息列表
        'path': '/rest/notification/system/:status',
        //action中的方法
        'handler': 'getSystemNotices',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
        //需要权限
        'privileges': [privilegeConst_notification.CUSTOMER_NOTICE_MANAGE]
    }, {
        //http方法
        'method': 'put',
        //获取系统消息列表
        'path': '/rest/notification/system/handle/:noticeId',
        //action中的方法
        'handler': 'handleSystemNotice',
        //是否需要登录
        'passport': {
            'needLogin': true
        },
        //需要权限
        'privileges': [privilegeConst_notification.CUSTOMER_NOTICE_MANAGE]
    }, {
        //http方法
        'method': 'get',
        //获取升级公告列表
        'path': '/rest/get/upgrade/notice',
        //action中的方法
        'handler': 'getUpgradeNoticeList',
        //是否需要登录
        'passport': {
            'needLogin': true
        }
    }]
};