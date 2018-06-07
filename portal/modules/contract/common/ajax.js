export default function(arg) {
    let url = arg.url;
    const Deferred = $.Deferred();
    const type = arg.type || 'get';
    let data = '';
    if (arg.data) {
        if (type === 'get') {
            data = arg.data;
        }
        else {
            data = {
                reqData: JSON.stringify(arg.data)
            };
        }
    }
    if(!_.isEmpty(arg.params)) {
        url = url.replace(/\:([a-zA-Z_\-0-9]+)/g,function($0,$1) {
            return arg.params[$1];
        });
    }
    $.ajax({
        url: url,
        dataType: arg.dataType || 'json',
        type: type,
        data: data,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
}
