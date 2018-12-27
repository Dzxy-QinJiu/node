/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/20.
 */
let path = require('path');
let portal_root_path = path.resolve(__dirname, '../');
let routerConfig = require('../../conf/router-config').routers;
let _ = require('lodash');
let fs = require('fs');
let ROUTE_LEVEL_1 = 1;
let ROUTE_LEVEL_2 = 2;

function dynamic(path) {
    return `(props) => (<Bundle load={() => import('${path}')}>{(DynamicComponet) => <DynamicComponet {...props}/>}</Bundle>)`;
}

let header = 'import Bundle from \'PUB_DIR/sources/route/route-bundle\';';

/**
 * 生成路由
 * @param routers 路由配置
 * @param routeLevel 路由层级
 * @param isCommonsales 是否是普通销售
 * @returns {Array}
 */
function generateRouters(routerConfig, routeLevel) {
    let chars = '[';
    let childRoutes = _.each(routerConfig, function(route) {
        if (!route.routes) {
            let path = route.component;
            chars += '{' + dealRouteData(route) + 'component: ' + dynamic(path) + '},';
        } else {
            //第一层的渲染组件是right-content
            if (routeLevel === ROUTE_LEVEL_1) {
                chars += '{' + dealRouteData(route) + 'component:require(\'CMP_DIR/privilege/right-content\'),routes:'
                    + generateRouters(route.routes, ROUTE_LEVEL_2) + '},';
            } else if (routeLevel === ROUTE_LEVEL_2) {
                //第二层渲染组件是content，todo 可以用right-content,需要修改
                chars += '{' + dealRouteData(route) + 'component:require(\'CMP_DIR/privilege/content\'),routes:'
                    + generateRouters(route.routes) + '},';
            } else {
                throw Error('没有第四级菜单，路由配置错误');
            }
        }
    });
    return chars + ']';
}

//处理路由中数据
function dealRouteData(route) {
    let data = '';
    if (route) {
        if (route.id) {
            data += 'id:\'' + route.id.toLowerCase() + '\',';
        }
        if (route.routePath) {
            data += 'path:\'' + route.routePath + '\',';
        }
        if (route.otherAuth) {
            data += 'otherAuth:\'' + route.otherAuth + '\',';
        }
    }
    return data;
}

// 生成路由配置.
function formatter(routers) {
    let menuData = [];
    _.each(routers, (route, index) => {
        if (route.routePath) {
            //没有子菜单时
            if (!route.subMenu) {
                let menu = _.clone(route);
                delete menu.privileges;
                delete menu.showPrivileges;
                menu.id = menu.id.toLowerCase();
                menu.component = '../../../' + menu.component;
                menuData.push(menu);
            } else {
                //有子菜单就需要展示父菜单
                let children = formatter(route.subMenu);
                //有子菜单时，将父加入菜单
                if (children.length > 0) {
                    let menu = _.clone(route);
                    delete menu.privileges;
                    delete menu.showPrivileges;
                    delete menu.subMenu;
                    menu.id = menu.id.toLowerCase();
                    menu.routes = children;
                    menu.component = '../../../' + menu.component;
                    menuData.push(menu);
                }
            }
        }
    });
    return menuData;
}

// console.log(JSON.stringify(routerConfig));

var writeFile = function(fileName, fileData) {
    fs.exists(fileName, function(exists) {
        try {
            fs.writeFile(fileName, fileData, 'utf8',
                function(err) {
                    if (err) {
                        throw err;
                    } else {
                        console.info('生成路由成功！');
                    }
                }
            );
        } catch (e) {
            console.info('生成路由失败，' + JSON.stringify(e));
        }
    });
};

let routePath = path.join(portal_root_path, 'public/sources/route/routers.js');
let routes = formatter(routerConfig);
routes = generateRouters(routes, 1);
let data = header + 'let routers=' + routes + ';';
data += ' exports.routers=routers;';

writeFile(routePath, data);