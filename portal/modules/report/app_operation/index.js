module.exports = {
    path: 'app_operation',
    getComponent: function(location, cb) {
        require.ensure([], function(require) {
            cb(null, require('./main'));
        });
    }
};