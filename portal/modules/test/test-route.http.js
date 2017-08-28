/**
 * Created by liwenjun on 2015/12/25.
 */

"use strict";

/**
 * 测试请求路径
 */

module.exports = {
    module: "test/test-controller",
    routes: [
        {
        "method": "get",
        "path": "/test/weather",
        "handler": "getData"
    },{
        "method": "get",
        "path": "/test/token",
        "handler": "getToken"
    },{
        "method": "get",
        "path": "/test/test1",
        "handler": "test1"
    },{
        "method": "get",
        "path": "/test/test2",
        "handler": "test2"
    },{
        "method": "get",
        "path": "/test/test3",
        "handler": "test3"
    },{
        "method": "get",
        "path": "/downloadImg",
        "handler": "downloadImg"
        }
    ]
};