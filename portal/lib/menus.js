/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/20.
 */

let routers = require('../../conf/router-config').Routers;

let path = require('path');
let auth = require('./utils/auth');
var _ = require('lodash');
// function _getLeftMenus(req) {
//     return config;
// }
// //获取第一层菜单的顺序
// function _getModulesAllOrderMap(req) {
//     var orderMap = {}, count = 0;
//     let MenusAll = _getLeftMenus(req);
//     _.each(MenusAll, function(item) {
//         if (item.subMenu) {
//             orderMap[item.routePath] = ++count;
//         } else {
//             orderMap[item.id.toLowerCase()] = ++count;
//         }
//     });
//     return orderMap;
// }
//
//
// //根据权限获取用户需要加载的脚本
// function getModulesByUser(req) {
//     var userInfo = auth.getUser(req);
//     var userPrivileges = userInfo.privileges;
//     var menusAll = _getMenuChained(req);
//     var privilegeModuleMap = _getPrivilegeModuleMap(req);
//     var set = new Set();
//
//     _.each(userPrivileges, function(privilege) {
//         var to_menu = menusAll[privilege];
//         if (to_menu && to_menu.length === 1) {
//             set.add(privilegeModuleMap[privilege]);
//         } else if (to_menu && to_menu[0]) {
//             set.add(to_menu[0].routePath);
//         }
//     });
//
//     var orderMap = _getModulesAllOrderMap(req);
//     var result = Array.from(set);
//     result = _.sortBy(result, function(str) {
//         return orderMap[str];
//     });
//     return result;
// }
//
// //根据权限获取二级菜单对应关系
// function getSubModulesByUser(req) {
//     var userInfo = auth.getUser(req);
//     var userPrivileges = userInfo.privileges;
//     var menusAll = _getMenuChained(req);
//     var result = new Map();
//     _.each(userPrivileges, function(privilege) {
//         var to_menu = menusAll[privilege];
//         if (to_menu && to_menu.length > 1) {
//             var menuEntry = to_menu[0];
//             if (!result.has(menuEntry.routePath)) {
//                 result.set(menuEntry.routePath, []);
//             }
//             var list = result.get(menuEntry.routePath);
//             list.push(to_menu[1]);
//             list = _.uniqBy(list, 'routePath');
//             result.set(menuEntry.routePath, list);
//         }
//     });
//     //对result中的数据进行排序
//     for (var key of result.keys()) {
//         var orderMap = _getSubModulesAllOrderMap(key, req);
//         var list = result.get(key);
//         list = _.sortBy(list, function(item) {
//             return orderMap[item.routePath];
//         });
//         result.set(key, list);
//     }
//
//     return mapToObj(result);
// }
// //根据权限获取三级菜单
// function getThirdLevelMenusByUser(req) {
//     const userInfo = auth.getUser(req);
//     const userPrivileges = userInfo.privileges;
//     const menus = _getLeftMenus(req);
//
//     let thirdLevelMenus = {};
//
//     _.each(menus, firstLevelMenu => {
//         if (firstLevelMenu.subMenu) {
//             _.each(firstLevelMenu.subMenu, secondLevelMenu => {
//                 if (secondLevelMenu.subMenu) {
//                     _.each(secondLevelMenu.subMenu, thirdLevelMenu => {
//                         _.some(thirdLevelMenu.showPrivileges, privilege => {
//                             const matched = _.find(userPrivileges, userPrivilege => userPrivilege = privilege);
//
//                             if (matched) {
//                                 if (!thirdLevelMenus[secondLevelMenu.id]) {
//                                     thirdLevelMenus[secondLevelMenu.id] = [];
//                                 }
//
//                                 thirdLevelMenus[secondLevelMenu.id].push({
//                                     name: thirdLevelMenu.name,
//                                     routePath: thirdLevelMenu.routePath
//                                 });
//
//                                 return true;
//                             }
//                         });
//                     });
//                 }
//             });
//         }
//     });
//
//     return thirdLevelMenus;
// }
let privileges = ['MEMBER_TEAM_ROLE_MANAGE', 'OPLATE_CONTRACT_ANALYSIS', 'CUSTOMER_UPDATE_INTEREST', 'CREATE_APP_EXTRA_GRANT',
    'MEMBER_OPINION_MANAGE', 'CUSTOMER_TRACE_QUERY', 'CUSTOMER_INVALID_PHONE_GET', 'CUSTOMER_DELETE', 'CLUECUSTOMER_QUERY_MANAGER',
    'NOTIFICATION_CUSTOMER_LIST', 'USER_INFO_LIST_LOG', 'CRM_LIST_CONTACTS', 'BATCH_UPDATE_USER_CUSTOMER', 'OPLATE_CUSTOMER_ANALYSIS_INDUSTRY',
    'OPLATE_PAYMENT_ADD', 'ENABLE_DISABLE_MEMBER', 'OPLATE_REPAYMENT_DELETE', 'CRM_CONTRACT_COMMON_BASE', 'CUSTOMER_TRACE_ADD',
    'CUSTOMER_ANALYSIS_CUSTOMER_ACTIVE_RATE_ALL', 'CUSTOMER_ALERT', 'GET_MANAGED_REALM', 'GET_LOGIN_EXCEPTION_USERS', 'USER_MANAGE_ADD_USER',
    'CRM_MANAGER_CUSTOMER_TRACE_STATISTICS', 'CUSTOMER_ANALYSIS_MANAGER', 'CUSTOMERCLUE_QUERY_FULLTEXT',
    'CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_MANAGER', 'GRANT_STATUS_CHANGE_APPROVAL', 'CRM_MANAGER_TRANSFER', 'GET_CONFIG_INDUSTRY',
    'DOCUMENT_UPLOAD_TEST', 'USER_ANALYSIS_MANAGER', 'CRM_MANAGER_APP_USER_COUNT', 'NOTIFICATION_APPLYFOR_LIST', 'CALL_RECORD_VIEW_MANAGER',
    'KETAO_SALES_TEAM_WEEKLY_REPORTS_MANAGER', 'MEMBER_APPLY_EMAIL_REJECTION', 'GET_APP_EXTRA_GRANTS', 'OPLATE_SALES_COST_ADD',
    'USER_INFO_MYAPP_AUTHORITY_LIST', 'BUSINESS_TRIP_MANAGE', 'GET_USERS_BY_USERNAME_PREFIX', 'MEMBER_LEAVE_MANAGE', 'DOCUMENT_DOWNLOAD',
    'OPLATE_PAYMENT_UPDATE', 'CALLRECORD_ASKFORLEAVE_ADD', 'CRM_SALESOPPORTUNITY_DELETE', 'STH_ELSE_CHANGE_APPROVAL', 'QUARTER_REPORT_MANAGER',
    'CRM_CUSTOMER_LIMIT_FLAG', 'USER_GRANT_DELAY_APPROVAL', 'CONTRACT_INVOICE_AMOUNT', 'CRM_DELETE_CONTACT', 'CONTRACT_DELETE_INVOICE_AMOUNT',
    'CRM_MANAGER_CUSTOMER_LABEL_COUNT', 'CUSTOMER_NOTICE_MANAGE', 'CRM_USER_PHONE_STATUS', 'CRM_MANAGER_LIST_CONTACTS', 'BGM_SALES_STAGE_LIST',
    'CUSTOMERCLUE_DYNAMIC_QUERY', 'CRM_COMPETING_PRODUCT', 'CRM_SET_DEFAULT_CONTACT', 'customer_dynamic', 'GET_MEMBER_ROLE',
    'CRM_CONTRACT_LIST_CUSTOMERS', 'CALLRECORD_ASKFORLEAVE_UPDATE', 'CUSTOMER_CLUE_SOURCE_GET', 'PRODUCTS_MANAGE', 'GET_MEMBER_PHONE_ORDER',
    'MEMBER_BUSINESSOPPO_MANAGE', 'CLUECUSTOMER_ADD_TRACE', 'OPLATE_CUSTOMER_ANALYSIS_STAGE', 'CUSTOMER_MANAGER_QUERY_LOGIN',
    'CRM_CLUE_TREND_STATISTIC_ALL', 'USER_PWD_CHANGE_APPROVAL', 'KETAO_CONTRACT_ANALYSIS_REPORT_FORM', 'APP_USER_EDIT', 'GET_MEMBER_APPLY_LIST',
    'CALLRECORD_ASKFORLEAVE_QUERY_MANAGER', 'MEMBER_DOCUMENT_MANAGE', 'CRM_MANAGER_GET_LABEL_CHANGE_RECORD', 'OPLATE_REPAYMENT_ADD',
    'MANAGER_USER_ANALYSIS_HOME_PAGE', 'CRM_REPEAT', 'BGM_SALES_TEAM_EDIT', 'CRM_MANAGER_UPDATE_CUSTOMER_SALES_TEAM',
    'BATCH_UPDATE_USER_PASSWORD', 'USER_AUDIT_LOG_LIST', 'CRM_LIST_CUSTOMERS', 'CUSTOMER_INVALID_PHONE_ADD', 'CUSTOMER_UPDATE_ADDRESS',
    'APP_USER_APPLY_LIST', 'OPLATE_CONTRACT_QUERY', 'OPLATE_CONTRACT_TYPE', 'CONTRACT_ADD_INVOICE_AMOUNT', 'USER_MANAGE_ADD_SALES_GOAL',
    'CUSTOMER_CALLRECORD_QUERY', 'USER_PHONE_BINDING', 'MEMBER_WORKFLOW_STATISTIC', 'BGM_SALES_STAGE__EDIT', 'OPLATE_REPAYMENT_QUERY',
    'USER_INFO_PWD', 'GET_CONFIG_IP', 'KETAO_NEW_ALLOT_NO_CONTACTED', 'GET_APPROVE_USER_STATISTIC', 'CUSTOMER_CALLRECORD_STATISTIC_USER',
    'BATCH_UPDATE_GRANT_DELAY', 'CRM_ADD_CONTACT', 'BGM_SALES_TEAM_LIST', 'TEAM_ROLE_MANAGE', 'MEMBER_WEBSITE_CONFIG', 'CALLRECORD_RECORD_UPLOAD',
    'APP_USER_LIST', 'USER_BATCH_OPERATE', 'CUSTOMER_TERM_CALLRECORD', 'BGM_SALES_TEAM_ADD', 'SALES_TEAM_MEMBERS', 'CUSTOMER_TRACE_MANAGER_QUERY',
    'CRM_STAGE_LABEL_MANAGER_SUMMARY', 'ROLEP_RIVILEGE_ROLE_CLIENT_LIST', 'CURTAO_CUSTOMER_QUALIFY_STATISTIC_MANAGER',
    'OPLATE_USER_ANALYSIS_INDUSTRY', 'CRM_GET_MANAGER_ROLE', 'CRM_MANAGER_UPDATE_REPEAT', 'CALLRECORD_ASKFORLEAVE_DELETE',
    'CONSTRACT_DELETE_PAYMENT', 'NOTIFICATION_SYSTEM_LIST', 'GET_MEMBER_BY_ROLE', 'SALESOPPORTUNITY_UPDATE', 'CUSTOMER_MANAGER_GET_USER_NAME',
    'GET_TEAM_ROLE_LIST', 'SALESOPPORTUNITY_ADD', 'BGM_SALES_TEAM_MEMBER_DELETE', 'CRM_CUSTOMER_INFO', 'CUSTOMER_CALLRECORD_HISTOGRAM',
    'SALESOPPORTUNITY_UPDATE_SALES_STAGE', 'OPLATE_CONTRACT_UPLOAD', 'CUSTOMER_ADD_CLUE', 'CRM_CUSTOMER_CONTACT_INTERVAL_DATA',
    'OPLATE_ONLINE_USER_ANALYSIS', 'CUSTOMER_ADD_CALLRECORD', 'USER_MANAGE_USE', 'CRM_CUSTOMER_TRANSFER_RECORD', 'USER_MANAGE_EDIT_USER',
    'OPLATE_USER_ANALYSIS_ACTIVE', 'BGM_SALES_TEAM_MEMBER_ADD', 'SOCIAL_ACCOUNT_BIND', 'OPLATE_REPAYMENT_UPDATE', 'GET_MY_WORKFLOW_LIST',
    'KETAO_CUSTOMER_CLUE_CHANGE', 'CRM_USER_PHONE_STATUS', 'BATCH_GRANT_APPLICATION', 'CUSTOMER_MANAGER_UPDATE_INTEREST',
    'BATCH_UPDATE_GRANT_ROLES', 'OPLATE_CUSTOMER_ANALYSIS_ZONE', 'CRM_APP_MODIFY_CUSTOMER', 'PHONE_ACCESS_CALL_IN',
    'CLUECUSTOMER_CLUE_SOURCE_GET', 'OPLATE_SALES_COST_QUERY', 'CRM_CUSTOMER_INFO_EDIT', 'CRM_UPDATE_CONTACT_PHONE',
    'CALLRECORD_ASKFORLEAVE_QUERY_USER', 'OPLATE_USER_ANALYSIS_SUMMARY', 'CRM_UPLOAD_CUSTOMER_CLUE', 'CUSTOMER_UPDATE', 'BGM_SALES_STAGE_SORT',
    'CUSTOME_MANAGER_SALES_TEAM_GET', 'CRM_MANAGER_LIST_SALESOPPORTUNITY', 'CRM_CUSTOMER_ANALYSIS_RANKING_MANAGER', 'GET_MEMBER_TEAM_ROLE',
    'BGM_SALES_STAGE_DELETE', 'USER_MANAGE_LIST_USERS', 'OPLATE_USER_ANALYSIS_ZONE', 'CREATE_APPLY_COMMENT', 'CLUECUSTOMER_ACCESS_CHANNEL_GET',
    'GET_ALL_CALL_RECORD', 'OPLATE_CUSTOMER_SUGGESTION_BY_USERINFO', 'CRM_UPLOAD_CUSTOMER', 'OPLATE_CUSTOMER_ANALYSIS_TEAM', 'CUSTOMER_ADD_CLUE',
    'CUSTOMER_CALLRECORD_SALE_ONLY', 'CONTRACT_INVOICE_ADD', 'PHONE_ACCESS_CALL_OU', 'MEMBER_SCHEDULE_MANAGE', 'GET_TEAM_LIST_ALL',
    'CRM_MANAGER_CUSTOMER_CLUE_ID', 'BATCH_UPDATE_GRANT_STATUS', 'OPLATE_CONTRACT_SALERS_COMMISSION_RECORD', 'CRM_QUERY_CONDITION_MANAGER',
    'KETAO_ONLINE_SALES_CUSTOMER_STAGE_ANALYSIS_MANAGER', 'CREATE_CUSTOMER_APP_FEEDBACK', 'CUSTOMER_MANAGER_UPDATE_ALL', 'SALESOPPORTUNITY_QUERY',
    'CALLRECORD_CUSTOMER_PHONE_STATISTIC_MANAGER', 'CALL_RECORD_HISTOGRAM_BY_TEAM_ID', 'GET_EXPIRE_USER_STATISTIC', 'CREATE_CONFIG_INDUSTRY',
    'DELETE_APP_EXTRA_GRANT', 'CLUECUSTOMER_DELETE', 'CLUECUSTOMER_VIEW', 'GET_CUSTOMER_USERS', 'UPDATE_MEMBER_ROLE', 'PHONE_ACCESS_CALL_RECORD',
    'CUSTOMER_GET_LEVEL', 'CUSTOMER_UPDATE_REMARK', 'USER_MANAGE_LIST_LOG', 'USER_KICKOUT', 'CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER',
    'CLUECUSTOMER_QUERY_BY_ID', 'UPDATE_MEMBER_BASE_INFO', 'CONTRACT_INVOICE_DETAIL_ADD', 'GET_GROUP_BY_GROUPNAME', 'CUSTOMER_ALL',
    'CRM_CLUE_STATISTICAL', 'USER_GRANTS_APPLY_APPROVE', 'CUSTOMER_MANAGER_COMPETING_PRODUCTS_GET', 'USER_TIME_LINE', 'CRM_CUSTOMER_SCORE_RECORD',
    'CUSTOMER_CALLRECORD_MANAGER_ONLY', 'SALESOPPORTUNITY_UPDATE_APP_ID', 'MANAGER_CUSTOMER_ANALYSIS_HOME_PAGE', 'CLUECUSTOMER_ADD_TRACE',
    'DATA_INTEGRATION_MANAGE', 'UPDATE_APP_EXTRA_GRANT', 'CUSTOMER_GET_CLUE', 'USER_TRUSTY_INFO_CONFIG', 'CLUECUSTOMER_UPDATE_MANAGER',
    'CUSTOMER_CALLRECORD_STATISTIC_MANAGER', 'OPLATE_SALES_COST_UPDATA', 'CUSTOMERCLUE_QUERY_FULLTEXT_MANAGER', 'GET_TEAM_MEMBERS_ALL',
    'CLUECUSTOMER_CLUE_CLASSIFY_GET', 'CURTAO_SALES_REPORTS_MANAGER', 'CONTRACT_INVOICE_DELETE',
    'BATCH_UPDATE_GRANT_PERIOD', 'GET_APPLY_COMMENTS', 'BATCH_UPDATE_GRANT_TYPE', 'CURTAO_RULE_MANAGE', 'BGM_SALES_TEAM_DELETE',
    'CUSTOMER_MANAGER_LABEL_GET', 'CUSTOMER_MERGE_CUSTOMER', 'CRM_EDIT_CONTACT', 'GET_USERLIST_BY_ROLE', 'CUSTOMER_UPDATE_INDUSTRY',
    'CLUECUSTOMER_DISTRIBUTE_MANAGER', 'CRM_MANAGER_GET_CUSTOMER_CUSTOMER_LABEL', 'CUSTOMER_ACCESS_CHANNEL_GET', 'OPLATE_SALES_COST_DELETE',
    'OPLATE_CONTRACT_SALERS_COMMISSION', 'CUSTOMER_BATCH_OPERATE', 'BGM_SALES_TEAM_MEMBER_EDIT', 'APP_USER_ADD', 'CUSTOMER_UPDATE_NAME',
    'CUSTOMER_MANAGER_PROVINCE_GET', 'CUSTOMER_INVALID_PHONE_DELETE', 'USER_INFO_USER', 'USER_EMAIL_BINDING',
    'CRM_GET_SALESOPPORTUNITY_SALE_STAGE', 'MEMBER_LANGUAGE_SETTING', 'USER_ORGANIZATION_MEMBER_LIST', 'CUSTOMER_TRACE_UPDATE',
    'CONTRACT_INVOICE_UPDATE_DETAIL', 'OPLATE_CUSTOMER_ANALYSIS_SUMMARY', 'CRM_CLUE_STATISTICAL_ALL', 'CUSTOMER_UPDATE_LABEL',
    'CRM_DELETE_CUSTOMER', 'USER_INFO_MYAPP_ROLE_LIST', 'APP_USER_APPLY_APPROVAL', 'CRM_INDUSTRY_MANAGER', 'DELETE_CONFIG_INDUSTRY',
    'CUSTOMER_ADD', 'BGM_SALES_STAGE_ADD', 'CUSTOMER_UPDATE_SALES'];

