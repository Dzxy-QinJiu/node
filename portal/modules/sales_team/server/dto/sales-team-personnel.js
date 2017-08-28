/**
 * Created by xiaojinfeng on 2016/04/08.
 */
function SalesTeamPersonnel(opts) {
    this.id = opts.id;
    this.teamId = opts.teamId || "unknown";
    this.personnelName = opts.personnelName || "unknown";
    this.personnelLogo = opts.personnelLogo || "unknown";
}

module.exports = SalesTeamPersonnel;