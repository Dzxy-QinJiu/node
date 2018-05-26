/**
 * 根据角色获取成员列表
 */

let restLogger = require("../../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
let userDto = require("../dto/user");
var _ = require("underscore");
let getUserListByRoleUrl = "/rest/base/v1/user/byrole";
let getUserInfoById = "/rest/base/v1/user/id/:user_id";
//根据角色，获取成员列表
exports.getUserListByRole = function(req, res, queryParams) {
    return restUtil.authRest.get({
        url: getUserListByRoleUrl,
        req: req,
        res: res
    }, queryParams, {
        success: function(emitter, list) {
            if (!_.isArray(list)) {
                list = [];
            }
            var responseList = list.map(function(originUser) {
                return new userDto.User(originUser);
            });
            emitter.emit("success", responseList);
        }
    });
};
//根据成员id，获取成员信息
exports.getUserById = function(req,res,userId) {
    return restUtil.authRest.get({
        url: getUserInfoById.replace(":user_id",userId),
        req: req,
        res: res
    }, {}, {
        success: function(emitter, data) {
            var transferUser = new userDto.UserById(data);
            emitter.emit("success", transferUser);
        }
    });
};