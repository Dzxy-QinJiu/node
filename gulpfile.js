/**
 * 自动生成模块代码
 *  用法：
 *    创建模块
 *      执行 gulp create --module 模块名 
 *    创建模块下的子功能
 *      执行 gulp create --module 已有的模块名 --sub 子功能名
 *  
 *  
 *  目录由对象方式表示 对象的key为文件名时，value为文件内容，对象key不是文件名时，value为文件夹
 *  getModuleDir为模块目录配置，对应文件内容moduleData
 *  getModuleSubDir为子功能目录配置，对应文件内容subModuleData
 *  
 */
var gulp = require('gulp');
var fs = require("fs");
var path = require('path');

var modules_dir = "./portal/modules/";

var errMsg = {
    invalidModuleName: "---------------- Invalid module name --------------"
};

var util = {
    isFile: name => {
        var reg = /\.(js|html|jade)$/i;
        return reg.test(name)
    },
    toFileName: name => name.replace(/_/g, "-"),//文件中的模块名
    toPathName: name => name.replace(/_/g, "-"),//路径中的模块名
    toCamelName: name => {//方法中的模块名
        var re = /[-_](\w)/g;
        return name.replace(re, function ($0, $1) {
            return $1.toUpperCase();
        });
    },
    toFooName: name => {//函数名
        var re = /[-_](\w)/g;
        var strarr = name.toLowerCase().split(' ');
        var result = '';
        for (var i in strarr) {
            result += strarr[i].substring(0, 1).toUpperCase() + strarr[i].substring(1);
        }
        return result.replace(re, function ($0, $1) {
            return $1.toUpperCase();
        });
    }
};

var moduleData = {
    serviceData: `"use strict";
    var restLogger = require("LIB_DIR/utils/logger").getLogger('rest');
    var restUtil = require("LIB_DIR/rest/rest-util")(restLogger);
    /**
     * restUtil.authRest请求方法参数
     * option {
     *  url {string}
     *  req {obj}
     *  res {obj}
     *  headers: {obj}
     *  form {obj} 用form提交时传入参数
     *  formData {obj} 用formData提交时传入参数
     * },
     * data {obj}, body里的参数
     * callback {
     *    error: function: (eventEmitter, errorCode, restResp)     *    
     *    success: function: (eventEmitter, data, restResp)
     *    timeout: function: (eventEmitter, errorCode)
     * }
     */
    //todo modify function's name
    exports.bar = function (req, res) {
        return restUtil.authRest.get({
            url: "",
            req: req,
            res: res
        }, {})
    };
    exports.foo = function(req, res){
        return restUtil.authRest.post({
            url: "",
            req: req,
            res: res
        }, {});
    };
    exports.func = function(req, res){
        return restUtil.authRest.del({
            url: "",
            req: req,
            res: res
        }, {});
    };
    exports.fun = function(req, res){
        return restUtil.authRest.put({
            url: "",
            req: req,
            res: res
        }, {});
    };
    `,
    getModuleIndexData: name => `module.exports = {
        path: "${name.replace(/-/g, "_")}",
        getComponent : function(location, cb) {
            require.ensure([], function(require){
                cb(null, require('./public')) 
            })
        }
    };`,
    getRouteData: name =>
        `require("../action/${name}-controller"),
        module.exports = {
            module: "${util.toPathName(name)}/server/action/${name}-controller",
            routes: [{
                "method": "get",
                "path": "",
                "handler": "",
                "passport": {
                    "needLogin": true
                },
                "privileges": []
            },{
                "method": "post",
                "path": "",
                "handler": "",
                "passport": {
                    "needLogin": true
                },
                "privileges": []
            },{
                "method": "delete",
                "path": "",
                "handler": "",
                "passport": {
                    "needLogin": true
                },
                "privileges": []
            },{
                "method": "put",
                "path": "",
                "handler": "",
                "passport": {
                    "needLogin": true
                },
                "privileges": []
            }]
        };`,
    getControllerData: name => {
        return `var ${util.toCamelName(name)}Service = require("../service/${util.toFileName(name)}-service");
exports.foo = function (req, res) {
    ${util.toCamelName(name)}Service.foo(req, res).on("success", function (data) {
        res.status(200).json(data);
    }).on("error", function (codeMessage) {
        res.json(codeMessage && codeMessage.message);
    });
};`
    }
};

