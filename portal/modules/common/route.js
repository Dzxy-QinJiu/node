import privilegeConst_common from './public/privilege-const';

const geoUrl = '/rest/geo/service/v1/';
const customerUrl = '/rest/customer/v3/customer/';
const userAnalysisUrl = '/rest/analysis/user/v1/';
const contractAnalysisUrl = '/rest/analysis/contract/contract/';
const contractV2AnalysisUrl = '/rest/analysis/contract_v2/statistics';
const teamUrl = '/rest/base/v1/group/';
const customerCommonAnalysisUrl = '/rest/analysis/customer/v1/common/';
const customerManagerAnalysisUrl = '/rest/analysis/customer/v1/manager/';
const websiteConfigUrl = '/rest/base/v1/user/website/config';
const websiteModuleRecordConfigUrl = '/rest/base/v1/user/website/config/module/record';
const userAnalysisV3Url = '/rest/analysis/user/v3'; //  common（普通权限用户）manager（管理员权限）
const invalidPhone = '/rest/base/v1/realm/config/customerservicephone';//获取或者添加无效电话
import analysisPrivilegeConst from '../analysis/public/privilege-const';

module.exports = [{
    'method': 'get',
    'path': geoUrl + 'districts/search',
    'handler': 'getAreaData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': geoUrl + 'poi/search',
    'handler': 'getGeoInfo',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': userAnalysisUrl + ':type/:property',
    'handler': 'getUserAnalysisData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': contractAnalysisUrl + ':type/:property',
    'handler': 'getContractAnalysisData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': contractAnalysisUrl + ':type/gross/profit/team',
    'handler': 'getContractGrossAnalysisData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': contractAnalysisUrl + ':type/repay/team/gross/profit',
    'handler': 'getContractRepayAnalysisData',
    'passport': {
        'needLogin': true
    }
}, {
    'method': 'get',
    'path': teamUrl + 'myteam',
    'handler': 'getTeamList',
    'passport': {
        'needLogin': true
    },
    'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_TEAM]
}, {
    'method': 'get',
    'path': customerUrl + 'upload/confirm/:flag',
    'handler': 'uploadCustomerConfirm',
    'passport': {
        'needLogin': true
    },
    'privileges': [privilegeConst_common.CUSTOMER_ADD]
}, {
    'method': 'get',
    'path': customerCommonAnalysisUrl + ':type/:property',
    'handler': 'getCustomerCommonAnalysisData',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        'CUSTOMER_ANALYSIS_COMMON'
    ]
}, {
    'method': 'get',
    'path': customerManagerAnalysisUrl + ':type/:property',
    'handler': 'getCustomerManagerAnalysisData',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        analysisPrivilegeConst.CRM_CONTRACT_SALES_REPORTS_MANAGER
    ]
}, {
    'method': 'post',
    'path': websiteConfigUrl + '/personnel',//创建（覆盖）个性化配置
    'handler': 'setWebsiteConfig',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.CURTAO_USER_CONFIG
    ]
}, {
    'method': 'post',
    'path': websiteModuleRecordConfigUrl,//是否点击过某个模块
    'handler': 'setWebsiteConfigModuleRecord',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.CURTAO_USER_CONFIG
    ]
}, {
    'method': 'get',
    'path': websiteConfigUrl,//获取网站个性化配置
    'handler': 'getWebsiteConfig',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.CURTAO_USER_CONFIG
    ]
}, {
    // 合同统计
    method: 'get',
    path: contractV2AnalysisUrl,
    handler: 'getContractStaticAnalysisData',
    module: 'common/server/special-case-handler',
    passport: {
        'needLogin': true
    }
}, {
    'method': 'get',//获取设备类型统计manager
    'path': userAnalysisV3Url + '/manager/device',
    'handler': 'getDeviceTypeBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'get',//获取设备类型统计common
    'path': userAnalysisV3Url + '/common/device',
    'handler': 'getDeviceTypeBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'get',//获取浏览器统计manager
    'path': userAnalysisV3Url + '/manager/browser',
    'handler': 'getBrowserBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'get',//获取浏览器统计common
    'path': userAnalysisV3Url + '/common/browser',
    'handler': 'getBrowserBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'get',//获取活跃用户省份统计manager
    'path': userAnalysisV3Url + '/manager/zone/province',
    'handler': 'getActiveZoneBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'get',//获取活跃用户省份统计common
    'path': userAnalysisV3Url + '/common/zone/province',
    'handler': 'getActiveZoneBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'post',//用户登录次数manager
    'path': userAnalysisV3Url + '/manager/logins/distribution/num',
    'handler': 'getUserLoginCountsDataBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'post',//用户登录次数common
    'path': userAnalysisV3Url + '/common/logins/distribution/num',
    'handler': 'getUserLoginCountsDataBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'post',//用户登陆时间manager
    'path': userAnalysisV3Url + '/manager/online_time/distribution/num',
    'handler': 'getUserLoginTimesDataBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'post',//用户登陆时间common
    'path': userAnalysisV3Url + '/common/online_time/distribution/num',
    'handler': 'getUserLoginTimesDataBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'post',// 用户登录天数manager
    'path': userAnalysisV3Url + '/manager/login/day/distribution/num',
    'handler': 'getUserLoginDaysDataBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'post',// 用户登录天数common
    'path': userAnalysisV3Url + '/common/login/day/distribution/num',
    'handler': 'getUserLoginDaysDataBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'get',// 用户在线时长manager
    'path': userAnalysisV3Url + '/manager/app/avg/online_time/trend',
    'handler': 'getUserOnlineTimeDataBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'get',// 用户在线时长common
    'path': userAnalysisV3Url + '/common/app/avg/online_time/trend',
    'handler': 'getUserOnlineTimeDataBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'get',// 用户未登录数manager
    'path': userAnalysisV3Url + '/manager/app/count/no_login',
    'handler': 'getOfflineUserDataBymanager',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_MANAGER
    ]
}, {
    'method': 'get',// 用户未登录数common
    'path': userAnalysisV3Url + '/common/app/count/no_login',
    'handler': 'getOfflineUserDataBycommon',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.USER_ANALYSIS_COMMON
    ]
}, {
    'method': 'get',//获取无效电话
    'path': invalidPhone,
    'handler': 'getInvalidPhone',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.CALLSYSTEM_CONFIG_MANAGE
    ]
}, {
    'method': 'post',//增加无效电话
    'path': invalidPhone,
    'handler': 'addInvalidPhone',
    'passport': {
        'needLogin': true
    },
    'privileges': [
        privilegeConst_common.CALLSYSTEM_CONFIG_MANAGE
    ]
}, {
    'method': 'delete',
    'path': customerUrl + 'upload/preview/:index',
    'handler': 'deleteDuplicatImportCustomer',
    'passport': {
        'needLogin': true
    },
    'privileges': [privilegeConst_common.CUSTOMER_ADD]
}, {
    //获取迁出客户数据
    'method': 'get',
    'path': '/rest/analysis/customer/v2/:data_type/transfer/record/:page_size/:sort_field/:order',
    'handler': 'getTransferCustomers',
    'passport': {
        'needLogin': true
    },
    //TODO 这里的权限待确认
    // 'privileges': [privilegeConst_common.CRM_CUSTOMER_TRANSFER_RECORD]
}, {
    //获取客户阶段变更数据
    'method': 'get',
    'path': '/rest/analysis/customer/v2/:data_type/customer/label/count',
    'handler': 'getStageChangeCustomers',
    'passport': {
        'needLogin': true
    },
    // todo 这里的权限待确认
    // 'privileges': [privilegeConst_common.USER_CUSTOMER_LABEL_COUNT, privilegeConst_common.CRM_MANAGER]
}, {
    //获取客户阶段变更的客户数据
    'method': 'post',
    'path': '/rest/customer/v2/customer/query/label/record/:type/:page_size/:sort_field/:order',
    'handler': 'getStageChangeCustomerList',
    'passport': {
        'needLogin': true
    }
}, {
    //获取各行业试用客户覆盖率
    'method': 'get',
    'path': '/rest/analysis/customer/v2/statistic/:type/industry/stage/region/overlay',
    'handler': 'getIndustryCustomerOverlay',
    'passport': {
        'needLogin': true
    },
    'privileges': [privilegeConst_common.KETAO_WEEKLY_REPORTS_CUSTOMER_STAGE_STATISITC_COMMON, privilegeConst_common.KETAO_WEEKLY_REPORTS_CUSTOMER_STAGE_STATISITC_MANAGER]
}, {
    //获取销售新开客户数
    'method': 'get',
    'path': '/rest/analysis/customer/v2/statistic/:type/customer/user/new',
    'handler': 'getNewCustomerCount',
    'passport': {
        'needLogin': true
    },
    'privileges': [privilegeConst_common.CUSTOMER_ANALYSIS_REGION_OVERLAY_STATISTIC_MANAGER, privilegeConst_common.CUSTOMER_ANALYSIS_REGION_OVERLAY_STATISTIC_COMMON]
}, {
    //获取所有成员基本信息（仅包含姓名、id，不分页)
    'method': 'get',
    'path': '/rest/base/v1/user/list/members',
    'handler': 'getAllUsers',
    'passport': {
        'needLogin': true
    },
}, {
    //获取应用下角色{query: tags}
    'method': 'get',
    'path': '/rest/base/v1/role/client/roles',
    'handler': 'getAppRoles',
    'passport': {
        'needLogin': true
    }
}, {
    //获取角色下成员{query: {page_size, page_num, role_id}}
    'method': 'get',
    'path': '/rest/base/v1/user/role/users',
    'handler': 'getRoleUsers',
    'passport': {
        'needLogin': true
    }
}, {
    //获取应用下角色(含角色下成员 {query: {tags, page_size, page_num, role_id}, })
    'method': 'get',
    'path': '/appInfo/:tagName',
    'handler': 'getAppRoleList',
    module: 'app_open_manage/server/get-role-user',
    'passport': {
        'needLogin': true
    }
}, {
    //获取应用信息
    'method': 'get',
    'path': '/rest/base/v1/role/client/rolefunctions',
    'handler': 'getAppList',
    'passport': {
        'needLogin': true
    }
}, {
    //开通应用
    'method': 'put',
    'path': '/rest/base/v1/role/:roleId/visible/true',
    'handler': 'openApp',
    'passport': {
        'needLogin': true
    }
}, {
    //给成员增加角色
    'method': 'put',
    'path': '/rest/base/v1/user/role/updates',
    'handler': 'addRoleOfUsers',
    'passport': {
        'needLogin': true
    }
}, {
    //给成员删除角色
    'method': 'delete',
    'path': '/rest/base/v1/user/role/updates',
    'handler': 'delRoleOfUsers',
    'passport': {
        'needLogin': true
    }
}, {
    //给成员更新角色（含增加角色，删除角色）
    'method': 'put',
    'path': '/updateRoleForUsers',
    'handler': 'editRoleOfUsers',
    module: 'app_open_manage/server/edit-role-user',
    'passport': {
        'needLogin': true
    }
}, {
    //获取指定用户全部应用的审计日志
    'method': 'post',
    'path': '/rest/analysis/auditlog/v1/apps/userdetail/:user_id',
    'handler': 'getSingleUserAllAuditLog',
    'passport': {
        'needLogin': true
    },
    privileges: [privilegeConst_common.USER_AUDIT_LOG_LIST]
}, {
    //批量获取角色信息
    'method': 'post',
    'path': '/rest/base/v1/role/batch_ids',
    'handler': 'getBatchRoleInfo',
    'passport': {
        'needLogin': true
    },
    privileges: [privilegeConst_common.BASE_QUERY_PERMISSION_APPLICATION]
}, {
    //批量获取权限信息
    'method': 'post',
    'path': '/rest/base/v1/permission/batch_ids',
    'handler': 'getBatchPermissionInfo',
    'passport': {
        'needLogin': true
    },
    privileges: [privilegeConst_common.BASE_QUERY_PERMISSION_APPLICATION]
}, {
    //add查询条件
    'method': 'post',
    'path': '/rest/condition/v1/condition',
    'handler': 'addCommonFilter',
    'passport': {
        'needLogin': true
    }
}, {
    //update查询条件
    'method': 'put',
    'path': '/rest/condition/v1/condition',
    'handler': 'updateCommonFilter',
    'passport': {
        'needLogin': true
    }
}, {
    //get查询条件
    'method': 'post',
    'path': '/rest/condition/v1/condition/range/:type/:page_size/:sort_field/:order',
    'handler': 'getCommonFilterList',
    'passport': {
        'needLogin': true
    }
}, {
    //delete查询条件
    'method': 'delete',
    'path': '/rest/condition/v1/condition/:id',
    'handler': 'delCommonFilter',
    'passport': {
        'needLogin': true
    }
}, {
    //申请延期（多应用
    'method': 'post',
    'path': '/rest/base/v1/user/grants/update/apply',
    'handler': 'applyDelayMultiApp',
    'passport': {
        'needLogin': true
    },
    privileges: [privilegeConst_common.USER_APPLY_APPROVE]
}, {
    //审批（多应用
    'method': 'post',
    'path': '/rest/base/v1/user/grants/update/approve',
    'handler': 'submitMultiAppApply',
    'passport': {
        'needLogin': true
    },
    privileges: [privilegeConst_common.USER_APPLY_APPROVE]
}];
