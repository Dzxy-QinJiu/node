const querystring = require('querystring');

export default function(arg) {
    let url = arg.url;

    if (arg.query) {
        url += '?' + querystring.stringify(arg.query);
    }

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

    if (!_.isEmpty(arg.params)) {
        url = url.replace(/\:([a-zA-Z_\-0-9]+)/g, function($0, $1) {
            return arg.params[$1];
        });
    }

    const Deferred = $.Deferred();

    const config = {
        url: url,
        dataType: arg.dataType || 'json',
        type: type,
        data
    };
    if (arg.usePromise) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                ...config,
                success: function(result) {
                    resolve(result);
                },
                error: function(jqXHR, textStatus) {
                    let errMsg = Intl.get('contract.111', '获取数据失败');

                    //当textStatus为parsererror时，意味着错误信息的内容不是json格式的，一般是返回了html内容，此时不返回该错误信息，而是返回默认出错信息，否则返回具体错误信息
                    if (textStatus !== 'parsererror') {
                        if(jqXHR.responseJSON || jqXHR.responseJSON === ''){
                            errMsg = jqXHR.responseJSON;
                        } else {
                            errMsg = jqXHR.responseText;
                        }
                    }

                    reject(errMsg);
                }
            });
        });
    }

    $.ajax({
        ...config,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(jqXHR, textStatus) {
            let errMsg = Intl.get('contract.111', '获取数据失败');

            //当textStatus为parsererror时，意味着错误信息的内容不是json格式的，一般是返回了html内容，此时不返回该错误信息，而是返回默认出错信息，否则返回具体错误信息
            if (textStatus !== 'parsererror') {
                if(jqXHR.responseJSON || jqXHR.responseJSON === ''){
                    errMsg = jqXHR.responseJSON;
                } else {
                    errMsg = jqXHR.responseText;
                }
            }

            Deferred.reject(errMsg);
        }
    });

    return Deferred.promise();
}
