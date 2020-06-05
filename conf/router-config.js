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
        id: 'CLUES_RECOMMEND',
        name: 'clue.find.recommend.clue',//找线索
        routePath: '/leads-recommend',
        component: `${MODULE_PATH}clue_customer/public/views/recomment_clues`,
        shortName: 'clue.find.recommend.clue',//找线索
        //有这个权限，才显示入口图标
        showPrivileges: ['CURTAO_CRM_COMPANY_STORAGE']
    },
    {
        id: 'ClUE_CUSTOMER',
        name: 'versions.feature.lead.management',//线索管理
        routePath: '/leads',
        component: `${MODULE_PATH}clue_customer/public`,
        shortName: 'versions.feature.lead.management',//线索管理
        //有这个权限，才显示入口图标
        showPrivileges: ['CURTAO_CRM_LEAD_QUERY_ALL', 'CURTAO_CRM_LEAD_QUERY_SELF']
    },
    {
        id: 'CRM',
        name: 'call.record.customer',//客户
        routePath: '/accounts',
        component: `${MODULE_PATH}crm/public`,
        shortName: 'call.record.customer',//客户
        //有这个权限，才显示入口图标
        showPrivileges: ['CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL']
    },
    {
        id: 'DEAL_MANAGE',
        name: 'user.apply.detail.order',//订单
        routePath: '/deals',
        component: `${MODULE_PATH}deal_manage/public`,
        shortName: 'user.apply.detail.order',//订单
        //有这个权限，才显示入口图标
        showPrivileges: ['CRM_MANAGER_LIST_SALESOPPORTUNITY','SALESOPPORTUNITY_QUERY']
    },
    {
        id: 'CALL_RECORD',
        name: 'menu.shortName.call',//通话
        routePath: '/call-records',
        component: `${MODULE_PATH}call_record/public`,
        shortName: 'menu.shortName.call',//通话
        //有这个权限，才显示入口图标
        showPrivileges: ['CURTAO_CRM_TRACE_QUERY_ALL', 'CURTAO_CRM_TRACE_QUERY_SELF']
    },
    {
        id: 'APP_USER_MANAGE',//唯一标识
        name: 'crm.detail.user',//用户
        routePath: '/users',
        shortName: 'crm.detail.user',//用户
        subMenu: [{
            id: 'APP_USER_MANAGE_USER',
            name: 'menu.appuser.list',//用户列表
            routePath: '/users/list',
            component: `${MODULE_PATH}app_user_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['APP_USER_QUERY']
        }, {
            id: 'USER_AUDIT_LOG', // 用户审计日志的唯一标识
            name: 'menu.appuser.auditlog',//操作记录
            routePath: '/users/logs',
            component: `${MODULE_PATH}app_user_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_AUDIT_LOG_LIST']
        }, {
            id: 'ACTIVE_USER_LIST', // 活跃用户
            name: 'menu.active.user.lists',//活跃用户
            routePath: '/users/active',
            component: `${MODULE_PATH}app_user_manage/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['APP_USER_QUERY']
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
                routePath: '/analysis/data',
                component: `${MODULE_PATH}analysis/public`,
                //有这个权限，才显示入口图标
                showPrivileges: [
                    'CURTAO_CRM_CUSTOMER_ANALYSIS_SELF',
                    'CURTAO_CRM_CUSTOMER_ANALYSIS_ALL',
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
                        routePath: '/analysis/report/weekly',
                        component: `${MODULE_PATH}weekly_report/public`,
                        showPrivileges: [
                            'CURTAO_CRM_CUSTOMER_ANALYSIS_ALL',
                            'CURTAO_CRM_CUSTOMER_ANALYSIS_SELF'
                        ],
                    },
                    //月报统计
                    {
                        id: 'MONTHLY_REPORT_ANALYSIS',//唯一标识
                        name: 'contract.15',//月报
                        routePath: '/analysis/report/monthly',
                        component: `${MODULE_PATH}monthly-report/public`,
                        showPrivileges: [
                            'CURTAO_CRM_CUSTOMER_ANALYSIS_ALL',
                            'CURTAO_CRM_CUSTOMER_ANALYSIS_SELF'
                        ],
                    },
                    //销售报告
                    {
                        id: 'SALES_REPORT_ANALYSIS',//唯一标识
                        name: 'common.individual.report',//个人报告
                        routePath: '/analysis/report/personal',
                        component: `${MODULE_PATH}sales-report/public`,
                        //有这个权限，才显示入口图标
                        showPrivileges: [
                            'CRM_CONTRACT_SALES_REPORTS_MANAGER',
                            'CRM_CONTRACT_SALES_REPORTS_COMMON'
                        ]
                    },
                    //销售经理日报
                    {
                        id: 'SALES_MANAGER_DAILY_REPORT',
                        name: 'analysis.sales.manager.daily.report',
                        routePath: '/analysis/report/daily-report',
                        component: `${MODULE_PATH}daily-report`,
                        showPrivileges: [
                            'CRM_DAILY_REPORT'
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
        routePath: '/calendar',
        component: `${MODULE_PATH}schedule_management/public`,
        shortName: 'menu.shortName.schedule',//日程
        //有这个权限，才显示入口图标
        showPrivileges: ['MEMBER_SCHEDULE_MANAGE']
    },
    {
        id: 'APPLICATION_APPLY_MANAGEMENT',
        name: 'crm.109',//申请
        routePath: '/apply',
        shortName: 'crm.109',//申请
        component: `${MODULE_PATH}apply_approve_list/public`,
        showPrivileges: ['WORKFLOW_BASE_PERMISSION']//申请审批工作流程的基础权限，只有专业版以上才有此权限
    },
    {
        id: 'NOTIFICATION',//唯一标识 - 通知
        name: 'menu.notification',//通知
        routePath: '/notifications',
        component: `${MODULE_PATH}notification/public`,
        shortName: 'menu.notification',//通知
        bottom: true,
        //有这个权限，才显示入口图标
        showPrivileges: ['BASE_QUERY_PERMISSION_APPLICATION']
    },
    {
        id: 'BACKGROUND_MANAGEMENT',//唯一标识
        name: 'menu.shortName.config',//设置
        routePath: '/settings',
        shortName: 'menu.shortName.config',//设置
        bottom: true,
        subMenuPosition: 'left',//二级菜单的展示位置，顶部还是左侧展示（默认: 'top'）
        subMenu: [
            {
                id: 'MEMBER', //唯一标识
                name: 'menu.member',//成员
                routePath: '/settings/members',
                component: `${MODULE_PATH}sales_team/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['USER_MANAGE_LIST_USERS', 'BGM_SALES_TEAM_LIST']
            },
            {
                id: 'PRODUCTIONS',
                name: 'menu.product',// 产品
                routePath: '/settings/products',
                component: `${MODULE_PATH}production-manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['PRODUCTS_MANAGE']
            },
            {
                id: 'APPLY_APPROVE',
                name: 'menu.apply.approve',//申请审批
                routePath: '/settings/applies',
                component: `${MODULE_PATH}apply_approve_manage/public`,
                //todo 权限名称待修改= 有这个权限，才显示入口图标
                showPrivileges: ['WORKFLOW_CONFIG_CUSTOMIZE']
            },
            {
                id: 'ORDERSTAGE',
                name: 'menu.order.stage',// 订单阶段
                routePath: '/settings/deals/stages',
                component: `${MODULE_PATH}sales_stage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['BGM_SALES_STAGE_ADD']
            },
            {
                id: 'INDUSTRY',
                name: 'menu.industry',// 行业
                routePath: '/settings/industry',
                component: `${MODULE_PATH}industry/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['ORGANIZATION_CONFIG']
            },
            {
                id: 'COMPETE',
                name: 'menu.competing.product',// 竞品
                routePath: '/settings/competing/products',
                component: `${MODULE_PATH}competing_product/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['CRM_COMPETING_PRODUCT']
            },
            {
                id: 'CLUE_ASSIGNMENT',
                name: 'menu.clue.allocation', //线索分配
                routePath: '/settings/leads/assignment',
                component: `${MODULE_PATH}clue_assignment/public`,
                showPrivileges: ['CURTAO_RULE_MANAGE']
            },
            {
                id: 'SALES_AUTO',
                name: 'menu.sales.auto.manage.config',// 销售自动化
                routePath: '/settings/automation',
                component: `${MODULE_PATH}sales_auto/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['CURTAO_RULE_MANAGE']
            },
            // 暂时隐藏，待相关功能都完成后再放开
            // {
            //     id: 'SALES_PROCESS', // 唯一标识
            //     name: 'menu.sales.process',// 客户阶段
            //     routePath: '/settings/accounts/stages',
            //     component: `${MODULE_PATH}sales_process/public`,
            //     showPrivileges: ['CRM_GET_SALES_PROCESS']
            // },
            {
                id: 'CLUE_INTEGRATION', // 唯一标识
                name: 'menu.clue.integration',// 线索集成
                routePath: '/settings/leads/integration',
                component: `${MODULE_PATH}clue_integration/public`,
                showPrivileges: ['DATA_INTEGRATION_MANAGE']
            },
            {
                id: 'FIELD_MANAGE',
                name: 'menu.field.manage',// 字段管理
                routePath: '/settings/field',
                component: `${MODULE_PATH}custom_field_manage/public`,
                //有这个权限，才显示入口图标
                showPrivileges: ['ORGANIZATION_CUSTOMIZEDVAR_QUERY']
            }]
    },
    {
        id: 'USER_INFO_MANAGE',//唯一标识
        name: 'menu.userinfo',//个人资料
        routePath: '/user-preference',
        bottom: true,
        subMenu: [{
            id: 'USER_INFO',
            name: 'menu.userinfo',//个人资料
            routePath: '/user-preference/info',
            component: `${MODULE_PATH}user_info/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['BASE_QUERY_PERMISSION_MEMBER']
        }, {
            id: 'USER_PASSWORD',
            name: 'menu.user.password',//密码管理
            routePath: '/user-preference/password',
            component: `${MODULE_PATH}user_password/public`,
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_INFO_UPDATE']
        },{
            id: 'USER_INFO_OPERATE_RECORD',
            name: 'menu.appuser.auditlog',// 操作记录
            routePath: '/user-preference/operate-record',
            component: `${MODULE_PATH}user_info/public/views/operate-record`,
            //有这个权限，才显示入口图标
            showPrivileges: ['BASE_QUERY_PERMISSION_MEMBER']
        }, {
            id: 'USER_PASSWORD',
            name: 'user.trade.record',//购买记录
            routePath: '/user-preference/trade-record',
            component: `${MODULE_PATH}user_info/public/views/trade-record`,
            //有这个权限，才显示入口图标
            showPrivileges: ['BASE_QUERY_PERMISSION_MEMBER']
        }]
    }, {
        id: 'NO_MATCH',
        routePath: '*',
        component: 'public/sources/404'
    }
];

exports.routers = routers;
