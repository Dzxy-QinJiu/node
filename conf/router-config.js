/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/19.
 */
const MODULE_PATH = 'modules/';

let routers = [
    {
        id: 'CRM',
        name: 'menu.crm',//客户管理
        routePath: '/crm',
        component: `${MODULE_PATH}crm/public`,
        shortName: 'call.record.customer',//客户
        privileges: [
            'CUSTOMER_ALL',
            'CRM_LIST_CUSTOMERS',
            'CRM_CUSTOMER_INFO',
            'CRM_CUSTOMER_INFO_EDIT',
            'CRM_LIST_CONTACTS',//列出联系人
            'CRM_DELETE_CONTACT',//删除联系人
            'CRM_SET_DEFAULT_CONTACT',//设置默认联系人
            'CRM_ADD_CONTACT',//添加联系人
            'CRM_EDIT_CONTACT',//修改联系人
            'CRM_REPEAT',//客户查重
            'CUSTOMER_DELETE',//删除重复客户
            'CUSTOMER_UPDATE'//合并重复客户
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['CRM_LIST_CUSTOMERS', 'CUSTOMER_ALL']
    },
    {
        id: 'ClUE_CUSTOMER',
        name: 'sales.lead.customer',//线索客户
        routePath: '/clue_customer',
        component: `${MODULE_PATH}clue_customer/public`,
        shortName: 'crm.sales.clue',//线索
        privileges: [
            'CLUECUSTOMER_VIEW',
            'CUSTOMER_ACCESS_CHANNEL_GET',//获取接入渠道
            'CUSTOMER_CLUE_SOURCE_GET'//获取线索来源
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['CLUECUSTOMER_VIEW']
    },
    {
        id: 'DEAL_MANAGE',
        name: 'deal.manage',//订单管理
        routePath: '/deal_manage',
        component: `${MODULE_PATH}deal_manage/public`,
        shortName: 'user.apply.detail.order',//订单
        privileges: [
            //TODO 换成订单的权限
            'CRM_REPEAT'
        ],
        //有这个权限，才显示入口图标 TODO 换成订单的权限
        showPrivileges: ['CRM_REPEAT']
    },
    {
        id: 'CALL_RECORD',
        name: 'menu.call',//通话记录
        routePath: '/call_record',
        component: `${MODULE_PATH}call_record/public`,
        shortName: 'menu.shortName.call',//通话
        privileges: [
            'CUSTOMER_CALLRECORD_SALE_ONLY'//通话记录的查询
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['CUSTOMER_CALLRECORD_SALE_ONLY']
    },
    {
        id: 'APP_USER_MANAGE',//唯一标识
        name: 'menu.appuser',//用户管理
        routePath: '/user',
        shortName: 'crm.detail.user',//用户
        subMenu: [{
            id: 'APP_USER_MANAGE_USER',
            name: 'menu.appuser.list',//用户列表
            routePath: '/user/list',
            component: `${MODULE_PATH}app_user_manage/public`,
            privileges: [
                'APP_USER_LIST',//列出应用用户
                'APP_USER_ADD',//添加应用用户
                'APP_USER_EDIT',//修改应用用户
                'USER_BATCH_OPERATE'//批量操作用户
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['APP_USER_LIST']
        }, {
            id: 'ORGANIZATION_MANAGE',
            name: 'menu.appuser.org',//组织管理
            routePath: '/user/organization',
            component: `${MODULE_PATH}organization_manage/public`,
            privileges: [
                'USER_ORGANIZATION_LIST',//查看用户组织列表
                'USER_ORGANIZATION_MEMBER_ADD',//用户组织添加成员
                'USER_ORGANIZATION_MEMBER_DELETE',//用户组织删除成员
                'USER_ORGANIZATION_MEMBER_EDIT',//用户组织成员的编辑
                'USER_ORGANIZATION_ADD',//用户组织添加
                'USER_ORGANIZATION_DELETE',//用户组织删除
                'USER_ORGANIZATION_EDIT'//用户组织修改
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_ORGANIZATION_LIST']
        }, {
            id: 'USER_AUDIT_LOG', // 用户审计日志的唯一标识
            name: 'menu.appuser.auditlog',//操作记录
            routePath: '/user/log',
            component: `${MODULE_PATH}app_user_manage/public`,
            privileges: [
                'USER_AUDIT_LOG_LIST' // 查看用户审计日志
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_AUDIT_LOG_LIST']
        }, {
            id: 'ACTIVE_USER_LIST', // 活跃用户
            name: 'menu.active.user.lists',//活跃用户
            routePath: '/user/active',
            component: `${MODULE_PATH}app_user_manage/public`,
            privileges: [
                'USER_TIME_LINE' // 查看用户变更记录
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_TIME_LINE']
        }, {
            id: 'POSITION_MANAGE', // 座席号管理的唯一标识
            name: 'menu.appuser.position',//座席号管理
            routePath: '/user/position',
            component: `${MODULE_PATH}position_manage/public`,
            privileges: [
                'MEMBER_PHONE_ORDER_MANAGE' // （实际权限）座席号添加、修改、删除、绑定，显示列表
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_PHONE_ORDER_MANAGE']
        }]
    },
    {
        id: 'OPLATE_ANALYSIS',//唯一标识
        name: 'menu.customer.analysis',//运营分析
        routePath: '/analysis',
        shortName: 'user.detail.analysis',//分析
        subMenu: [
            {
                id: 'ANALYSIS',//唯一标识
                name: 'user.detail.analysis',//分析
                routePath: '/analysis/analysis',
                component: `${MODULE_PATH}analysis/public`,
                privileges: ['CUSTOMER_ANALYSIS_COMMON', 'CUSTOMER_ANALYSIS_MANAGER'],
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
                privileges: [
                    'CALL_RECORD_VIEW_MANAGER',
                    'CALL_RECORD_VIEW_USER',
                ],
                //有这个权限，才显示入口图标
                showPrivileges: [
                    'CALL_RECORD_VIEW_MANAGER',
                    'CALL_RECORD_VIEW_USER',
                ],
                subMenu: [
                    //周报统计
                    {
                        id: 'WEEKLY_REPORT_ANALYSIS',//唯一标识
                        name: 'contract.14',//周报
                        routePath: '/analysis/report/weekly_report',
                        component: `${MODULE_PATH}weekly_report/public`,
                        privileges: [
                            'KETAO_SALES_TEAM_WEEKLY_REPORTS_MANAGER',
                            'KETAO_SALES_TEAM_WEEKLY_REPORTS_COMMON',
                        ],
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
                        privileges: [
                            'CALLRECORD_ASKFORLEAVE_QUERY_MANAGER',
                            'CALLRECORD_ASKFORLEAVE_QUERY_USER',
                        ],
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
                        privileges: [
                            'CURTAO_SALES_REPORTS_COMMON',
                            'CURTAO_SALES_REPORTS_MANAGER',
                        ],
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
        privileges: [
            'GET_MY_CALL_RECORD',// 获取我的电话统计记录
            'GET_ALL_CALL_RECORD'
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['GET_MY_CALL_RECORD', 'GET_ALL_CALL_RECORD']// 获取我的电话统计记录
    },
    {
        id: 'SALES_HOME_PAGE', //唯一标识，销售首页
        name: 'menu.sales.homepage',//销售主页
        routePath: '/sales/home',
        isNotShow: 'true',//不在菜单中展示
        component: `${MODULE_PATH}sales_home_page/public`,
        privileges: [
            'GET_MY_CALL_RECORD',// 获取我的电话统计记录
            'GET_ALL_CALL_RECORD'
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['GET_MY_CALL_RECORD', 'GET_ALL_CALL_RECORD']// 获取我的电话统计记录
    },
    {
        id: 'CONTRACT',
        name: 'menu.contract',//合同管理
        routePath: '/contract',
        shortName: 'contract.125',//合同
        privileges: [
            'OPLATE_CONTRACT_QUERY',
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['OPLATE_CONTRACT_QUERY'],
        subMenu: [{
            id: 'CONTRACT_DASHBOARD',
            name: 'contract.175',//合同概览
            routePath: '/contract/dashboard',
            component: `${MODULE_PATH}contract/dashboard`,
            privileges: ['OPLATE_SALES_COST_QUERY'],
            showPrivileges: ['OPLATE_SALES_COST_QUERY']
        }, {
            id: 'CONTRACT_SALES_LIST',
            name: 'contract.112',//销售合同
            routePath: '/contract/sell',
            component: `${MODULE_PATH}contract/public`,
            privileges: ['OPLATE_CONTRACT_UPLOAD'],
            showPrivileges: ['OPLATE_CONTRACT_UPLOAD']
        }, {
            id: 'CONTRACT_BUY_LIST',
            name: 'contract.9',//采购合同
            routePath: '/contract/buy',
            component: `${MODULE_PATH}contract/public`,
            privileges: ['OPLATE_CONTRACT_QUERY'],
            showPrivileges: ['OPLATE_CONTRACT_QUERY']
        }, {
            id: 'CONTRACT_REPAYMENT_LIST',
            name: 'contract.102',//合同回款
            routePath: '/contract/repayment',
            component: `${MODULE_PATH}contract/public`,
            privileges: ['OPLATE_REPAYMENT_ADD'],
            showPrivileges: ['OPLATE_REPAYMENT_ADD']
        }, {
            id: 'CONTRACT_COST_LIST',
            name: 'contract.133',//费用
            routePath: '/contract/cost',
            component: `${MODULE_PATH}contract/public`,
            privileges: ['OPLATE_PAYMENT_ADD'],
            showPrivileges: ['OPLATE_PAYMENT_ADD']
        }, {
            id: 'CONTRACT_ANALYSIS',
            name: 'contract.188',//分析
            routePath: '/contract/analysis',
            component: `${MODULE_PATH}contract/analysis/public`,
            privileges: ['OPLATE_CONTRACT_ANALYSIS'],
            showPrivileges: ['OPLATE_CONTRACT_ANALYSIS']
        }, {
            id: 'CONTRACT_SALES_COMMISSION',
            name: 'contract.181',//提成计算
            routePath: '/contract/sales_commission',
            component: `${MODULE_PATH}sales_commission/public`,
            privileges: ['OPLATE_CONTRACT_SALERS_COMMISSION'],
            showPrivileges: ['OPLATE_CONTRACT_SALERS_COMMISSION']
        }, {
            id: 'CONTRACT_COMMISSION_PAYMENT',
            name: 'contract.189',//提成发放
            routePath: '/contract/commission_payment',
            component: `${MODULE_PATH}commission_payment/public`,
            privileges: ['OPLATE_CONTRACT_SALERS_COMMISSION_RECORD'],
            showPrivileges: ['OPLATE_CONTRACT_SALERS_COMMISSION_RECORD']
        }]
    },
    {
        id: 'SCHEDULE_MANAGEMENT',
        name: 'schedule.list.management',//日程管理
        routePath: '/schedule_management',
        component: `${MODULE_PATH}schedule_management/public`,
        shortName: 'menu.shortName.schedule',//日程
        privileges: [
            'MEMBER_SCHEDULE_MANAGE'//日程管理的查询
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['MEMBER_SCHEDULE_MANAGE']
    },
    {
        id: 'APPLICATION_APPLY_MANAGEMENT',
        name: 'menu.leave.apply.list.management',//申请审批
        routePath: '/application',
        shortName: 'menu.leave.apply.list.management',//申请审批
        subMenu: [{
            id: 'APP_USER_MANAGE_APPLY',
            name: 'menu.appuser.apply',//用户审批
            routePath: '/application/user_apply',
            component: `${MODULE_PATH}user_apply/public`,
            privileges: [
                'APP_USER_APPLY_LIST',//列出申请应用用户
                'APP_USER_APPLY_APPROVAL',//审批申请
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['APP_USER_APPLY_LIST']

        }, {
            id: 'BUSSINESS_APPLY_MANAGEMENT',
            name: 'leave.apply.add.leave.apply',//出差申请
            routePath: '/application/business_apply',
            component: `${MODULE_PATH}business-apply/public`,
            privileges: [
                'BUSINESS_TRIP_MANAGE'
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['BUSINESS_TRIP_MANAGE']
        }, {
            id: 'SALES_BUSSINESS_APPLY_MANAGEMENT',
            name: 'leave.apply.sales.oppotunity',//机会申请
            routePath: '/application/sales_opportunity',
            component: `${MODULE_PATH}sales_opportunity/public`,
            privileges: [
                'MEMBER_BUSINESSOPPO_MANAGE'
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_BUSINESSOPPO_MANAGE']
        }, {
            id: 'LEAVE_APPLY_MANAGEMENT',
            name: 'leave.apply.leave.application',//请假申请
            routePath: '/application/leave_apply',
            component: `${MODULE_PATH}leave-apply/public`,
            privileges: [
                'MEMBER_LEAVE_MANAGE'
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['MEMBER_LEAVE_MANAGE']
        }]
    },
    {
        id: 'NOTIFICATION',//唯一标识 - 通知
        name: 'menu.system.notification',//系统消息
        routePath: '/notification_system',
        component: `${MODULE_PATH}notification/public`,
        shortName: 'menu.notification',//通知
        bottom: true,
        privileges: [
            'NOTIFICATION_SYSTEM_LIST'//查看通知-系统消息
        ],
        //有这个权限，才显示入口图标
        showPrivileges: ['NOTIFICATION_SYSTEM_LIST']
    },
    {
        id: 'BACKGROUND_MANAGEMENT',//唯一标识
        name: 'menu.backend',//后台管理
        routePath: '/background_management',
        shortName: 'menu.shortName.config',//设置
        bottom: true,
        subMenu: [
            {
                id: 'USER_MANAGE', //唯一标识
                name: 'menu.user',//成员管理
                routePath: '/background_management/user',
                component: `${MODULE_PATH}user_manage/public`,
                privileges: [
                    'USER_MANAGE_ADD_USER', //添
                    'USER_MANAGE_EDIT_USER', //改
                    //"USER_MANAGE_DELETE_USER",//删
                    'USER_MANAGE_LIST_USERS',//查
                    //"USER_MANAGE_USE",//停用、启用
                    'USER_MANAGE_LIST_LOG'//个人日志
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['USER_MANAGE_LIST_USERS']
            },
            {
                id: 'SALESSTAGE',
                name: 'crm.order.stage.manage',//订单阶段管理
                routePath: '/background_management/sales_stage',
                component: `${MODULE_PATH}sales_stage/public`,
                privileges: [
                    'BGM_SALES_STAGE_LIST',//查看订单阶段
                    'BGM_SALES_STAGE_DELETE',//删除订单阶段
                    'BGM_SALES_STAGE__EDIT',//修改订单阶段
                    'BGM_SALES_STAGE_ADD',//添加订单阶段
                    'BGM_SALES_STAGE_SORT'//订单阶段排序
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['BGM_SALES_STAGE_ADD']
            }, {
                id: 'SALESTEAM',
                name: 'menu.salesteam',//团队管理
                routePath: '/background_management/sales_team',
                component: `${MODULE_PATH}sales_team/public`,
                privileges: [
                    'BGM_SALES_TEAM_LIST',//查看销售团队
                    'BGM_SALES_TEAM_MEMBER_ADD',//销售团队添加成员
                    'BGM_SALES_TEAM_MEMBER_DELETE',//销售团队删除成员
                    'BGM_SALES_TEAM_MEMBER_EDIT',//销售团队成员的编辑
                    'BGM_SALES_TEAM_ADD',//销售团队添加
                    'BGM_SALES_TEAM_DELETE',//销售团队删除
                    'BGM_SALES_TEAM_EDIT'//销售团队修改
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['BGM_SALES_TEAM_LIST']
            }, {
                id: 'CONFIGARATION',
                name: 'menu.config',//配置
                routePath: '/background_management/configaration',
                component: `${MODULE_PATH}config_manage/public`,
                privileges: [
                    'GET_CONFIG_INDUSTRY', // 查看行业管理配置
                    'CREATE_CONFIG_INDUSTRY', // 添加行业管理配置
                    'DELETE_CONFIG_INDUSTRY', // 删除行业管理配置
                    'GET_CONFIG_IP', // 查看IP配置
                    'CREATE_CONFIG_IP', // 添加IP配置
                    'DELETE_CONFIG_IP', // 删除IP配置
                    'CRM_COMPETING_PRODUCT'//竞品管理
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['CRM_COMPETING_PRODUCT']
            },
            {
                id: 'OPENAPP',
                name: 'app.title',//应用管理
                routePath: '/background_management/openApp',
                component: `${MODULE_PATH}app_open_manage/public`,
                privileges: [],
                //有这个权限，才显示入口图标
                showPrivileges: ['ROLEP_RIVILEGE_ROLE_CLIENT_LIST']
            },
            {
                id: 'PRODUCTIONS',
                name: 'config.product.manage',//产品管理
                routePath: '/background_management/products',
                component: `${MODULE_PATH}production-manage/public`,
                privileges: [],
                //有这个权限，才显示入口图标
                showPrivileges: ['PRODUCTS_MANAGE', 'GET_PRODUCTS_LIST']
            }
        ]
    },
    {
        id: 'USER_INFO_MANAGE',//唯一标识
        name: 'menu.userinfo.manage',//个人信息管理
        routePath: '/user_info_manage',
        bottom: true,
        subMenu: [{
            id: 'USER_INFO',
            name: 'menu.userinfo',//个人资料
            routePath: '/user_info_manage/user_info',
            component: `${MODULE_PATH}user_info/public`,
            privileges: [
                'USER_INFO_USER'//查看个人信息
            ],
            //有这个权限，才显示入口图标
            showPrivileges: ['USER_INFO_USER']
        }, {
            id: 'USER_PASSWORD',
            name: 'menu.user.password',//密码管理
            routePath: '/user_info_manage/user_pwd',
            component: `${MODULE_PATH}user_password/public`,
            privileges: [
                'USER_INFO_PWD'//修改密码
            ],
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