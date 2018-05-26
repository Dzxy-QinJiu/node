module.exports = {
    path: 'user_info',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};
