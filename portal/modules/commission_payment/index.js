module.exports = function(path) {
    return {
        path: path,
        getComponent: (location, cb) => {
            require.ensure([], (require) => {
                cb(null, require('./public'));
            });
        }
    };
};