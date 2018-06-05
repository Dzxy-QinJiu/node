module.exports = function(path) {
    return {
        path: path + '/:customerId',
        getComponent: function(location, cb) {
            require.ensure([], function(require) {
                cb(null, require('./public/views/app-user-customer-switch'));
            });
        }
    };
};
