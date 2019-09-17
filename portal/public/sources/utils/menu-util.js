/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/25.
 */
import memoizeOne from 'memoize-one';

const userData = require('../user-data');
//国际化后的菜单
let intledMenu;

//获取菜单数据
function getAllMenus() {
    return userData.getUserData() && userData.getUserData().routes;
}

//国际化菜单名称
function setIntlName(menus) {
    _.each(menus, (menu) => {
        if (menu.name) {
            menu.name = Intl.get(menu.name, menu.name);
        }
        if (menu.shortName) {
            menu.shortName = Intl.get(menu.shortName, menu.shortName);
        }
        if (menu.routes) {
            setIntlName(menu.routes);
        }
    });
    return menus;
}

/**
 * 获取国际化后的菜单
 * @param isGetNew 是否生成一份新数据，默认是false
 * @returns {*}
 */
function getIntledMenus(isGetNew = false) {
    if (!intledMenu) {
        let allMenus = getAllMenus();
        intledMenu = setIntlName(_.cloneDeep(allMenus));
    }
    //生成一份新数据
    if (isGetNew) {
        return _.cloneDeep(intledMenu);
    } else {
        return intledMenu;
    }
}

//获取所有菜单
function getAllMenu() {
    let menus = getIntledMenus();
    return _.filter(menus, (menu) => {
        //过滤掉没有名称的,如：* 路由
        if (!menu.name) {
            return false;
        } else {
            return true;
        }
    });
}

//获取要显示的一级菜单
function getFirstLevelMenus() {
    let menus = getIntledMenus();
    return _.filter(menus, (menu) => {
        //需要用eval将isNotShow属性由字符串转成js代码，以便回调函数形式的值能执行
        let isNotShow = eval(menu.isNotShow);

        if (_.isFunction(isNotShow)) {
            isNotShow = isNotShow();
        }

        //过滤掉不展示的，没有名称的，需要展示到底部的
        if (isNotShow || !menu.name || menu.bottom === true) {
            return false;
        } else {
            return true;
        }
    });
}

//根据菜单id获取菜单数据
function getMenuById(menuId) {
    let menus = getIntledMenus();
    return getItemById(menus, menuId);
}

//根据menuId递归查找菜单
function getItemById(menus, menuId) {
    let finedMenu;
    let childMenus = [];//存储所有子菜单
    //广度优先遍历
    _.each(menus, (menu) => {
        if (menu.id === menuId) {
            finedMenu = menu;
            return false;
        } else if (menu.routes) {
            childMenus.push(...menu.routes);
        }
    });
    //如果没有找到,子菜单不为空时，查找下一级菜单
    if (!finedMenu && childMenus.length > 0) {
        finedMenu = getItemById(childMenus, menuId);
    }
    return finedMenu;
}

//获取同一级别菜单项
function getMenusInOneParent(menus) {
    let modules;
    if (menus) {
        modules = _.map(menus, (menu) => {
            delete menu.routes;
            return menu;
        });
    }
    return modules;
}

/**
 * 根据路径查找菜单
 * @param menus
 * @param path
 * @returns {Array}
 */
function findRoute(menus, path) {
    let subMenus;
    _.find(menus, (menu) => {
        //相同时，返回下级菜单
        if (menu.routePath === path) {
            subMenus = getMenusInOneParent(menu.routes);
            return true;
        }
    });
    return subMenus;
}

/**
 * 获取下级菜单
 * @param rootPath
 * @returns {Array}
 */

const innerGetSubMenus = function(rootPath) {
    let subMenus;
    let menus = getIntledMenus(true);
    //存在并且是字符串
    if (rootPath && _.isString(rootPath) && menus) {
        //开头没有"/"时候，添加上"/"
        if (rootPath.indexOf('/') !== 0) {
            rootPath = '/' + rootPath;
        }
        //不是"/",结尾有"/"时，删除"/"
        if (rootPath !== '/' && rootPath[rootPath.length - 1] === '/') {
            rootPath = rootPath.slice(0, rootPath.length - 1);
        }
        //是一级路径
        if (rootPath.match(/^\/[^\/|^\\]*$/g)) {
            //返回子菜单
            subMenus = findRoute(menus, rootPath);
        } else {
            //  如果是二级路径，todo 三级路径未处理
            _.find(menus, (menu) => {
                //返回子菜单
                subMenus = findRoute(menu.routes, rootPath);
                if (subMenus) {
                    return true;
                }
            });
        }
    }
    return subMenus;
};

//使用memoizeOne封装innerGetFirstLevelMenus
const memoizeOneGetMenuById = memoizeOne(getMenuById);
//获取某个菜单项
exports.getMenuById = memoizeOneGetMenuById;
//获取一级菜单项
exports.getFirstLevelMenus = getFirstLevelMenus;
exports.getAllMenu = getAllMenu;
//使用memoizeOne封装innerGetSubMenus
const memoizeOneGetSubMenus = memoizeOne(innerGetSubMenus);
//获取下级菜单项
exports.getSubMenus = memoizeOneGetSubMenus;
