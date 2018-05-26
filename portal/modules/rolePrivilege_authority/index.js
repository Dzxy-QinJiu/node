module.exports = {
    path: 'authority',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};
