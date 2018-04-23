module.exports = {
    path: 'sales/home',
    getComponent: function (location, cb) {
        require.ensure([], function (require) {
            cb(null, require('./public'));
        });
    }
};