/**
 *  根据用户session中存储的用户信息（权限），获取菜单
 * @param req
 */
function getMenuData(req) {
    //获取用户信息
    let userInfo = auth.getUser(req);
    //获取用户权限
    let userPrivileges = userInfo.privileges;
    //菜单数据
    let menuData = [];
    return formatter(routers, userPrivileges);
}

// 将router转换成menu.
function formatter(routers, userPrivileges) {
    let menuData = [];
    if (routers) {
        _.each(routers, (route, index) => {
            if (route.name && route.routePath) {
                //没有子菜单时，检查权限
                if (!route.subMenu) {
                    if (checkPermissions(route.showPrivileges, userPrivileges)) {
                        let menu = _.clone(route);
                        delete menu.privileges;
                        delete menu.showPrivileges;
                        menu.id = menu.id.toLowerCase();
                        menuData.push(menu);
                    }
                } else {
                    //有子菜单就需要展示父菜单，不需要判断父菜单有没有权限
                    let children = formatter(route.subMenu, userPrivileges);
                    //有子菜单时，将父加入菜单
                    if (children.length > 0) {
                        let menu = _.clone(route);
                        delete menu.privileges;
                        delete menu.showPrivileges;
                        delete menu.subMenu;
                        menu.id = menu.id.toLowerCase();
                        menu.children = children;
                        menuData.push(menu);
                    }
                }
            }
        });
    }
    return menuData;
}

