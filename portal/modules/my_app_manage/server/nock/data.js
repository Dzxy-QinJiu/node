//应用的所有者列表
var owners = require('../../../user_manage/server/nock/data').userList;
var uuid = require('uuid/v4');
var App = require('../dto/appObj').App;

var appList = [
    new App({
        appId: '1',
        appName: '333',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: '333',
        status: 1
    }),
    new App({
        appId: '2',
        appName: '444',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: '444',
        status: 0
    }),
    new App({
        appId: '3',
        appName: '222',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: '222',
        status: 1
    }),
    new App({
        appId: uuid(),
        appName: '111',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: '111',
        status: 1
    }),
    new App({
        appId: uuid(),
        appName: '555',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: '555',
        status: 1
    }),
    new App({
        appId: uuid(),
        realmId: '1230',
        owner: 'xiaoxiao',
        appName: '666',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: '666',
        status: 0
    }),
    new App({
        appId: uuid(),
        appName: 'aaa',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: 'aaa',
        status: 1
    }),
    new App({
        appId: uuid(),
        appName: 'aaa',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: 'aaa',
        status: 1
    }),
    new App({
        appId: uuid(),
        appName: 'aaa',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: 'aaa',
        status: 1
    }),
    new App({
        appId: uuid(),
        appName: 'bbb',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: 'bbb',
        status: 0
    }),
    new App({
        appId: uuid(),
        appName: 'bbb',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: 'bbb',
        status: 1
    }),
    new App({
        appId: uuid(),
        appName: 'ccc',
        realmId: '1230',
        owner: 'xiaoxiao',
        redirectUrl: 'http://www.oplate.com',
        appLogo: '',
        appDesc: 'ccc',
        status: 1
    })
];

//获取安全域列表所需数据
var getApps = function(params) {
    if (!params.current_page && !params.page_size && !params.filter_content) {
        return {
            list_size: appList.length,//所有应用列表的长度
            data: appList
        };
    } else {
        //当前页数
        var curPage = parseInt(params.current_page);
        //每页条数
        var pageSize = parseInt(params.page_size);
        var searchContent = params.filter_content;
        var scApps = [];
        if (searchContent && appList.length > 0) {
            for (var c = 0, cLen = appList.length; c < cLen; c++) {
                if (appList[c].appName.lastIndexOf(searchContent) != -1) {
                    scApps.push(appList[c]);
                } else if (appList[c].redirectUrl.lastIndexOf(searchContent) != -1) {
                    scApps.push(appList[c]);
                } else if (appList[c].appDesc.lastIndexOf(searchContent) != -1) {
                    scApps.push(appList[c]);
                } else if (appList[c].owner.lastIndexOf(searchContent) != -1) {
                    scApps.push(appList[c]);
                }

            }
        } else {
            scApps = appList;
        }
        //当前要展示的第一个域在所有域中的索引
        var first = 0;
        if (curPage != 1) {
            first = (curPage - 1) * pageSize;
        }
        //当前要展示到哪个用户索引之前
        var end = first + pageSize;
        if (end > scApps.length) {
            end = scApps.length;
        }
        var curAppList = [];
        for (var i = first; i < end; i++) {
            var app = scApps[i];
            if (app) {
                curAppList.push(app);
            }
        }
        return {
            list_size: appList.length,//所有应用列表的长度
            data: curAppList//当前页安全域列表的数据
        };
    }
};

var addApp = function(app) {
    app.appId = uuid();
    ownerId = addApp.owner ? addApp.owner.ownerId : '';
    for (var i = 0, len = owners.length; i < len; i++) {
        if (owners[i].userId == ownerId) {
            app.owner = {
                ownerId: owners[i].userId,
                ownerName: owners[i].userName
            };
            break;
        }
    }
    appList.push(app);
    return app;
}
    ;
var editApp = function(editApp) {
    var target = appList.find(function(item) {
        return item.appId === editApp.appId;
    });
    if (target) {
        if (editApp.hasOwnProperty('status')) {
            target.status = editApp.status;
        } else {
            target.appName = editApp.appName;
            target.redirectUrl = editApp.redirectUrl;
            target.appLogo = editApp.appLogo;
            for (var i = 0, len = owners.length; i < len; i++) {
                if (owners[i].userId == editApp.ownerId) {
                    target.owner = {
                        ownerId: owners[i].userId,
                        ownerName: owners[i].userName
                    };
                    break;
                }
            }
            target.appDesc = editApp.appDesc;
        }
    }
    return target;
};

module.exports = {
    'appList': appList,
    'getApps': getApps,
    'addApp': addApp,
    'editApp': editApp
};