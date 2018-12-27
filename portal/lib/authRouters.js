/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/20.
 */

let authRouters = require('../../conf/router-config').routers;
let _ = require('lodash');

/**
 *  根据用户session中存储的用户信息（权限），获取菜单
 */
function getAuthedRouters(userPrivileges) {
    return formatter(authRouters, userPrivileges);
}

//根据路由生成menu
function getMenu(route) {
    let menu;
    if (route) {
        menu = {};
        menu.id = route.id.toLowerCase();
        menu.name = route.name;
        menu.routePath = route.routePath;
        menu.isNotShow = route.isNotShow;
        menu.bottom = route.bottom;
        menu.shortName = route.shortName;
    }
    return menu;
}

// 将router转换成menu.
function formatter(routers, userPrivileges) {
    let menuData = [];
    if (routers && userPrivileges) {
        _.each(routers, (route, index) => {
            if (route.routePath) {
                //没有子菜单时，检查权限
                if (!route.subMenu) {
                    if (checkPermissions(route.showPrivileges, userPrivileges)) {
                        let menu = getMenu(route);
                        menu && menuData.push(menu);
                    }
                } else {
                    //有子菜单就需要展示父菜单，不需要判断父菜单有没有权限
                    let children = formatter(route.subMenu, userPrivileges);
                    //有子菜单时，将父加入菜单
                    if (children.length > 0) {
                        let menu = getMenu(route);
                        menu.routes = children;
                        menu && menuData.push(menu);
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

module.exports.getAuthedRouters = getAuthedRouters;