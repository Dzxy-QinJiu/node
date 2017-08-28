function UserInfo(opts) {
    this.userId = opts.userId || "unknown";
    this.userName = opts.userName || "unknown";
    this.nickName = opts.nickName || "unknown";
    this.password = opts.password || "unknown";
    this.rePasswd = opts.password || "unknown";
    this.newPasswd = opts.password || "unknown";
    this.phone = opts.phone || "unknown";
    this.email = opts.email || "unknown";
    this.roles = opts.roles || "unknown";
    this.rolesName = opts.rolesName || "unknown";
}

module.exports = UserInfo;
