/**
 * Created by xiaojinfeng on  2015/12/25 11:12 .
 */
function Role(opts) {
    this.roleId = opts.roleId;
    this.roleName = opts.roleName || "unknown";
    this.roleControl = opts.roleControl || "unknown";
    this.authorityIds = opts.authorityIds || "unknown";
}

module.exports = Role;