/**
 * ajax url定义
 */
var urls = {
    getGrantApplications : "/rest/base/v1/application/grant_applications",
    getMyApplications : "/rest/base/v1/user/manage_apps"
};
var restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("../../../../lib/rest/rest-util")(restLogger);
var appDto = require("../dto/app");
var _ = require("underscore");
//根据当前用户数据权限，获取应用列表
exports.getGrantApplications = function(req,res,status) {
    return restUtil.authRest.get({
        url: urls.getGrantApplications,
        req: req,
        res: res
    },{
        status : status
    },{
        success : function(emitter,list) {
            if(!_.isArray(list)) {
                list = [];
            }
            var responseList = list.map(function(originApp) {
                return new appDto.App(originApp);
            });
            emitter.emit("success" , responseList);
        }
    });
};
//根据当前用户数据权限，获取“我的应用”列表
exports.getMyApplications = function(req,res) {
    return restUtil.authRest.get({
        url: urls.getMyApplications,
        req: req,
        res: res
    },{},{
        success : function(emitter,result) {
            //处理数据
            var dataObj = _.isObject(result) ? result : {};
            var list = _.isArray(dataObj.data) ? dataObj.data : [];
            if(!_.isArray(list)) {
                list = [];
            }
            var responseList = list.map(function(originApp) {
                return new appDto.App(originApp);
            });
            emitter.emit("success" , responseList);
        }
    });
};