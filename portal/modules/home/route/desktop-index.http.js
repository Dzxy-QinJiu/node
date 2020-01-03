/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

let routers = require(require('path').join(config_root_path, 'router-config.js'));
let _ = require('lodash');

function getRoutesFromConfig(routers) {
    //遍历所有react-router的路由，这些路由，都渲染index.html
    let list = [];
    _.each(routers, (route) => {
        //只要有routePath，也就是正常路由，都要处理。排除通配符路由（*），不然后边添加/login等路由都有问题。
        if (route.routePath && route.id !== 'NO_MATCH') {
            list.push({
                'method': 'get',
                'path': route.routePath,
                'handler': 'home',
                'passport': {
                    'needLogin': true
                }
            });
        }
        if (route.subMenu) {
            list.push(...getRoutesFromConfig(route.subMenu));
        }
    });
    return list;
}

/**
 * 请求路径 - home
 */


module.exports = {
    module: 'home/action/desktop-index-controller',
    routes: (function() {
        var list = [{
            'method': 'get',
            'path': '/weekly_report',
            'handler': 'home',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'get',
            'path': '/',
            'handler': 'home',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'get',
            'path': '/user/data.js',
            'handler': 'getUserData',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'post',
            'path': '/upload',
            'handler': 'upload',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'get',
            'path': '/test',
            'handler': 'test',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'get',
            'path': '/ketao',
            'handler': 'getAppQrCodeAgent',
            'passport': {
                'needLogin': false
            }
        }, {
            'method': 'get',
            'path': '/email/active',
            'handler': 'activeEmail',
            'passport': {
                'needLogin': false
            }
        }, {
            'method': 'get',
            'path': '/js/logger',
            'handler': 'recordLog',
            'passport': {
                'needLogin': false
            }
        }, {
            'method': 'get',
            'path': '/rest/user/address/:phone',
            'handler': 'getUserAreaData',
            'passport': {
                'needLogin': false
            }
        }
        ];
        list.push(...(_.unionBy(getRoutesFromConfig(routers.routers), 'path')));
        return list;
    })()
};
