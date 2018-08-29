var React = require('react');
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
var Router = require('react-router').Router;
var userData = require('./user-data');
var history = require('./history');

import Translate from '../intl/i18nTemplate';

//如果访问/，跳转到左侧导航菜单的第一个路由
class HomeIndexRoute extends React.Component {
    //当组件即将加载的时候，跳转到第一个路由
    componentWillMount() {
        var data = userData.getUserData();
        var sideBarMenus = data.sideBarMenus;
        if (sideBarMenus[0] && sideBarMenus[0].routePath) {
            history.replace(sideBarMenus[0].routePath);
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
        var data = userData.getUserData();
        var sideBarMenus = data.sideBarMenus;
        _.some(sideBarMenus, function(menu) {
            if (menu.routePath === 'sales/home') {
                //跳到销售首页
                history.replace('sales/home');
                return true;
            }
        });
    }

    //渲染内容为空，只做跳转
    render() {
        return null;
    }
}

//跳转到合同仪表盘
class ContractIndexRoute extends React.Component {
    componentWillMount() {
        var data = userData.getUserData();
        var subModules = data.subModules.contract;
        _.some(subModules, function(module) {
            if (module.routePath === 'contract/dashboard') {
                history.replace('contract/dashboard');
                return true;
            }
        });
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

//获取权限之后,系统入口
function init() {
    var childRoutes = [];
    var user = userData.getUserData();
    _.each(user.modules, function(module) {
        switch (module) {
        //销售主页
            case 'sales_home_page':
            //如果是普通销售
                if (user.isCommonSales) {
                    childRoutes.push(require('../../modules/common_sales_home_page'));
                } else {
                    childRoutes.push(require('../../modules/sales_home_page'));
                }
                break;
            //用户管理
            case 'user_manage':
                childRoutes.push(require('../../modules/user_manage'));
                break;
            case 'oplate_user_analysis':
                childRoutes.push(require('../../modules/oplate_user_analysis'));
                break;
            case 'oplate_customer_analysis':
                childRoutes.push(require('../../modules/oplate_customer_analysis'));
                break;
            //后台管理
            case 'background_management':
                childRoutes.push(require('./background_management'));
                break;
            //个人信息管理
            case 'user_info_manage':
                childRoutes.push(require('./user_info_manage'));
                break;
            //客户关系管理
            case 'crm':
                childRoutes.push(require('../../modules/crm'));
                break;
            //线索客户管理
            case 'clue_customer':
                childRoutes.push(require('../../modules/clue_customer'));
                break;
            //通话记录
            case 'call_record':
                childRoutes.push(require('../../modules/call_record'));
                break;
            //合同管理
            case 'contract':
                childRoutes.push(require('./contract'));
                break;
            //应用用户管理
            case 'user':
                childRoutes.push(require('./app_user_manage'));
                break;
            //通知
            case 'notification':
                childRoutes.push(require('../../modules/notification'));
                break;
            case 'app_user_manage_apply':
                childRoutes.push(require('../../modules/user_apply'));
                break;
            //日程管理
            case 'schedule_management':
                childRoutes.push(require('../../modules/schedule_management'));
                break;
            case 'weekly_report_analysis':
                childRoutes.push(require('../../modules/weekly_report'));
                break;
        }
    });

    childRoutes.push({
        path: '*',
        components: require('./404')
    });

    var rootRoute = {
        component: 'div',
        childRoutes: [{
            path: '/',
            //添加indexroute，做首页访问的跳转
            getIndexRoute: function(location, callback) {
                if (user.preUrl && user.preUrl !== '/') {
                    callback(null, {
                        component: TurnPageIndexRoute
                    });
                } else {
                    if (hasPrivilege('GET_ALL_CALL_RECORD') || //GET_ALL_CALL_RECORD 获取所有电话统计记录的权限
                        hasPrivilege('GET_MY_CALL_RECORD')) {//GET_MY_CALL_RECORD 获取我的电话统计记录的权限
                        //客套销售首页视图的权限跳到销售主页
                        callback(null, {
                            component: SalesIndexRoute
                        });
                    } else if (userData.hasRole(userData.ROLE_CONSTANS.ACCOUNTANT)) {
                        //财务人员跳转到合同仪表盘
                        callback(null, {
                            component: ContractIndexRoute
                        });
                    } else {
                        callback(null, {
                            component: HomeIndexRoute
                        });
                    }
                }
            },
            component: require('./page-frame'),
            childRoutes: childRoutes
        }]
    };


    ReactDOM.render(<Translate Template={<Router history={history} routes={rootRoute}/>}></Translate>,
        $('#app')[0]
    );
}

exports.init = init;

