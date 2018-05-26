module.exports = {
    path: 'list',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')); 
        });
    }
};