/**
 * 通用权限检查方法
 * Common check permissions method
 * @param { 权限判定 Permission judgment type string |array } needPrivileges
 * @param { 你的权限 Your permission description  type:string |array} currentPrivilege
 */
const checkPermissions = (needPrivileges, currentPrivilege) => {
    // 没有判定权限.默认通过检查
    if (!needPrivileges) {
        return true;
    }
    // string 处理
    if (typeof needPrivileges === 'string') {
        if (Array.isArray(currentPrivilege)) {
            for (let i = 0; i < currentPrivilege.length; i += 1) {
                const element = currentPrivilege[i];
                if (needPrivileges === element) {
                    return true;
                }
            }
        } else if (needPrivileges === currentPrivilege) {
            return true;
        }
        return false;
    }
    // 数组处理
    if (Array.isArray(needPrivileges)) {
        if (Array.isArray(currentPrivilege)) {
            for (let i = 0; i < currentPrivilege.length; i += 1) {
                const element = currentPrivilege[i];
                if (needPrivileges.indexOf(element) >= 0) {
                    return true;
                }
            }
        } else if (needPrivileges.indexOf(currentPrivilege) >= 0) {
            return true;
        }
        return false;
    }

    throw new Error('needPrivileges unsupported parameters');
};

// console.log(JSON.stringify(getMenuData()));

module.exports.getMenuData = getMenuData;