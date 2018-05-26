module.exports = {
    path: 'sales_stage',
    getComponent: function(location, cb) {
        require.ensure([], function(require) {
            cb(null, require('./public'));
        });
    }
};
