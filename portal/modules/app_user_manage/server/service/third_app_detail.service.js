var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);

var ThirdAppDetailUrls = {
    //添加app
    addApp: '/rest/base/v1/user/thirdparty',
    editApp: '/rest/base/v1/user/thirdparty',
    changeAppStatus: '/rest/base/v1/user/thirdparty/status',
    getAppDetail: '/rest/base/v1/user/thirdparty',
    getAppConfigList: '/rest/base/v1/user/thirdpartys/', // 获取用户绑定的第三方平台列表
    getPlatforms: '/rest/base/v1/user/thirdpartys/platforms'
};
exports.urls = ThirdAppDetailUrls;
// 获取用户绑定的第三方平台列表
exports.getAppConfigList = (req, res, user_id) => {
    return restUtil.authRest.get({
        url: ThirdAppDetailUrls.getAppConfigList + user_id,
        req: req,
        res: res
    });
};
// 添加app
exports.addApp = function(req, res){    
    return restUtil.authRest.post({
        url: ThirdAppDetailUrls.addApp,
        req: req,
        res: res
    }, req.body);
};
// 修改app
exports.editApp = function(req, res, data){
    return restUtil.authRest.put({
        url: ThirdAppDetailUrls.editApp,
        req: req,
        res: res
    }, req.body);
};
exports.changeAppStatus = function(req, res, data){    
    return restUtil.authRest.put({
        url: ThirdAppDetailUrls.changeAppStatus ,
        req: req,
        res: res
    }, req.body);
};
exports.getAppDetail = function(req, res){
    return restUtil.authRest.get({
        url: ThirdAppDetailUrls.getAppDetail + '/' + req.query.id,
        req: req,
        res: res
    }, {});
};
//获取所有应用平台
exports.getPlatforms = function(req, res){
    return restUtil.authRest.get({
        url: ThirdAppDetailUrls.getPlatforms,
        req: req,
        res: res
    }, {});
};