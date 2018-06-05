function Authority(opts) {
    this.id = opts.id;
    this.permissionId = opts.permissionId || 'unknown';
    this.permissionName = opts.permissionName || 'unknown';
    this.permissionDefine = opts.permissionDefine || 'unknown';
    this.realmId = opts.realmId || 'unknown';
    this.classifyName = opts.classifyName || 'unknown';
    this.clientId = opts.clientId || 'unknown';
    this.permissionApis = opts.permissionApis || 'unknown';
}

module.exports = Authority;