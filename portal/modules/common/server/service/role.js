var restLogger = require('../../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
var roleDto = require('../dto/role');
var _ = require('lodash');
//获取java端rest的地址
var urls = {
    //根据应用获取角色列表
    getRolesByAppId: '/rest/base/v1/application/role/:app_id',
    //根据应用获取权限列表
    getPrivilegeGroupsByAppId: '/rest/base/v1/application/permissions/:app_id'
};

//根据应用id获取角色
exports.getRolesByAppId = function(req,res,app_id,with_permission_ids) {
    return restUtil.authRest.get({
        url: urls.getRolesByAppId.replace(':app_id' , app_id),
        req: req,
        res: res
    },{},{
        success: function(emitter , list) {
            list = list.map(function(obj) {
                return new roleDto.Role(obj,with_permission_ids);
            });
            emitter.emit('success' , list);
        }
    });
};
//根据应用id获取权限
exports.getPrivilegeGroupsByAppId = function(req,res,app_id) {
    return restUtil.authRest.get({
        url: urls.getPrivilegeGroupsByAppId.replace(':app_id' , app_id),
        req: req,
        res: res
    },{} , {
        success: function(emitter , map) {
            var list = _.map(map , function(list , group_name) {
                var permission_list = _.map(list , function(obj) {
                    return new roleDto.Privilege(obj);
                });
                return {
                    permission_list: permission_list,
                    permission_group_name: group_name
                };
            });
            emitter.emit('success' , list);
        }
    });
};