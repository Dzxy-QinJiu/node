module.exports = {
    path: 'realm',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')); 
        });
    }
};