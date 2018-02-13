/*!
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 */

"use strict";

/**
 * 请求路径 - home
 */

module.exports = {
    module: "home/action/desktop-index-controller",
    routes: (function () {
        var list = [{
            "method": "get",
            "path": "/weekly_report",
            "handler": "home",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "get",
            "path": "/",
            "handler": "home",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "get",
            "path": "/user/data.js",
            "handler": "getUserData",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "post",
            "path": "/upload",
            "handler": "upload",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "get",
            "path": "/test",
            "handler": "test",
            "passport": {
                "needLogin": true
            }
        }, {
            "method": "get",
            "path": "/ketao",
            "handler": "getAppQrCodeAgent",
            "passport": {
                "needLogin": false
            }
        }, {
            "method": "get",
            "path": "/email/active",
            "handler": "activeEmail",
            "passport": {
                "needLogin": false
            }
        }, {
            "method": "get",
            "path": "/js/logger",
            "handler": "recordLog",
            "passport": {
                "needLogin": false
            }
        }
        ];

        //遍历所有react-router的路由，这些路由，都渲染index.html
        var MenusAll = require(require("path").join(config_root_path, "menu.js"));
        var leftMenus = new MenusAll();
        var leftMenuList = leftMenus.getLeftMenuList();
        var treeWalk = require("tree-walk");
        treeWalk.preorder(leftMenuList, function (value, key, parent) {
            if (key === "routePath") {
                list.push({
                    "method": "get",
                    "path": "/" + value,
                    "handler": "home",
                    "passport": {
                        "needLogin": true
                    }
                });
            }
        });

        return list;
    })()
};
