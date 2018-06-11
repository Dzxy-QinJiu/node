var _ = require('lodash');
//角色实体
exports.Role = function(obj,with_permission_ids) {
    this.role_id = obj.role_id || '';
    this.role_name = obj.role_name || '';
    if(with_permission_ids) {
        this.permission_ids = _.isArray(obj.permission_ids) ? obj.permission_ids : [];
    }
};
//权限实体
exports.Privilege = function(obj) {
    this.permission_id = obj.permission_id || '';
    this.permission_define = obj.permission_define || '';
    this.permission_name = obj.permission_name || '';
};