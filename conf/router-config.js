/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/19.
 */
const MODULE_PATH = 'modules/';

let routers = [
    {
        id: 'CRM',
        name: 'call.record.customer',//客户
        routePath: '/crm',
        component: `${MODULE_PATH}crm/public`,
        shortName: 'call.record.customer',//客户
        //有这个权限，才显示入口图标
        showPrivileges: ['CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL']
    },
    {
        id: 'ClUE_CUSTOMER',
        name: 'crm.sales.clue',//线索
        routePath: '/clue_customer',
        component: `${MODULE_PATH}clue_customer/public`,
        shortName: 'crm.sales.clue',//线索
        //有这个权限，才显示入口图标
        showPrivileges: ['CLUECUSTOMER_VIEW']
    },
    {
        id: 'DEAL_MANAGE',
        name: 'user.apply.detail.order',//订单
        routePath: '/deal_manage',
        component: `${MODULE_PATH}deal_manage/public`,
        shortName: 'user.apply.detail.order',//订单
        //有这个权限，才显示入口图标
        showPrivileges: ['CRM_MANAGER_LIST_SALESOPPORTUNITY','CRM_USER_LIST_SALESOPPORTUNITY']
    },
    {
        id: 'CALL_RECORD',
        name: 'menu.shortName.call',//通话
        routePath: '/call_record',
        component: `${MODULE_PATH}call_record/public`,
        shortName: 'menu.shortName.call',//通话
        //有这个权限，才显示入口图标
        showPrivileges: ['CUSTOMER_CALLRECORD_SALE_ONLY']
    },
    {
        id: 'APP_USER_MANAGE',//唯一标识
        name: 'crm.detail.user',//用户
        routePath: '/user',
        shortName: 'crm.detail.user',//用户
        subMenu: [{
            id: 'APP_USER_MANAGE_USER',
            name: 'menu.appuser.list',//用户列表
            routePath: '/user/list',
            component: `${MODULE_PATH}app_user_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['APP_USER_LIST']
        }, {
            id: 'ORGANIZATION_MANAGE',
            name: 'menu.appuser.org',//组织管理
            routePath: '/user/organization',
            component: `${MODULE_PATH}organization_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_ORGANIZATION_LIST']
        }, {
            id: 'USER_AUDIT_LOG', // 用户审计日志的唯一标识
            name: 'menu.appuser.auditlog',//操作记录
            routePath: '/user/log',
            component: `${MODULE_PATH}app_user_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_AUDIT_LOG_LIST']
        }, {
            id: 'ACTIVE_USER_LIST', // 活跃用户
            name: 'menu.active.user.lists',//活跃用户
            routePath: '/user/active',
            component: `${MODULE_PATH}app_user_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_TIME_LINE']
        }]
    },
    {
        id: 'OPLATE_ANALYSIS',//唯一标识
        name: 'user.detail.analysis',//分析
        routePath: '/analysis',
        shortName: 'user.detail.analysis',//分析
        subMenu: [
            {
                id: 'ANALYSIS',//唯一标识
                name: 'user.detail.analysis',//分析
                routePath: '/analysis/analysis',
                component: `${MODULE_PATH}analysis/public`,
                //有这个权限，才显示入口图标
                showPrivileges: [
                    'CUSTOMER_ANALYSIS_COMMON',
                    'CUSTOMER_ANALYSIS_MANAGER',
                ]
            },
            {
                id: 'REPORT',//唯一标识
                name: 'common.report',//报告
                routePath: '/analysis/report',
                //有这个权限，才显示入口图标
                subMenu: [
                    //周报统计
                    {
                        id: 'WEEKLY_REPORT_ANALYSIS',//唯一标识
                        name: 'contract.14',//周报
                        routePath: '/analysis/report/weekly_report',
                        component: `${MODULE_PATH}weekly_report/public`,
                        showPrivileges: [
                            'KETAO_SALES_TEAM_WEEKLY_REPORTS_MANAGER',
                            'KETAO_SALES_TEAM_WEEKLY_REPORTS_COMMON',
                        ],
                    },
                    //月报统计
                    {
                        id: 'MONTHLY_REPORT_ANALYSIS',//唯一标识
                        name: 'contract.15',//月报
                        routePath: '/analysis/report/monthly_report',
                        component: `${MODULE_PATH}monthly-report/public`,
                        showPrivileges: [
                            'CALLRECORD_ASKFORLEAVE_QUERY_MANAGER',
                            'CALLRECORD_ASKFORLEAVE_QUERY_USER',
                        ],
                    },
                    //销售报告
                    {
                        id: 'SALES_REPORT_ANALYSIS',//唯一标识
                        name: 'common.individual.report',//个人报告
                        routePath: '/analysis/report/sales_report',
                        component: `${MODULE_PATH}sales-report/public`,
                        //有这个权限，才显示入口图标
                        showPrivileges: [
                            'CURTAO_SALES_REPORTS_COMMON',
                            'CURTAO_SALES_REPORTS_MANAGER',
                        ]
                    },
                ],
            },
        ]
    },
    {
        id: 'SALES_HOME_PAGE', //唯一标识，销售首页
        name: 'menu.sales.homepage',//销售主页
        routePath: '/sales/home',
        isNotShow: 'true',//不在菜单中展示
        component: `${MODULE_PATH}common_sales_home_page/public`,
        otherAuth: 'isCommonSale',
        //有这个权限，才显示入口图标
        showPrivileges: ['GET_MY_CALL_RECORD', 'GET_ALL_CALL_RECORD']// 获取我的电话统计记录
    },
    {
        id: 'SALES_HOME_PAGE', //唯一标识，销售首页
        name: 'menu.sales.homepage',//销售主页
        routePath: '/sales/home',
        isNotShow: 'true',//不在菜单中展示
        component: `${MODULE_PATH}sales_home_page/public`,
        //有这个权限，才显示入口图标
        showPrivileges: ['GET_MY_CALL_RECORD', 'GET_ALL_CALL_RECORD']// 获取我的电话统计记录
    },
    {
        id: 'SCHEDULE_MANAGEMENT',
        name: 'menu.shortName.schedule',//日程
        routePath: '/schedule_management',
        component: `${MODULE_PATH}schedule_management/public`,
        shortName: 'menu.shortName.schedule',//日程
        //有这个权限，才显示入口图标
        showPrivileges: ['MEMBER_SCHEDULE_MANAGE']
    },
    {
        id: 'APPLICATION_APPLY_MANAGEMENT',
        name: 'crm.109',//申请
        routePath: '/application',
        shortName: 'crm.109',//申请
        subMenu: [{
            id: 'APP_USER_MANAGE_APPLY',
            name: 'menu.appuser.apply',//用户审批
            routePath: '/application/user_apply',
            component: `${MODULE_PATH}user_apply/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['APP_USER_APPLY_LIST']

        }, {
            id: 'SALES_BUSSINESS_APPLY_MANAGEMENT',
            name: 'leave.apply.sales.oppotunity',//机会申请
            routePath: '/application/sales_opportunity',
            component: `${MODULE_PATH}sales_opportunity/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_BUSINESSOPPO_MANAGE']
        }, {
            id: 'BUSSINESS_APPLY_MANAGEMENT',
            name: 'leave.apply.add.leave.apply',//出差申请
            routePath: '/application/business_apply',
            component: `${MODULE_PATH}business-apply/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['BUSINESS_TRIP_MANAGE']
        }, {
            id: 'LEAVE_APPLY_MANAGEMENT',
            name: 'leave.apply.leave.application',//请假申请
            routePath: '/application/leave_apply',
            component: `${MODULE_PATH}leave-apply/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_LEAVE_MANAGE']
        }, {
            id: 'REPORTSEND_APPLY_MANAGEMENT',
            name: 'apply.approve.lyrical.report',//舆情报告
            routePath: '/application/report_send',
            component: `${MODULE_PATH}report_send/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_OPINION_MANAGE']
        }, {
            id: 'DOCUMENTWRITING_APPLY_MANAGEMENT',
            name: 'apply.approve.document.writing',//文件撰写
            routePath: '/application/document_write',
            component: `${MODULE_PATH}document_write/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_DOCUMENT_MANAGE']
        },
        //     {
        //     //todo 待修改的！！！！！！
        //     id: 'MY_LAEVE_APPLY_MANAGEMENT',
        //     name: 'apply.my.self.setting.work.flow',//我的自定义流程
        //     routePath: '/application/self_setting',
        //     component: `${MODULE_PATH}self_setting/public`,
        //     //有这个权限，才显示入口图标
        //     showPrivileges: ['MEMBER_DOCUMENT_MANAGE']
        // }
        ]
    },
    {
        id: 'NOTIFICATION',//唯一标识 - 通知
        name: 'menu.notification',//通知
        routePath: '/notification_system',
        component: `${MODULE_PATH}notification/public`,
        shortName: 'menu.notification',//通知
        bottom: true,
        //有这个权限，才显示入口图标
        showPrivileges: ['NOTIFICATION_SYSTEM_LIST']
    },
    {
        id: 'BACKGROUND_MANAGEMENT',//唯一标识
        name: 'menu.shortName.config',//设置
        routePath: '/background_management',
        shortName: 'menu.shortName.config',//设置
        bottom: true,
        // subMenuPosition: 'left',//二级菜单的展示位置，顶部还是左侧展示（默认: 'top'）
        subMenu: [
            {
                id: 'USER_MANAGE', //唯一标识
                name: 'menu.user',//成员管理
                routePath: '/background_management/user',
                component: `${MODULE_PATH}user_manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['USER_MANAGE_LIST_USERS']
            }, {
                id: 'SALESTEAM',
                name: 'menu.salesteam',//团队管理
                routePath: '/background_management/sales_team',
                component: `${MODULE_PATH}sales_team/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['BGM_SALES_TEAM_LIST']
            }, {
                id: 'SALESSTAGE',
                name: 'crm.order.stage.manage',//订单阶段管理
                routePath: '/background_management/sales_stage',
                component: `${MODULE_PATH}sales_stage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['BGM_SALES_STAGE_ADD']
            },{
                id: 'CONFIGARATION',
                name: 'menu.config',//配置
                routePath: '/background_management/configaration',
                component: `${MODULE_PATH}config_manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['CRM_COMPETING_PRODUCT']
            }, {
                id: 'INTEGRATION',
                name: 'config.integration',//集成
                routePath: '/background_management/integration',
                component: `${MODULE_PATH}integration_config/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['PRODUCTS_MANAGE']
            },
            {
                id: 'OPENAPP',
                name: 'app.title',//应用管理
                routePath: '/background_management/openApp',
                component: `${MODULE_PATH}app_open_manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['ROLEP_RIVILEGE_ROLE_CLIENT_LIST']
            },
            {
                id: 'PRODUCTIONS',
                name: 'config.product.manage',//产品管理
                routePath: '/background_management/products',
                component: `${MODULE_PATH}production-manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['PRODUCTS_MANAGE']
            },
            // {
            //     id: 'APPLY_APPROVE',
            //     name: 'config.apply.manage',//申请审批管理
            //     routePath: '/background_management/apply_approve',
            //     component: `${MODULE_PATH}apply_approve_manage/public`,
            //     //todo 权限名称待修改= 有这个权限，才显示入口图标
            //     showPrivileges: ['PRODUCTS_MANAGE']
            // }
        ]
    },
    {
        id: 'USER_INFO_MANAGE',//唯一标识
        name: 'menu.userinfo',//个人资料
        routePath: '/user_info_manage',
        bottom: true,
        subMenu: [{
            id: 'USER_INFO',
            name: 'menu.userinfo',//个人资料
            routePath: '/user_info_manage/user_info',
            component: `${MODULE_PATH}user_info/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_INFO_USER']
        }, {
            id: 'USER_PASSWORD',
            name: 'menu.user.password',//密码管理
            routePath: '/user_info_manage/user_pwd',
            component: `${MODULE_PATH}user_password/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_INFO_PWD']
        }]
    },
    {
        id: 'NO_MATCH',
        routePath: '*',
        component: 'public/sources/404'
    }
];

exports.routers = routers;