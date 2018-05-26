module.exports = {
    path: 'app',
    getComponent: function(location, cb) {
        require.ensure([], function(require) {
            cb(null, require('./public'));
        });
    }
};