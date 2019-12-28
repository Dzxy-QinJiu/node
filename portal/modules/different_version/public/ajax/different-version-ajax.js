
exports.getDifferentVersions = () => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/different_versions',
        dataType: 'json',
        type: 'get',
        data: {
            page_size: 1000,
            sort_field: 'createTime',
            order: 'descend'
        },
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (err) => {
            Deferred.reject(err.responseJSON);
        }
    });
    return Deferred.promise();
};

exports.getVersionFunctionsById = (id) => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/different_version/functions',
        dataType: 'json',
        type: 'get',
        data: {
            id: id,
            with_permissions: true
        },
        success: (data) => {
            Deferred.resolve(data);
        },
        error: (err) => {
            Deferred.reject(err.responseJSON);
        }
    });
    return Deferred.promise();
};