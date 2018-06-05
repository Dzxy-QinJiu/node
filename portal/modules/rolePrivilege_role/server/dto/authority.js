function Authority(opts) {
    this.id = opts.id;
    this.permissionId = opts.permissionId || 'unknown';
    this.authorityName = opts.authorityName || 'unknown';
    this.authorityDesc = opts.authorityDesc || 'unknown';
    this.authorityRemarks = opts.authorityRemarks || 'unknown';
}

module.exports = Authority;