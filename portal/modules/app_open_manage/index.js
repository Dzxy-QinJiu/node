module.exports = {
    path: 'openApp',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')); 
        });
    }
};