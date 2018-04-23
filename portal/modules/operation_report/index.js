module.exports = {
    path: 'operation',
    getComponent: function (location, cb) {
        require.ensure([], function (require) {
            cb(null, require('./public'));
        });
    }
};