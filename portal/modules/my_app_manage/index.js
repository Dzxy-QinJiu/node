module.exports = {
    path: 'my_app',
    getComponent: function(location, cb) {
        require.ensure([], function(require) {
            cb(null, require('./public'));
        });
    }
};