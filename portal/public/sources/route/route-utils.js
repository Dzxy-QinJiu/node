/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/20.
 */

import {hasPrivilege} from 'CMP_DIR/privilege/checker';

const history = require('../history');
const userData = require('../user-data');
const menuUtil = require('../utils/menu-util');
const ROUTE_CONST = {
    'SALES_HOME': 'sales_home_page',//销售首页id
    'HOME_PAGE': 'home_page'//合同概览id
};

//如果访问/，跳转到左侧导航菜单的第一个路由
class FirstIndexRoute extends React.Component {
    //当组件即将加载的时候，跳转到第一个路由
    componentWillMount() {
        var allMenus = menuUtil.getAllMenu();
        if (allMenus[0] && allMenus[0].routePath) {
            history.replace(allMenus[0].routePath);
        }
    }

    //渲染内容为空，只做跳转
    render() {
        return null;
    }
}

//如果访问/，销售人员跳转到销售首页的第一个路由
class SalesIndexRoute extends React.Component {
    //当组件即将加载的时候，跳转到第一个路由
    componentWillMount() {
        var home_page = menuUtil.getMenuById(ROUTE_CONST.SALES_HOME);
        //跳到销售首页
        if (home_page) {
            history.replace(home_page.routePath);
            return true;
        }
    }

    //渲染内容为空，只做跳转
    render() {
        return null;
    }
}

//跳转到客套首页
class HomeIndexRoute extends React.Component {
    componentWillMount() {
        var home_page = menuUtil.getMenuById(ROUTE_CONST.HOME_PAGE);
        if (home_page) {
            history.replace(home_page.routePath);
            return true;
        }
    }

    render() {
        return null;
    }
}

//如果之前是直接请求某个模块的路径，后登录的
class TurnPageIndexRoute extends React.Component {
    componentWillMount() {
        var data = userData.getUserData();
        //跳到对应页
        history.replace(data.preUrl || '/');
        //只执行一次，需要删除属性值
        delete data.preUrl;
        return true;
    }

    //渲染内容为空，只做跳转
    render() {
        return null;
    }
}

//根路径路由
const IndexRoute = (props) => {
    let user = userData.getUserData();
    if (user.preUrl && user.preUrl !== '/') {
        return <TurnPageIndexRoute/>;
    } else {
        if (hasPrivilege('USER_INFO_USER')) {// USER_INFO_USER 获取我的个人资料的权限
            //客套首页
            return <HomeIndexRoute/>;
        } else {
            return <FirstIndexRoute/>;
        }
    }
};

/**
 * 根据用户能展示的路由过滤真实路由
 * @param authedRouters  有权限查看的路由
 * @param allRoutes  全部路由
 * @param isCommonSales 是否是普通销售
 * @returns {Array}
 */

function matchRoute(authedRouters, allRoutes, isCommonSales) {
    let routes = [];
    _.each(allRoutes, (ar) => {
        let findedRoute = _.find(authedRouters, (route) => {
            return route.id === ar.id;
        });
        if (findedRoute) {
            // delete ar.id;
            if (ar.routes) {
                let children = matchRoute(findedRoute.routes, ar.routes);
                if (children.length > 0) {
                    ar.routes = children;
                    routes.push(ar);
                }
            } else {
                routes.push(ar);
            }
        }
    });
    return routes;
}

/**
 * 过滤销售首页路由
 * @param routes  授权的路由
 * @param isCommonSales  普通销售
 */
function dealCommonSaleRoute(routes, isCommonSales) {
    let commonSalesRouteIndex = -1;
    let commonSalesRoute = _.find(routes, (route, index) => {
        if (route.otherAuth === 'isCommonSale') {
            commonSalesRouteIndex = index;
            return true;
        }
    });
    //有普通销售路由，
    if (commonSalesRoute) {
        // 当前是普通销售,找到与普通销售路由一样的路由，并删除
        if (isCommonSales) {
            let salesRouteIndex = -1;
            let salesRoute = _.find(routes, (route, index) => {
                if (route.id === commonSalesRoute.id && route.otherAuth !== 'isCommonSale') {
                    salesRouteIndex = index;
                    return true;
                }
            });
            if (salesRouteIndex >= 0) {
                routes.splice(salesRouteIndex, 1);
            }
        } else {
            //    不是普通销售，删除普通销售路由
            if (commonSalesRouteIndex >= 0) {
                routes.splice(commonSalesRouteIndex, 1);
            }
        }
    }
}
function filterCertainRoutes(routes, item) {
    //在路由中删掉这个流程
    //application_apply_management 是父路由的id
    var target = _.find(routes, item => item.id === 'application_apply_management');
    if (target && _.isArray(target.routes)) {
        target.routes = _.filter(target.routes, subMenuItem => subMenuItem.id !== item.id);
    }
}
/*
 * 过滤流程配置路由
 * * @param userRoutes  授权的路由
 *   @param workFlowConfigLiST  配置申请审批流程
 * */
function dealWorkFlowConfigRoute(userRoutes, workFlowConfigList) {
    var REPORTANDDOUCMENTMAP = [{
        id: 'reportsend_apply_management',
        configType: 'opinionreport'
    }, {
        id: 'documentwriting_apply_management',//路由配置中路由id
        configType: 'documentwriting'//获取后端返回的申请流程配置中流程的类型
    }];
    _.forEach(REPORTANDDOUCMENTMAP, item => {
        if (!workFlowConfigList || _.indexOf(_.map(workFlowConfigList, 'type'), item.configType) < 0 ) {
            filterCertainRoutes(userRoutes, item);
        }
    });
}

/**
 * 过滤路由，返回界面上需要的路由
 * @param allRoutes
 * @returns {*[]}
 */
function filterRoute(allRoutes) {
    let user = userData.getUserData();
    //过滤没有配置过流程的路由
    dealWorkFlowConfigRoute(user.routes, user.workFlowConfigs);
    let childRoutes = matchRoute(user.routes, allRoutes);
    dealCommonSaleRoute(childRoutes, user.isCommonSales);
    //路由配置
    const routePaths = [
        {
            component: require('../page-frame'),
            routes: [
                {
                    path: '/',
                    exact: true,
                    component: IndexRoute
                },
                ...childRoutes
            ]
        }
    ];
    return routePaths;
}

exports.filterRoute = filterRoute;