var subModuleData = {
    action: subName =>
`var ${util.toFooName(subName)}Ajax = require("../ajax/${util.toFileName(subName)}-ajax");
this.foo = function (param) {
    ${util.toFooName(subName)}Ajax.foo(param).then((result) => {
    this.dispatch(result);
    }, (errorMsg) => {
        this.dispatch(errorMsg);
    });
};
module.exports = alt.createActions(${util.toFooName(subName)}Action);`,

    store: subName =>
        `var ${util.toFooName(subName)}Actions = require("../action/${util.toFileName(subName)}-actions");

function ${util.toFooName(subName)}Store() { 
    this.bindActions(${util.toFooName(subName)}Actions);
}

module.exports = alt.createStore(${util.toFooName(subName)}Store, '${util.toFooName(subName)}Store');`,

    ajax: subname => 
    `exports.foo = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '',
        dataType: 'json',
        type: 'get',
        success: function () {
            Deferred.resolve();
        },
        error: function (xhr) {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};`,

    view: subName => 
    `var ${util.toFooName(subName)}Actions = require('../../action/${util.toFileName(subName)}-actions');`
};

//父模块目录配置
var getModuleDir = function (moduleName) {
    var moduleName = util.toPathName(moduleName);
    var fileName = util.toFileName(moduleName);
    return {
        [moduleName]: {
            "public": {
                "action": {},
                "ajax": {},
                "style": {},
                "store": {},
                "views": {},
                "index.js": null
            },
            "server": {
                "action": {
                    [fileName + "-controller.js"]: moduleData.getControllerData(fileName)
                },
                "route": {
                    [fileName + ".http.js"]: moduleData.getRouteData(fileName)
                },
                "service": {
                    [fileName + "-service.js"]: moduleData.serviceData
                }
            },
            "index.js": moduleData.getModuleIndexData(fileName)
        }
    };
};

//子模块目录配置
var getModuleSubDir = function (moduleName, subName) {
    var fileName = util.toFileName(subName);
    return {
        [util.toPathName(moduleName)]: {
            "public": {
                "action": {
                    [fileName + "-actions.js"]: subModuleData.action(subName)
                },
                "ajax": {
                    [fileName + "-ajax.js"]: subModuleData.ajax(subName)
                },
                "store": {
                    [fileName + "-store.js"]: subModuleData.store(subName)
                },
                "views": {
                    [fileName + ".js"]: subModuleData.view(subName)
                }
            }
        }
    }
};

var writeFile = function (fileName, fileData) {
    var data = fileData || "";
    fs.writeFileSync(fileName, data)
};

//根据配置对象和路径创建文件夹和文件
var createDir = function (obj, path) {
    var path = path || "";
    var dirPath = modules_dir + path + "/";
    for (var i in obj) {
        //key不是文件名创建文件夹
        if (!util.isFile(i)) {
            fs.mkdirSync(dirPath + i);
            //递归调用,直到嵌套对象全部创建完
            if (obj[i] && typeof obj[i] == "object") {
                createDir(obj[i], path + "/" + i)
            }
        }
        //key是文件名时创建文件
        else {
            var filePath = dirPath + i;
            writeFile(filePath, obj[i]);
        }
    }
};

//创建父级模块（包含server、public、index.js）
var createModule = moduleName => {
    var moduleName = moduleName || "";
    createDir(getModuleDir(moduleName));
};

//根据配置对象和路径创建文件
var createFile = function (obj, path) {
    var path = path || "";
    var dirPath = modules_dir + path + "/";
    for (var i in obj) {
        //属性是文件时，创建文件
        if (util.isFile(i)) {
            var filePath = dirPath + i;
            writeFile(filePath, obj[i]);
        }
        //属性值是文件夹时，递归调用
        else if (obj[i] && typeof obj[i] == "object") {
            createFile(obj[i], path + "/" + i);
        }
    }
};

//创建子模块
var createSubModule = (moduleName, subName) => {
    createFile(getModuleSubDir(moduleName, subName));
};

gulp.task('create', function () {
    var moduleName = gulp.env.module;
    var subName = gulp.env.sub;
    if (!moduleName) {
        console.log(errMsg.invalidModuleName);
        return
    }
    //只输入父模块名时
    if (moduleName && !subName) {
        console.log(`------------------------ Start to create '${moduleName}' directories --------------`);
        createModule(moduleName);
    }
    //输入子模块名时
    if (moduleName && subName) {
        //存在父模块时
        var moduleDir = fs.readdirSync(modules_dir + util.toPathName(moduleName));
        console.log(moduleDir)
        if (moduleDir.length > 0) {
            //在该父模块下创建子模块
            console.log(`------------------------ Start to create '${subName}' directories --------------`);
            createSubModule(moduleName, subName);
        }
        //不存在父模块返回
        else {
            console.log(errMsg.invalidModuleName);
            return
        }
    }
});