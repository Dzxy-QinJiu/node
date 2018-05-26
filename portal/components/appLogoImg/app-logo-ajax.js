exports.getAppInfo = function(appId) {
    var Def = $.Deferred();
    $.ajax({
        type: 'get',
        url: '/rest/app/' + appId ,
        dataType: 'json',
        success: function(info) {
            Def.resolve(info);
        },
        error: function(obj) {
            Def.reject(obj);
        }
    });
    return Def.promise();
};