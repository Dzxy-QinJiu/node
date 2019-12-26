
exports.getDifferentVersions = () => {
    const Deferred = $.Deferred();
    $.ajax({
        url: '/rest/different_versions',
        dataType: 'json',
        type: 'get',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (err) => {
            Deferred.reject(err);
        }
    });
    return Deferred.promise();
};