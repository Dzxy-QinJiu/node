/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/19.
 */
const MODULE_PATH = 'modules/';

let routers = [
    {
        id: 'HOME_PAGE', //唯一标识，首页
        name: 'menu.home.page',//首页
        routePath: '/home',
        isNotShow: 'true',//不在菜单中展示
        component: `${MODULE_PATH}home_page/public`,
        //有这个权限，才显示入口图标
        showPrivileges: ['BASE_QUERY_PERMISSION_MEMBER']
    },
    {
        id: 'ClUE_CUSTOMER',
        name: 'crm.sales.clue',//线索
        routePath: '/clue_customer',
        component: `${MODULE_PATH}clue_customer/public`,
        shortName: 'crm.sales.clue',//线索
        //有这个权限，才显示入口图标
        showPrivileges: ['CURTAO_CRM_LEAD_QUERY_ALL', 'CURTAO_CRM_LEAD_QUERY_SELF']
    },
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
        id: 'DEAL_MANAGE',
        name: 'user.apply.detail.order',//订单
        routePath: '/deal_manage',
        component: `${MODULE_PATH}deal_manage/public`,
        shortName: 'user.apply.detail.order',//订单
        //有这个权限，才显示入口图标
        showPrivileges: ['CRM_MANAGER_LIST_SALESOPPORTUNITY','SALESOPPORTUNITY_QUERY']
    },
    {
        id: 'CALL_RECORD',
        name: 'menu.shortName.call',//通话
        routePath: '/call_record',
        component: `${MODULE_PATH}call_record/public`,
        shortName: 'menu.shortName.call',//通话
        //有这个权限，才显示入口图标
        showPrivileges: ['CURTAO_CRM_TRACE_QUERY_ALL', 'CURTAO_CRM_TRACE_QUERY_SELF']
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
            showPrivileges: ['APP_USER_QUERY']
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
                    'CRM_CONTRACT_ANALYSIS',
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
                            'CRM_CONTRACT_ANALYSIS',
                        ],
                    },
                    //月报统计
                    {
                        id: 'MONTHLY_REPORT_ANALYSIS',//唯一标识
                        name: 'contract.15',//月报
                        routePath: '/analysis/report/monthly_report',
                        component: `${MODULE_PATH}monthly-report/public`,
                        showPrivileges: [
                            'CRM_CONTRACT_ANALYSIS',
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
                            'CRM_CONTRACT_ANALYSIS',
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
        showPrivileges: ['CURTAO_CRM_CALLRECORD_STATISTICS']// 获取我的电话统计记录
    },
    {
        id: 'SALES_HOME_PAGE', //唯一标识，销售首页
        name: 'menu.sales.homepage',//销售主页
        routePath: '/sales/home',
        isNotShow: 'true',//不在菜单中展示
        component: `${MODULE_PATH}sales_home_page/public`,
        //有这个权限，才显示入口图标
        showPrivileges: ['CURTAO_CRM_CALLRECORD_STATISTICS']// 获取我的电话统计记录
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
            name: 'menu.appuser.apply',//用户申请
            routePath: '/application/user_apply',
            component: `${MODULE_PATH}user_apply/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USERAPPLY_BASE_PERMISSION']

        }, {
            id: 'SALES_BUSSINESS_APPLY_MANAGEMENT',
            name: 'leave.apply.sales.oppotunity',//机会申请
            routePath: '/application/sales_opportunity',
            component: `${MODULE_PATH}sales_opportunity/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_BUSINESSOPPO_APPLY_APPROVE']
        }, {
            id: 'BUSSINESS_APPLY_MANAGEMENT',
            name: 'leave.apply.add.leave.apply',//出差申请
            routePath: '/application/business_apply',
            component: `${MODULE_PATH}business-apply/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['BUSINESS_TRIP_APPLY_APPROVE']
        }, {
            id: 'LEAVE_APPLY_MANAGEMENT',
            name: 'leave.apply.leave.application',//请假申请
            routePath: '/application/leave_apply',
            component: `${MODULE_PATH}leave-apply/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_LEAVE_APPLY_APPROVE']
        }, {
            id: 'REPORTSEND_APPLY_MANAGEMENT',
            name: 'apply.approve.lyrical.report',//舆情报告
            routePath: '/application/report_send',
            component: `${MODULE_PATH}report_send/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_REPORT_APPLY_APPROVE']
        }, {
            id: 'DOCUMENTWRITING_APPLY_MANAGEMENT',
            name: 'apply.approve.document.writing',//文件撰写
            routePath: '/application/document_write',
            component: `${MODULE_PATH}document_write/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_REPORT_APPLY_APPROVE']
        },
        {
            //todo 待修改的！！！！！！
            id: 'MY_LEAVE_APPLY_MANAGEMENT',
            name: 'apply.my.self.setting.work.flow',//拜访申请
            routePath: '/application/self_setting',
            component: `${MODULE_PATH}self_setting/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_REPORT_APPLY_APPROVE']
        }, {
            //todo 待修改的！！！！！！
            id: 'MY_DOMAIN_APPLY_MANAGEMENT',
            name: 'apply.domain.application.work.flow',//申请
            routePath: '/application/domain_name',
            component: `${MODULE_PATH}domain_application/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_REPORT_APPLY_APPROVE']
        }
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
        subMenuPosition: 'left',//二级菜单的展示位置，顶部还是左侧展示（默认: 'top'）
        subMenu: [
            {
                id: 'MEMBER', //唯一标识
                name: 'menu.member',//成员
                routePath: '/background_management/member',
                component: `${MODULE_PATH}sales_team/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['USER_MANAGE_LIST_USERS', 'BGM_SALES_TEAM_LIST']
            },
            {
                id: 'PRODUCTIONS',
                name: 'menu.product',// 产品
                routePath: '/background_management/products',
                component: `${MODULE_PATH}production-manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['PRODUCTS_MANAGE']
            },
            {
                id: 'APPLY_APPROVE',
                name: 'menu.apply.approve',//申请审批
                routePath: '/background_management/apply_approve',
                component: `${MODULE_PATH}apply_approve_manage/public`,
                //todo 权限名称待修改= 有这个权限，才显示入口图标
                showPrivileges: ['PRODUCTS_MANAGE']
            },
            {
                id: 'ORDERSTAGE',
                name: 'menu.order.stage',// 订单阶段
                routePath: '/background_management/sales_stage',
                component: `${MODULE_PATH}sales_stage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['BGM_SALES_STAGE_ADD']
            },
            {
                id: 'INDUSTRY',
                name: 'menu.industry',// 行业
                routePath: '/background_management/industry',
                component: `${MODULE_PATH}industry/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['ORGANIZATION_CONFIG']
            },
            {
                id: 'COMPETE',
                name: 'menu.competing.product',// 竞品
                routePath: '/background_management/competing/product',
                component: `${MODULE_PATH}competing_product/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['CRM_COMPETING_PRODUCT']
            },
            {
                id: 'CLUE_ASSIGNMENT',
                name: 'menu.clue.allocation', //线索分配
                routePath: '/background_management/clue_assignment',
                component: `${MODULE_PATH}clue_assignment/public`,
                showPrivileges: ['CURTAO_RULE_MANAGE']
            },
            {
                id: 'SALES_AUTO',
                name: 'menu.sales.auto.manage.config',// 销售自动化
                routePath: '/background_management/sales_auto',
                component: `${MODULE_PATH}sales_auto/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['CURTAO_RULE_MANAGE']
            },
            // 暂时隐藏，待相关功能都完成后再放开
            // {
            //     id: 'SALES_PROCESS', // 唯一标识
            //     name: 'menu.sales.process',// 客户阶段
            //     routePath: '/background_management/customer_stage',
            //     component: `${MODULE_PATH}sales_process/public`,
            //     showPrivileges: ['CRM_GET_SALES_PROCESS']
            // },
            {
                id: 'CLUE_INTEGRATION', // 唯一标识
                name: 'menu.clue.integration',// 线索集成
                routePath: '/background_management/clue_integration',
                component: `${MODULE_PATH}clue_integration/public`,
                showPrivileges: ['DATA_INTEGRATION_MANAGE']
            }]
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
            showPrivileges: ['BASE_QUERY_PERMISSION_MEMBER']
        }, {
            id: 'USER_PASSWORD',
            name: 'menu.user.password',//密码管理
            routePath: '/user_info_manage/user_pwd',
            component: `${MODULE_PATH}user_password/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_INFO_UPDATE']
        }]
    },
    //todo 申请审批代码优化后会去掉
    {
        id: 'APPLICATION_APPLY_MANAGEMENT1',
        name: 'crm.109',//申请
        routePath: '/application',
        shortName: 'crm.109',//申请
        component: `${MODULE_PATH}/setting_workflow_tip/public`,
    },
    {
        id: 'NO_MATCH',
        routePath: '*',
        component: 'public/sources/404'
    }
];

exports.routers = routers;