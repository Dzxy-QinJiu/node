module.exports = {
    path: 'dashboard',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./dashboard')); 
        });
    }
};
