/**
 * Created by xiaojinfeng on  2015/12/25 11:12 .
 */
function SalesStage(opts) {
    this.id = opts.id;
    this.name = opts.name || 'unknown';
    this.index = opts.index || 'unknown';
    this.description = opts.description || 'unknown';
}

module.exports = SalesStage;