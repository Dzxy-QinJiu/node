/**
 * 销售月报
 */
module.exports = {
    path: 'analysis/monthly_report',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};