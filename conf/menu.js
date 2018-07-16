var _ = require('lodash');
//后端国际化
var BackendIntl = require('../portal/lib/utils/backend_intl');
class LeftMenuClass {
    constructor(req) {
        this.req = req;
    }

    getLeftMenuList() {
        let backendIntl = new BackendIntl(this.req);
        var leftMenuList = [
            {
                id: 'REALM_MANAGE', //唯一标识
                name: backendIntl.get('menu.realm', '安全域管理'),
                routePath: 'realm',
                privileges: [
                    'REALM_MANAGE_ADD_REALM', //添
                    'REALM_MANAGE_EDIT_REALM', //改
                    'REALM_MANAGE_DELETE_REALM',//删
                    'REALM_MANAGE_LIST_REALMS',//查
                    'REALM_MANAGE_USE'//停用、启用
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['REALM_MANAGE_LIST_REALMS']
            }, {
                id: 'APP_OVERVIEW', //唯一标识
                name: '应用概览',
                routePath: 'app_overview',
                privileges: [
                    'GET_APPLICATION_RECORD'//查
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['GET_APPLICATION_RECORD']
            },
            {
                id: 'APP_MANAGE', //唯一标识
                name: backendIntl.get('menu.app', '应用管理'),
                routePath: 'app',
                privileges: [
                    'APP_MANAGE_ADD_APP', //添
                    'APP_MANAGE_EDIT_APP', //改
                    //"APP_MANAGE_DELETE_APP",//删
                    'APP_MANAGE_LIST_APPS',//查
                    'APP_MANAGE_USE',//停用、启用
                    'APP_MANAGE_LIST_LOG'//个人日志
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['APP_MANAGE_LIST_APPS']
            },
            {
                id: 'MY_APP_MANAGE',
                name: backendIntl.get('menu.myapp', '我的应用'),
                routePath: 'my_app',
                privileges: [
                    'USER_INFO_MYAPP',//我的应用列表
                    'USER_INFO_MYAPP_EDIT', //我的应用的修改
                    'USER_INFO_MYAPP_ROLE_ADD',//添加我的应用中的角色
                    'USER_INFO_MYAPP_ROLE_DELETE',//删除我的应用中的角色
                    'USER_INFO_MYAPP_ROLE_EDIT',//修改我的应用中的角色
                    'USER_INFO_MYAPP_ROLE_LIST',//查看我的应用中的角色
                    'USER_INFO_MYAPP_AUTHORITY_ADD',//添加我的应用中的权限
                    'USER_INFO_MYAPP_AUTHORITY_DELETE',//删除我的应用中的权限
                    'USER_INFO_MYAPP_AUTHORITY_EDIT',//修改我的应用中的权限
                    'USER_INFO_MYAPP_AUTHORITY_LIST',//查看我的应用中的权限
                    'REFRESH_SECRET'//刷新应用密钥
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['USER_INFO_MYAPP']
            },
            {
                id: 'CRM',
                name: backendIntl.get('menu.crm', '客户管理'),
                routePath: 'crm',
                privileges: [
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
                showPrivileges: ['CRM_LIST_CUSTOMERS']
            },
            {
                id: 'ClUE_CUSTOMER',
                name: backendIntl.get('sales.lead.customer', '线索客户'),
                routePath: 'clue_customer',
                privileges: [
                    'CLUECUSTOMER_VIEW',
                    'CUSTOMER_ACCESS_CHANNEL_GET',//获取接入渠道
                    'CUSTOMER_CLUE_SOURCE_GET'//获取线索来源
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['CLUECUSTOMER_VIEW']
            },
            {
                id: 'CALL_RECORD',
                name: backendIntl.get('menu.call', '通话记录'),
                routePath: 'call_record',
                privileges: [
                    'CUSTOMER_CALLRECORD_SALE_ONLY'//通话记录的查询
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['CUSTOMER_CALLRECORD_SALE_ONLY']
            },
            {
                id: 'APP_USER_MANAGE',//唯一标识
                name: backendIntl.get('menu.appuser', '用户管理'),
                routePath: 'user',
                subMenu: [{
                    id: 'APP_USER_MANAGE_USER',
                    name: backendIntl.get('menu.appuser.list', '已有用户'),
                    routePath: 'user/list',
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
                    name: backendIntl.get('menu.appuser.org', '组织管理'),
                    routePath: 'user/organization',
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
                    name: backendIntl.get('menu.appuser.auditlog', '用户审计日志'),
                    displayName: backendIntl.get('menu.appuser.auditlog', '用户审计日志'),
                    routePath: 'user/log',
                    privileges: [
                        'USER_AUDIT_LOG_LIST' // 查看用户审计日志
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['USER_AUDIT_LOG_LIST']
                }, {
                    id: 'POSITION_MANAGE', // 座席号管理的唯一标识
                    name: backendIntl.get('menu.appuser.position', '座席号管理'),
                    displayName: backendIntl.get('menu.appuser.position', '座席号管理'),
                    routePath: 'user/position',
                    privileges: [
                        'MEMBER_PHONE_ORDER_MANAGE' // （实际权限）座席号添加、修改、删除、绑定，显示列表
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['MEMBER_PHONE_ORDER_MANAGE']
                }
                ]
            },
            {
                id: 'BACKGROUND_MANAGEMENT',//唯一标识
                name: backendIntl.get('menu.backend', '后台管理'),
                routePath: 'background_management',
                subMenu: [
                    {
                        id: 'USER_MANAGE', //唯一标识
                        name: backendIntl.get('menu.user', '成员管理'),
                        routePath: 'background_management/user',
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
                        id: 'ROLE',
                        name: backendIntl.get('menu.role', '角色管理'),
                        routePath: 'background_management/role',
                        privileges: [
                            'ROLEP_RIVILEGE_ROLE_ADD',//添加角色
                            'ROLEP_RIVILEGE_ROLE_DELETE',//删除角色
                            'ROLEP_RIVILEGE_ROLE_EDIT',//修改角色
                            'ROLEP_RIVILEGE_ROLE_LIST'//查看角色
                        ],
                        //有这个权限，才显示入口图标
                        showPrivileges: ['ROLEP_RIVILEGE_ROLE_LIST']
                    }, {
                        id: 'AUTHORITY',
                        name: backendIntl.get('menu.auth', '权限管理'),
                        routePath: 'background_management/authority',
                        privileges: [
                            'ROLEP_RIVILEGE_AUTHORITY_ADD',//添加权限
                            'ROLEP_RIVILEGE_AUTHORITY_DELETE',//删除权限
                            'ROLEP_RIVILEGE_AUTHORITY_EDIT',//修改权限
                            'ROLEP_RIVILEGE_AUTHORITY_LIST'//查看权限
                        ],
                        //有这个权限，才显示入口图标
                        showPrivileges: ['ROLEP_RIVILEGE_AUTHORITY_LIST']
                    }, {
                        id: 'SALESSTAGE',
                        name: backendIntl.get('menu.salesstage', '销售阶段管理'),
                        routePath: 'background_management/sales_stage',
                        privileges: [
                            'BGM_SALES_STAGE_LIST',//查看销售阶段
                            'BGM_SALES_STAGE_DELETE',//删除销售阶段
                            'BGM_SALES_STAGE__EDIT',//修改销售阶段
                            'BGM_SALES_STAGE_ADD',//添加销售阶段
                            'BGM_SALES_STAGE_SORT'//销售阶段排序
                        ],
                        //有这个权限，才显示入口图标
                        showPrivileges: ['BGM_SALES_STAGE_ADD']
                    }, {
                        id: 'SALESTEAM',
                        name: backendIntl.get('menu.salesteam', '团队管理'),
                        routePath: 'background_management/sales_team',
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
                        name: backendIntl.get('menu.config', '配置'),
                        routePath: 'background_management/configaration',
                        privileges: [
                            'GET_CONFIG_INDUSTRY', // 查看行业管理配置
                            'CREATE_CONFIG_INDUSTRY', // 添加行业管理配置
                            'DELETE_CONFIG_INDUSTRY', // 删除行业管理配置
                            'GET_CONFIG_IP', // 查看IP配置
                            'CREATE_CONFIG_IP', // 添加IP配置
                            'DELETE_CONFIG_IP' // 删除IP配置
                        ],
                        //有这个权限，才显示入口图标
                        showPrivileges: ['CREATE_CONFIG_INDUSTRY']
                    }
                ]
            },
            {
                id: 'OPLATE_BD_REALM_ANALYSIS',//唯一标识
                name: backendIntl.get('menu.realm.analysis', '运营分析'),
                routePath: 'analysis/realm',
                subMenu: [{
                    id: 'OPLATE_BD_ANALYSIS_REALM_ZONE',
                    name: backendIntl.get('menu.realm.analysis.zone', '地域分析'),
                    routePath: 'analysis/realm/zone',
                    privileges: [
                        'OPLATE_BD_ANALYSIS_REALM_ZONE'//地域分析-当前安全域开通总数
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['OPLATE_BD_ANALYSIS_REALM_ZONE']
                }, {
                    id: 'OPLATE_BD_ANALYSIS_REALM_INDUSTRY',
                    name: backendIntl.get('menu.realm.analysis.industry', '行业分析'),
                    routePath: 'analysis/realm/industry',
                    privileges: [
                        'OPLATE_BD_ANALYSIS_REALM_INDUSTRY',//行业分析-当前安全域开通总数
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['OPLATE_BD_ANALYSIS_REALM_INDUSTRY']
                }, {
                    id: 'OPLATE_BD_ANALYSIS_REALM_ESTABLISH',
                    name: backendIntl.get('menu.realm.analysis.establish', '开启时间统计'),
                    routePath: 'analysis/realm/establish',
                    privileges: [
                        'OPLATE_BD_ANALYSIS_REALM_ESTABLISH',//开启时间统计-安全域开通总数统计
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['OPLATE_BD_ANALYSIS_REALM_ESTABLISH']
                }]
            },
            {
                id: 'OPLATE_CUSTOMER_ANALYSIS',//唯一标识
                name: backendIntl.get('menu.customer.analysis', '运营分析'),
                routePath: 'analysis/customer',
                privileges: [
                    'OPLATE_CUSTOMER_ANALYSIS_SUMMARY',
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['OPLATE_CUSTOMER_ANALYSIS_SUMMARY']
            },
            {
                id: 'OPLATE_USER_ANALYSIS',//唯一标识
                name: backendIntl.get('menu.user.analysis', '运营分析'),
                routePath: 'analysis/user',
                privileges: [
                    'OPLATE_USER_ANALYSIS_SUMMARY',
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['OPLATE_USER_ANALYSIS_SUMMARY']
            },
            //周报统计
            // {
            //     id: "WEEKLY_REPORT_ANALYSIS",//唯一标识
            //     name: backendIntl.get("menu.user.analysis", "运营分析"),
            //     routePath: "analysis/weekly_report",
            //     privileges: [
            //         "CALLRECORD_ASKFORLEAVE_ADD",
            //     ],
            //     //有这个权限，才显示入口图标
            //     showPrivileges: ["CALLRECORD_ASKFORLEAVE_ADD"]
            // },
            {
                id: 'SALES_HOME_PAGE', //唯一标识，销售首页
                name: backendIntl.get('menu.sales.homepage', '销售主页'),
                routePath: 'sales/home',
                privileges: [
                    'GET_MY_CALL_RECORD',// 获取我的电话统计记录
                    'GET_ALL_CALL_RECORD'
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['GET_MY_CALL_RECORD', 'GET_ALL_CALL_RECORD']// 获取我的电话统计记录
            },
            {
                id: 'OPLATE_ONLINE_USER',//唯一标识
                name: backendIntl.get('menu.online.user', '在线用户'),
                routePath: 'online',
                subMenu: [
                    //    {
                    //    id: "OPLATE_ONLINE_USER_ANALYSIS",
                    //    name: "在线用户统计",
                    //    routePath: "online/analysis",
                    //    privileges: [
                    //        "OPLATE_ONLINE_USER_ANALYSIS",
                    //    ],
                    //    //有这个权限，才显示入口图标
                    //    showPrivileges: ["OPLATE_ONLINE_USER_ANALYSIS"]
                    //},
                    {
                        id: 'OPLATE_ONLINE_USER_LIST',
                        name: backendIntl.get('menu.online.user.list', '在线用户列表'),
                        routePath: 'online/list',
                        privileges: [
                            'OPLATE_ONLINE_USER_LIST',
                        ],
                        //有这个权限，才显示入口图标
                        showPrivileges: ['OPLATE_ONLINE_USER_LIST']
                    }]
            },
            {
                id: 'CONTRACT',
                name: backendIntl.get('menu.contract', '合同管理'),
                routePath: 'contract',
                subMenu: [{
                    id: 'CONTRACT_LIST',
                    name: backendIntl.get('menu.contract.list', '合同列表'),
                    routePath: 'contract/list',
                    privileges: [
                        'OPLATE_CONTRACT_QUERY',
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['OPLATE_CONTRACT_QUERY']
                }, {
                    id: 'CONTRACT_DASHBOARD',
                    name: backendIntl.get('contract.151', '合同仪表盘'),
                    routePath: 'contract/dashboard',
                    privileges: [
                        'OPLATE_REPAYMENT_ADD',
                    ],
                    showPrivileges: ['OPLATE_REPAYMENT_ADD']
                }]
            },
            {
                id: 'OPLATE_REPORT',//唯一标识
                name: backendIntl.get('menu.report', '分析报告'),
                routePath: 'report',
                subMenu: [{
                    id: 'OPERATION_REPORT',
                    name: backendIntl.get('menu.operation.report', '运营报告'),
                    routePath: 'report/operation',
                    privileges: [
                        'OPERATION_REPORT'
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['OPERATION_REPORT']
                }, {
                    id: 'APP_OPERATION_REPORT',
                    name: backendIntl.get('menu.app.operation.report', '应用运营报告'),
                    routePath: 'report/app_operation',
                    privileges: [
                        'APP_OPERATION_REPORT'
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['APP_OPERATION_REPORT']
                }]
            },
            {
                id: 'USER_INFO_MANAGE',//唯一标识
                name: backendIntl.get('menu.userinfo.manage', '个人信息管理'),
                routePath: 'user_info_manage',
                subMenu: [{
                    id: 'USER_INFO',
                    name: backendIntl.get('menu.userinfo', '个人资料'),
                    routePath: 'user_info_manage/user_info',
                    privileges: [
                        'USER_INFO_USER'//查看个人信息
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['USER_INFO_USER']
                }, {
                    id: 'USER_PASSWORD',
                    name: backendIntl.get('menu.user.password', '密码管理'),
                    routePath: 'user_info_manage/user_pwd',
                    privileges: [
                        'USER_INFO_PWD'//修改密码
                    ],
                    //有这个权限，才显示入口图标
                    showPrivileges: ['USER_INFO_PWD']
                }]
            },
            {
                id: 'NOTIFICATION',//唯一标识 - 通知
                name: backendIntl.get('menu.system.notification', '系统消息'),
                routePath: 'notification_system',
                privileges: [
                    'NOTIFICATION_SYSTEM_LIST'//查看通知-系统消息
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['NOTIFICATION_SYSTEM_LIST']
            },
            {
                id: 'APP_USER_MANAGE_APPLY',
                name: backendIntl.get('menu.appuser.apply', '用户审批'),
                routePath: 'apply',
                privileges: [
                    'APP_USER_APPLY_LIST',//列出申请应用用户
                    'APP_USER_APPLY_APPROVAL',//审批申请
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['APP_USER_APPLY_LIST']

            },
            {
                id: 'SCHEDULE_MANAGEMENT',
                name: backendIntl.get('schedule.list.management', '日程管理'),
                routePath: 'schedule_management',
                privileges: [
                    'MEMBER_SCHEDULE_MANAGE'//日程管理的查询
                ],
                //有这个权限，才显示入口图标
                showPrivileges: ['MEMBER_SCHEDULE_MANAGE']
            },
        ];

        var user_info_idx = -1;
        var user_info_manage = _.find(leftMenuList, function(item, i) {
            if (item.id === 'USER_INFO_MANAGE') {
                user_info_idx = i;
                return true;
            }
        });
        if (user_info_idx >= 0) {
            leftMenuList.splice(user_info_idx, 1);
            leftMenuList.push(user_info_manage);
        }
        return leftMenuList;
    }
}

module.exports = LeftMenuClass;
