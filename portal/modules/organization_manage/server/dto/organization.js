/**
 * Created by wangliping on 2016/10/18.
 */
function SalesTeamPersonnel(opts) {
    this.id = opts.id;
    this.teamId = opts.teamId || 'unknown';
    this.personnelName = opts.personnelName || 'unknown';
    this.personnelLogo = opts.personnelLogo || 'unknown';
}

module.exports = SalesTeamPersonnel;