/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/12/20.
 */

import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Bundle from 'PUB_DIR/sources/route/route-bundle';
const history = require('../history');
const userData = require('../user-data');
const menuUtil = require('../utils/menu-util');
const ROUTE_CONST = {
    'SALES_HOME': 'sales_home_page',//销售首页id
    'HOME_PAGE': 'home_page',//首页id
    'CALL_RECORD': 'call_record',//通话记录id
};
const isOpenCaller = require('../utils/common-method-util').isOpenCaller;
import {SELF_SETTING_FLOW} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
//是否是csm.curtao.com，是否在蚁坊域的判断方法
import {isCurtao, isOrganizationEefung, checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import {PRIVILEGE_MAP} from 'PUB_DIR/sources/utils/consts';
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
        //个人版（试用，正式）,暂时没有首页
        var home_page = menuUtil.getMenuById(ROUTE_CONST.HOME_PAGE);
        if (hasPrivilege('USER_INFO_USER') && home_page) {// USER_INFO_USER 获取我的个人资料的权限
            //客套首页
            return <HomeIndexRoute/>;
        } else {
            return <FirstIndexRoute/>;
        }
        // if (hasPrivilege('GET_ALL_CALL_RECORD') || //GET_ALL_CALL_RECORD 获取所有电话统计记录的权限
        //     hasPrivilege('GET_MY_CALL_RECORD')) {//GET_MY_CALL_RECORD 获取我的电话统计记录的权限
        //     //客套销售首页视图的权限跳到销售主页
        //     return <SalesIndexRoute/>;
        // } else {
        //     return <FirstIndexRoute/>;
        // }
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
    }, {
        id: 'app_user_manage_apply',//路由配置中路由id
        configType: 'userapply'//获取后端返回的申请流程配置中流程的类型
    }, {
        id: 'leave_apply_management',//路由配置中路由id
        configType: 'leave'//获取后端返回的申请流程配置中流程的类型
    }, {
        id: 'sales_bussiness_apply_management',//路由配置中路由id
        configType: 'businessopportunities'//获取后端返回的申请流程配置中流程的类型
    }, {
        id: 'bussiness_apply_management',//路由配置中路由id
        configType: 'businesstrip'//获取后端返回的申请流程配置中流程的类型
    }, {
        id: 'my_leave_apply_management',//路由配置中路由id
        configType: SELF_SETTING_FLOW.VISITAPPLY//获取后端返回的申请流程配置中流程的类型
    }, {
        id: 'my_domain_apply_management',//路由配置中路由id
        configType: SELF_SETTING_FLOW.DOMAINAPPLY//获取后端返回的申请流程配置中流程的类型
    }];
    _.forEach(REPORTANDDOUCMENTMAP, item => {
        if (!workFlowConfigList || _.indexOf(_.map(workFlowConfigList, 'type'), item.configType) < 0//只有配置过流程的才展示域名申请的tab
        ) {
            filterCertainRoutes(userRoutes, item);
        }
    });
}

/***
 * 过滤通话记录路由
 * * @param userRoutes  授权的路由
 * @returns {*[]}
 */
function dealCallRecordRoute(userRoutes) {
    // 没有开通呼叫中心时，过滤掉通话记录路由
    if(!isOpenCaller()) {
        let callRecordIndex = _.findIndex(userRoutes, item => item.id === ROUTE_CONST.CALL_RECORD);
        if(callRecordIndex !== -1) {
            userRoutes.splice(callRecordIndex, 1);
        }
    }
}
//过滤掉curtao域名下不显示的菜单
function filterCurtaoRoutes(routes) {
    //curtao域名下不显示的一级菜单
    const filterFirstMenuIds = [
        'deal_manage',//订单
        'app_user_manage',//用户
        'oplate_analysis',//分析
        'application_apply_management',//申请审批
        'application_apply_management1',//拜访申请
        'notification',//通知
    ];
    //curtao域名下后台管理中不显示的菜单
    const filterBackgroundMenuIds = [
        'apply_approve',//审批流程配置
        'orderstage',//订单阶段
        'sales_auto',//销售自动化（用户、客户评分）
        'sales_process',//客户阶段的配置
        'clue_integration', // 线索集成
    ];
    if(isCurtao()){
        //过滤掉不显示的一级菜单
        routes = _.filter(routes, item => !_.includes(filterFirstMenuIds, item.id));
        let backgroundRoutes = _.find(routes, item => item.id === 'background_management');
        //过滤掉后端管理中不显示的菜单
        if(_.get(backgroundRoutes, 'routes[0]')){
            backgroundRoutes.routes = _.filter(backgroundRoutes.routes, item => !_.includes(filterBackgroundMenuIds, item.id));
        }
    }
    return routes;
}
//过滤掉个人版（试用，正式）不用显示的路由
function filterPersonalRoutes(routes) {
    let versionAndType = checkVersionAndType();
    if(versionAndType.personal) {
        let homePageIndex = _.findIndex(routes, item => item.id === ROUTE_CONST.HOME_PAGE);
        if(homePageIndex !== -1) {
            routes.splice(homePageIndex, 1);
        }
    }
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
    //过滤没有开通呼叫中心时的通话记录路由
    dealCallRecordRoute(user.routes);
    let childRoutes = matchRoute(user.routes, allRoutes);
    dealCommonSaleRoute(childRoutes, user.isCommonSales);
    //如果申请审批没有内容，手动渲染一个页面进去
    //todo 申请审批代码优化后会去掉
    var targetObj = _.find(childRoutes, item => item.id === 'application_apply_management');
    if (targetObj) {
        //如果有内置或者自定义的流程，过滤掉申请审批的提示页面
        childRoutes = _.filter(childRoutes, item => item.id !== 'application_apply_management1');
        user.routes = _.filter(user.routes, item => item.id !== 'application_apply_management1');
        //如果没有获取用户列表的权限，需要把用户审批tab也去掉
        if(!hasPrivilege(PRIVILEGE_MAP.APP_USER_LIST)){
            var userApplyObj = _.find(user.routes, item => item.id === 'application_apply_management');
            if(_.get(userApplyObj,'routes')){
                userApplyObj.routes = _.filter(userApplyObj.routes, item => item.id !== 'app_user_manage_apply');
            }
            if(_.get(targetObj,'routes')){
                targetObj.routes = _.filter(targetObj.routes, item => item.id !== 'app_user_manage_apply');
            }
        }
    }else {
        //如果展示的是申请审批的提示页面，把申请申请页面过滤掉
        user.routes = _.filter(user.routes, item => item.id !== 'application_apply_management');
    }
    //如果是蚁坊的组织，需要把销售自动化的去掉
    if(isOrganizationEefung()){
        var backgroundObj = _.find(user.routes, item => item.id === 'background_management');
        if(_.get(backgroundObj,'routes')){
            backgroundObj.routes = _.filter(backgroundObj.routes, item => item.id !== 'sales_auto');
        }
    }
    //如果是个人版（试用，正式），不需要展示首页，即/home,需过滤掉
    filterPersonalRoutes(user.routes);
    //过滤掉curtao域名下不显示的菜单
    user.routes = filterCurtaoRoutes(user.routes);
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