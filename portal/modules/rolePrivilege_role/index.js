module.exports = {
    path: 'role',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};
