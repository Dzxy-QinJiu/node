/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/20.
 */
let path = require('path');
//打包模式
const { webpackMode } = require('../../conf/config');
//路由配置
let routerConfig = require('../../conf/router-config').routers;
//生成的路由存储的文件
let routePath = path.join(__dirname, '../public/sources/route/routers.js') || path.join(__dirname, 'routers.js');

let _ = require('lodash');
let fs = require('fs');

//一级路由标示
let ROUTE_LEVEL_1 = 1;
//二级路由标示
let ROUTE_LEVEL_2 = 2;
let COMPONENT_BASE_PATH = '../../../';//组件基础路径

//动态加载文件
function dynamic(path) {
    //魔法注释，开发模式下在导入模块时加上webpackChunkName魔法注释，以将模块代码单独打包，提高打包速度
    const magicComment = webpackMode === 'dev' ? '/* webpackChunkName: "module" */ ' : '';

    return `(props) => (<Bundle load={() => import(${magicComment}'${path}')}>{(DynamicComponet) => <DynamicComponet {...props}/>}</Bundle>)`;
}


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
            //如果有子路由
            if (routeLevel === ROUTE_LEVEL_1) {
                //第一层的渲染组件是right-content，递归处理第二层路由
                chars += '{' + dealRouteData(route) + 'component:require(\'CMP_DIR/privilege/right-content\'),routes:'
                    + generateRouters(route.routes, ROUTE_LEVEL_2) + '},';
            } else if (routeLevel === ROUTE_LEVEL_2) {
                //第二层渲染组件是content，递归处理第三层路由. (todo content可以用right-content,需要修改)
                chars += '{' + dealRouteData(route) + 'component:require(\'CMP_DIR/privilege/content\'),routes:'
                    + generateRouters(route.routes) + '},';
            } else {
                //第三层没有子路由，如果程序到这里，说明配置有问题
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
        //下级菜单的展示位置（top,left,不设默认为top）
        if(route.subMenuPosition){
            data += 'subMenuPosition:\'' + route.subMenuPosition + '\',';
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
                menu.component = COMPONENT_BASE_PATH + menu.component;
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
                    menu.component = COMPONENT_BASE_PATH + menu.component;
                    menuData.push(menu);
                }
            }
        }
    });
    return menuData;
}

//将内容写到文件中
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

//组装文件数据
function assembleFileData() {
    let routes = formatter(routerConfig);
    routes = generateRouters(routes, 1);
    let header = 'import Bundle from \'PUB_DIR/sources/route/route-bundle\';';
    let data = header + 'let routers=' + routes + ';';
    data += ' exports.routers=routers;';
    return data;
}

writeFile(routePath, assembleFileData());
