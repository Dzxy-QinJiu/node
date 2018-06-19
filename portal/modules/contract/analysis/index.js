module.exports = {
    path: 'analysis',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')); 
        });
    }
};
